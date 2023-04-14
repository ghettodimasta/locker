import decimal
import logging
import os
from datetime import datetime, timedelta

from celery import Celery, shared_task
import django
from django.core.cache import cache
import requests

from locker import settings

log = logging.getLogger()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "locker.settings")
django.setup()

# Import models here to avoid circular imports

app = Celery("locker")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


