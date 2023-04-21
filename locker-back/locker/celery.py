import decimal
import logging
import os
from datetime import datetime, timedelta

from celery import Celery, shared_task
import django
from django.core.cache import cache
import requests
from django.utils import timezone

from locker import settings

log = logging.getLogger()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "locker.settings")
django.setup()

# Import models here to avoid circular imports

from core.models import Order

app = Celery("locker")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task
def check_orders():
    deleted = Order.objects.filter(check_out__lte=timezone.now(), status='created').delete()
    log.info(f"[DELETED ORDERS] {deleted}")
    checked_in_orders = Order.objects.filter(status='checked_in', is_payed=True)
    for order in checked_in_orders:
        if order.is_expired:
            order.is_payed_for_extra_days = False
            order.save()


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(1, check_orders.signature())