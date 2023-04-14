import datetime
import os

import requests

from core.models import Order, update_fields
from locker.celery import app
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@app.task
def create_qiwi_form(order_id):
    logger.info("create_qiwi_form")
    order = Order.objects.get(pk=order_id)
    lifetime = datetime.datetime.now() + datetime.timedelta(minutes=30)
    response = requests.get(
        params=dict(
            publicKey=os.environ['QIWI_TOKEN_PUBLIC'],
            billId=order_id,
            amount=1,
            email="customer@lockspot.com",
            successUrl="http://localhost:3000",
            customFields=dict(
                paySourcesFilter="qw,card"
            ),
            lifetime=lifetime.isoformat()
        ),
        url=f"https://oplata.qiwi.com/create"
    )
    logger.info("RESPONSE", response.url)
    update_fields(order, form_url=response.url)