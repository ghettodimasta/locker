import datetime
import os

import requests

from core.models import Order, update_fields
from locker.celery import app
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)
