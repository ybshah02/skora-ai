import datetime
import logging
import os

from dotenv import load_dotenv

from google.cloud import storage
from google.oauth2 import service_account

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  
credentials_file = os.getenv("SERVICE_CREDENTIALS_FILE")
if credentials_file:
    credentials = service_account.Credentials.from_service_account_file(credentials_file)

def generate_upload_signed_url_v4(bucket_name, blob_name, method, expiration_time=15):
    storage_client = storage.Client()
    bucket = storage_client.bucket('skora-cv-test')
    blob = bucket.blob(blob_name)

    if credentials_file:
        url = blob.generate_signed_url(
            version = "v4",
            expiration = datetime.timedelta(minutes = expiration_time),
            method = method,
            content_type = "application/octet-stream",
            credentials = credentials
        )
    else:
        url = blob.generate_signed_url(
            version = "v4",
            expiration = datetime.timedelta(minutes = expiration_time),
            method = method,
            content_type = "application/octet-stream",
        )

    return url

## UPLOAD CV ##

def upload_cv(pdf, file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket('skora-user-documents')

    blob = bucket.blob(file_name)
    blob.upload_from_string(pdf, content_type='application/pdf')

def generate_cv_url(pdf):
    storage_client = storage.Client()
    volume = storage_client.get_bucket('skora-user-documents')
    blob = volume.blob(pdf)

    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),
        method="GET",
        credentials=credentials
    )
    
    return url

## UPLOAD FILE ##

def upload_file(file, file_name, content_type, bucket_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)

    blob = bucket.blob(file_name)
    blob.upload_from_file(file, content_type=content_type)

def generate_file_url(file_name, bucket_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),
        method='GET',
        credentials=credentials
    )
    
    return url