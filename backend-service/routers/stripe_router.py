from fastapi import APIRouter, Request, HTTPException
import stripe
import os
from dotenv import load_dotenv
from stripe import Webhook

from models import db

load_dotenv()

#TODO: read from .env
STRIPE_WEBHOOK_SECRET = 'whsec_6e1fd7ac60292a0b9242e795d9a6617f0cf7218be159dd39389e5046ce3ea682'

router = APIRouter()
db = db.DB()

@router.route('/webhook', methods=['POST'])
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    # Verify webhook signature
    try:
        event = Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event_type = event['type']
    event_data = event['data']['object']

    if event_type == 'payment_intent.succeeded':
        auth_token = event_data['metadata']['auth_token']
        product_id = event_data['metadata']['product_id']

        db.add_purchased_service(auth_token, product_id)

    return {'status': 'success'}
