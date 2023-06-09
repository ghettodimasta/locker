# Generated by Django 4.2 on 2023-04-19 12:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_alter_order_is_active_alter_order_pin_code'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='order',
            name='uniq_pin_code_storage_poi',
        ),
        migrations.AlterField(
            model_name='order',
            name='pin_code',
            field=models.CharField(db_index=True, default='465640', editable=False, max_length=6),
        ),
        migrations.AddConstraint(
            model_name='order',
            constraint=models.UniqueConstraint(fields=('pin_code', 'storage_poi', 'is_active'), name='uniq_pin_code_storage_poi'),
        ),
    ]
