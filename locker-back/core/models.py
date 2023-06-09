import datetime
import logging
import os
import random
import string
import uuid
from _decimal import Decimal

from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.core.mail import send_mail
from django.core.validators import RegexValidator, MinValueValidator
from django.db import models, transaction
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.crypto import md5
from transliterate.utils import _

from core.validators import address_validate
from locker import settings
from dadata import Dadata
from model_utils import FieldTracker

from locker.utils import update_fields, create_qiwi_from

logger = logging.getLogger(__name__)


# Create your models here.

class Role(models.Model):
    roles = (
        ("Storage", "Хранилище"),
        ("User", "Пользователь"),
        ("Admin", "Администратор"),
    )
    name = models.CharField(max_length=50, choices=roles, unique=True)

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def _create_user(self, email, password, role, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.role = role
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        role = Role.objects.get(name='Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, role, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    email = models.EmailField(null=True, db_index=True)
    is_active = models.BooleanField(default=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    activation_token = models.CharField(max_length=32, null=True, editable=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email'], name='uniq_email_is_active')
        ]


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        instance.activation_token = md5(instance.email.encode()).hexdigest()
        instance.save()
        from .tasks import send_auth_mail
        send_auth_mail.delay(instance.email, instance.activation_token, settings.EMAIL_FROM)


class StoragePoi(models.Model):
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    name = models.CharField(max_length=100)
    description = models.TextField(verbose_name='Описание')
    point = gis_models.PointField(null=True, db_index=True, verbose_name="Где находится на карте", blank=True)
    is_active = models.BooleanField(default=True, db_index=True, verbose_name="Активна")
    opening_hours = models.TimeField(null=True, blank=True, verbose_name="Время открытия")
    closing_hours = models.TimeField(null=True, blank=True, verbose_name="Время закрытия")
    phone = models.DecimalField(null=True, blank=True, max_digits=15, decimal_places=0, verbose_name="Телефон",
                                help_text="В формате 71111111111", validators=[phone_regex])
    url = models.URLField(null=True, blank=True, verbose_name="Ссылка на сайт")
    address = models.TextField(null=True, verbose_name="Адрес", validators=[address_validate])
    address_for_cleaning = models.TextField(null=True, editable=False, db_index=True)
    address_clean = models.TextField(null=True, verbose_name="Стандартизированный адрес", editable=False, db_index=True)
    dadata_updated_at = models.DateTimeField(null=True, db_index=True, editable=False)
    dadata_info = models.JSONField(null=True, editable=False)
    dadata_log = models.TextField(null=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    available_bags = models.IntegerField(default=10, verbose_name="Количество доступных мешков",
                                         validators=[MinValueValidator(0)])

    @property
    def lat(self):
        return self.point.y if self.point else None

    @property
    def lon(self):
        return self.point.x if self.point else None

    tracker = FieldTracker()

    def __str__(self):
        return f"{self.id}: {self.name}"

    @tracker(fields=("address", "is_active"))
    def save(self, *args, **kwargs):
        if self.tracker.has_changed("address"):
            self.update_point_from_address(do_save=False)

        super().save(*args, **kwargs)

    @tracker(fields=("available_bags", "is_active"))
    def save(self, *args, **kwargs):
        if self.available_bags == 0:
            self.is_active = False
        super().save(*args, **kwargs)

    def update_point_from_address(self, do_save=True):
        dadata = Dadata(settings.DADATA_TOKEN, settings.DADATA_SECRET)

        res = dict()
        address_clean = None
        new_point = None

        for address in [self.address, self.name]:
            dadata_log = None

            if not address or len(address.strip()) == 0:
                continue

            logger.info(f"dadata cleaning: {address}")
            res = dadata.clean(name="address", source=address)

            if int(res["qc"]) != 0:
                dadata_log = f"Accuracy {res['qc']} > 0"
                continue

            if res.get("geo_lon") and res.get("geo_lat"):
                new_point = Point(float(res["geo_lon"]), float(res["geo_lat"]))

            address_clean = res["result"]
            break

        if not new_point:
            logger.info("Skipping")
            return

        params = dict(
            dadata_updated_at=datetime.datetime.now(),
            dadata_info=res,
            dadata_log=dadata_log,
            address_for_cleaning=self.address,
            address_clean=address_clean,
            point=new_point,
        )

        if do_save:
            update_fields(self, **params)
        else:
            for k, v in params.items():
                setattr(self, k, v)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'user'], name='uniq_name_user_is_active')
        ]


class Order(models.Model):
    ORDER_STATUS_CHOICES = (
        ("created", "Создан"),
        ("payed", "Оплачен"),
        ("canceled", "Отменен"),
        ("checked_in", "Заселен"),
        ("checked_out", "Выселен"),
    )

    PAYMENT_TYPE_CHOICES = (
        ("debit", "Дебетовая карта"),
        ("sbp", "СБП"),
        ("qiwi", "QIWI"),
    )

    status = models.CharField(max_length=100, choices=ORDER_STATUS_CHOICES, default='created')

    user = models.ForeignKey(User, on_delete=models.PROTECT)
    storage_poi = models.ForeignKey(StoragePoi, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    bags = models.PositiveIntegerField(default=1)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_type = models.CharField(max_length=100, choices=PAYMENT_TYPE_CHOICES, default='debit')
    is_active = models.BooleanField(default=False, db_index=True)
    is_payed = models.BooleanField(default=False, db_index=True)
    pin_code = models.CharField(default=''.join(random.choices(string.digits, k=6)), max_length=6, editable=False, db_index=True)
    is_payed_for_extra_days = models.BooleanField(default=None, db_index=True, null=True)
    tracker = FieldTracker()

    @property
    def check_url(self):
        return f"127.0.0.1:8000/api/v1/check-order/" if settings.DEBUG else f"{os.getenv('DOMAIN_NAME')}/api/v1/check-order/"

    @property
    def is_expired(self):
        return self.check_out < timezone.now()

    @property
    def expired_days(self):
        return (timezone.now() - self.check_out).days + 1

    @property
    def extra_amount(self):
        return Decimal(self.expired_days * 500 * self.bags).quantize(Decimal('1.00'))

    def __str__(self):
        return f"{self.id}: {self.user} - {self.storage_poi}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['pin_code', 'storage_poi', 'is_active'], name='uniq_pin_code_storage_poi')
        ]

    @tracker(fields=("status", "is_payed"))
    def save(self, *args, **kwargs):
        if self.tracker.has_changed("status"):
            if self.status == "checked_in":
                self.is_active = True
            elif self.status == "checked_out":
                self.is_active = False
                self.storage_poi.available_bags += self.bags
                self.storage_poi.save()

        super().save(*args, **kwargs)

    @property
    def is_available_for_check_in(self):
        return self.check_in <= timezone.now() <= self.check_out

    def recalculated_amount(self):
        self.amount = self.bags * 500 * (self.check_out.day - self.check_in.day + 1)
        self.save()


@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    with transaction.atomic():
        if created:
            instance.pin_code = repr(uuid.uuid4().int)[:6]
            instance.amount = instance.bags * 500 * (instance.check_out.day - instance.check_in.day + 1)
            instance.storage_poi.available_bags -= instance.bags
            instance.storage_poi.save()
            instance.save()
