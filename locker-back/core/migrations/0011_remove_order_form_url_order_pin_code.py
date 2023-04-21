# Generated by Django 4.2 on 2023-04-19 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_remove_order_uniq_user_storage_poi_is_active_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='form_url',
        ),
        migrations.AddField(
            model_name='order',
            name='pin_code',
            field=models.CharField(db_index=True, default='527408', editable=False, max_length=6, unique=True),
        ),
    ]