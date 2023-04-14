import datetime
import os

import qrcode
from io import BytesIO

import requests

def update_fields(model, **kwargs):
    fields = list(kwargs.keys())

    for key in fields:
        setattr(model, key, kwargs[key])

    model.save(update_fields=fields)


def generate_qr_code(address):
    # Define the QR code object
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    # Add the address to the QR code
    qr.add_data(address)

    # Make sure the QR code is complete and render it
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Return the image object

    buffer = BytesIO()
    img.save(buffer)
    buffer.seek(0)

    return buffer.getvalue()


def create_qiwi_from(order_id, amount):
    lifetime = datetime.datetime.now() + datetime.timedelta(minutes=30)
    response = requests.get(
        params=dict(
            publicKey=os.environ['QIWI_TOKEN_PUBLIC'],
            billId=order_id,
            amount=amount,
            email="customer@lockspot.com",
            successUrl="http://localhost:3000",
            customFields=dict(
                paySourcesFilter="qw,card"
            ),
            lifetime=lifetime.isoformat()
        ),
        url=f"https://oplata.qiwi.com/create"
    )
    return response.url