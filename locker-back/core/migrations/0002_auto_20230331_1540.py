# Generated by Django 4.1.7 on 2023-03-31 15:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    def make_roles(apps, schema_editor):
        Role = apps.get_model('core', 'Role')
        Role.objects.bulk_create(
            [Role(name='Storage'), Role(name='User'), Role(name='Admin')]
        )

    operations = [
        migrations.RunPython(make_roles),
    ]
