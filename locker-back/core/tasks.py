import datetime
import os

import requests
from django.core.mail import send_mail

from core.models import Order, update_fields
from locker.celery import app
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@app.task
def send_auth_mail(email, activation_token, email_from):
    send_mail(
        from_email=email_from,
        message="Hello " + email + ",\n\n" + "Please activate your account by clicking the link below:\n\n" + "http://localhost:3000/activate/" + activation_token + "\n\n" + "Thank you for using our service!\n\n" + "Best regards,\n" + "LockSpot Team",
        subject=f"Activate Account",
        recipient_list=[email]
    )

