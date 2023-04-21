# Generated by Django 4.2 on 2023-04-20 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_alter_order_is_payed_for_extra_days_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='is_payed_for_extra_days',
            field=models.BooleanField(db_index=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='pin_code',
            field=models.CharField(db_index=True, default='231830', editable=False, max_length=6),
        ),
    ]