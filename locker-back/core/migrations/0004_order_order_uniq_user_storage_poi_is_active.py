# Generated by Django 4.2 on 2023-04-04 15:34

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_storagepoi_storagepoi_uniq_name_user_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('created', 'Создан'), ('canceled', 'Отменен'), ('checked_in', 'Заселен'), ('checked_out', 'Выселен')], default='created', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bags', models.PositiveIntegerField(default=1)),
                ('check_in', models.DateTimeField(blank=True, null=True)),
                ('check_out', models.DateTimeField(blank=True, null=True)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('payment_type', models.CharField(choices=[('debit', 'Дебетовая карта'), ('sbp', 'СБП')], default='debit', max_length=100)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('storage_poi', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.storagepoi')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='order',
            constraint=models.UniqueConstraint(fields=('user', 'storage_poi'), name='uniq_user_storage_poi_is_active'),
        ),
    ]