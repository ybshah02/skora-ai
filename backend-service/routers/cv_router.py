import asyncio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List

from services.firebase_auth import authenticate_user
from services.cloud_storage import generate_cv_url, generate_file_url
from services.cv_generation import generate_cv_pdf, build_cv_descriptor_object, build_file_name, construct_missing_fields_prompt
from services.chat_assistant import ChatAssistant
from models import db

DOCUMENT_BUCKET = "skora-user-documents"
DOCUMENT_FILENAME_LENGTH = 30

PFP_BUCKET = "skora-pfps"
PFP_FILENAME_LENGTH = 30

ASSETS_BUCKET = "skora-assets"
ASSETS_FILENAME_LENGTH = 30

router = APIRouter()
db = db.DB()
chat_assistant = ChatAssistant(db)

class GeneratePromptResponse(BaseModel):
    msg: str = Field(..., description="URL to upload report to")

class UpdateCVRequest(BaseModel):
    msg: str = Field(..., description="User's response to assistants request for more information")

class DocumentInfo(BaseModel):
    file_name: str
    url: str

class RetrieveDocumentsResponse(BaseModel):
    documents: list[DocumentInfo]

async def generate_pdf_task(uid, cv, file_name):
    try:
        await generate_cv_pdf(cv, file_name)
        db.add_document_to_user(uid, file_name)
    except Exception as e:
        print(f'Error in CV Generation: {e}')
        raise

@router.get('/generate')
async def generate_cv(uid = Depends(authenticate_user)):
    #user_data = db.get_user_data(uid)
    #if 'generate_cv' not in user_data['purchased_services']:
    #    return {"error": "NO_PAYMENT"}

    user_profile = db.get_profile_record(uid)
    print(user_profile)
    if not user_profile:
        return {"error": "user not found"}

    pfp_file_name = db.get_pfp_for_user(uid)
    pfp_url = generate_file_url(pfp_file_name if pfp_file_name else 'contact.png', PFP_BUCKET)
    
    cv, has_missing_field = build_cv_descriptor_object(uid, user_profile, pfp_url)
    print(user_profile)

    if has_missing_field:
        return GeneratePromptResponse(msg=construct_missing_fields_prompt(uid, cv, user_profile))
    else:
        file_name = build_file_name(db.get_name_for_user(uid)) + '.pdf'
        max_retries = 5
        for retry_count in range(max_retries):
            try:
                task = asyncio.create_task(generate_pdf_task(uid, cv, file_name))
                await task
                return {"status": "success"}
            except Exception as e:
                print(f"Error encountered on attempt {retry_count + 1}: {e}")
                if retry_count < max_retries - 1:
                    print("Retrying...")
                    await asyncio.sleep(1)  # Optional delay between retries
                else:
                    print("Max retries reached. Failing...")
                    return {"error": "PDF generation failed after several attempts."}

@router.post('/update')
async def update_cv(request: UpdateCVRequest, uid: str = Depends(authenticate_user)):
    if not request.msg:
        raise HTTPException(status_code=400, detail="No message sent") 
    
    user_profile = db.get_profile_record(uid)
    print(user_profile)
    if not user_profile:
        return {"error": "user not found"}

    chat_assistant.send_message(uid, request.msg)  

    #user_data = db.get_user_data(uid)
    #if 'generate_cv' not in user_data['purchased_services']:
    #    return {"error": "NO_PAYMENT"}

    pfp_file_name = db.get_pfp_for_user(uid)
    pfp_url = generate_file_url(pfp_file_name if pfp_file_name else 'contact.png', PFP_BUCKET)
    
    cv, has_missing_field = build_cv_descriptor_object(uid, user_profile, pfp_url)
    print(user_profile)

    if has_missing_field:
        return GeneratePromptResponse(msg=construct_missing_fields_prompt(uid, cv, user_profile))
    else:
        print(db.get_name_for_user(uid))
        file_name = build_file_name(db.get_name_for_user(uid)) + '.pdf'
        max_retries = 5
        for retry_count in range(max_retries):
            try:
                task = asyncio.create_task(generate_pdf_task(uid, cv, file_name))
                await task
                return {"status": "success"}
            except Exception as e:
                print(f"Error encountered on attempt {retry_count + 1}: {e}")
                if retry_count < max_retries - 1:
                    print("Retrying...")
                    await asyncio.sleep(1)  # Optional delay between retries
                else:
                    print("Max retries reached. Failing...")
                    return {"error": "PDF generation failed after several attempts."}

@router.get('/get_documents')
def retrieve_documents(uid: str = Depends(authenticate_user)):

    paid = True
    if paid:
        # if paid retrieve entries from database
        file_names = db.get_documents_of_user(uid)
        if file_names:
            documents = [DocumentInfo(file_name=file_name, url=generate_cv_url(file_name)) for file_name in file_names]
        else:
            documents = []
    else:
        # if not paid retrieve entries from database
        file_names = db.get_documents_of_user(uid)
        if file_names:
            documents = [DocumentInfo(file_name=file_name, url='') for file_name in file_names]
        else:
            documents = []

    return RetrieveDocumentsResponse(documents=documents)


   