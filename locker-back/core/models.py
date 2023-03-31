from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from transliterate.utils import _


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


class User(AbstractBaseUser):
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    email = models.EmailField(null=True, db_index=True)
    is_active = models.BooleanField(default=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email'], name='uniq_email_is_active')
        ]