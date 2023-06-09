# Generated by Django 4.2 on 2023-04-14 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_alter_order_payment_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='is_payed',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('created', 'Создан'), ('payed', 'Оплачен'), ('canceled', 'Отменен'), ('checked_in', 'Заселен'), ('checked_out', 'Выселен')], default='created', max_length=100),
        ),
    ]
