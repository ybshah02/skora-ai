import random 
import string 

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from typing import List

from models.db import DB

from services.firebase_auth import authenticate_user
from services.chat_assistant import ChatAssistant
from services.cloud_storage import generate_file_url, upload_file

PFP_BUCKET = "skora-pfps"
PFP_FILENAME_LENGTH = 30

VIDEOS_BUCKET = "skora-user-videos"

router = APIRouter()
db = DB()
chat_assistant = ChatAssistant(db)

class RegisterRequest(BaseModel):
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="email of user")

class GeneratePfpUploadUrlRequest(BaseModel):
    filetype: str = Field(..., description="Type of file to upload")

class GeneratePfpUploadUrlResponse(BaseModel):
    upload_url: str = Field(..., description="URL to upload video to")

class GenerateVideoCVRequest(BaseModel):
    notes: str = Field(..., description="notes from user on video creation")
    files: List[UploadFile] = File(...)

class PayVideoCVRequest(BaseModel):
    id: str = Field(..., description="id of generate video cv request")

@router.post("/register")
def register_user_endpoint(request: RegisterRequest, uid = Depends(authenticate_user)):

    thread_id = chat_assistant.create_thread()

    print(request)

    db.register_user(uid, request.name, request.email, thread_id)
    db.create_new_profile_record(uid)
    chat_assistant.send_message(uid, "Hello! I would like to build a CV for my pursuit in professional soccer/football.") 

    return {"status": "SUCCESS"}

@router.get("/get_profile")
def get_profile_endpoint(uid = Depends(authenticate_user)):
    profile_record = db.get_profile_record(uid)
    profile_record.pop('_id', None)
    return profile_record

@router.get("/get_name")
def get_name_endpoint(uid = Depends(authenticate_user)):
    return db.get_name_for_user(uid)

@router.get("/get_email")
def get_name_endpoint(uid = Depends(authenticate_user)):
    return db.get_email_for_user(uid)

@router.post("/generate_pfp")
def upload_pfp_endpoint(file: UploadFile = File(...), uid = Depends(authenticate_user)):
    if file.content_type not in ['image/png', 'image/jpeg']:
        return HTTPException(status_code=400, detail="Invalid file type buddy....")
    
    upload_file(file.file, file.filename, file.content_type, PFP_BUCKET)
    db.add_pfp_to_user(uid, file.filename)
    return {"status": "success"}

@router.get("/get_pfp")
def get_pfp_endpoint(uid = Depends(authenticate_user)):
    try:
        file_name = db.get_pfp_for_user(uid)
    except Exception as e:
        file_name = 'contact.png'
    
    upload_url = generate_file_url(file_name, PFP_BUCKET)

    return GeneratePfpUploadUrlResponse(upload_url=upload_url)

@router.post("/request_video_cv")
def upload_video_endpoint(request:GenerateVideoCVRequest, uid = Depends(authenticate_user)):
    
    for file in request.files:
        if file.content_type not in ['video/mp4', 'video/quicktime', 'video/mpeg']:
            return HTTPException(status_code=400, detail="Invalid file type buddy....")
    
        upload_file(file.file, file.filename, file.content_type, VIDEOS_BUCKET)
        db.add_video_to_user(uid, file.filename)
    
    id = db.create_video_request(uid, request.notes)

    return {"id": id}

@router.post("/pay_request_video_cv")
def pay_video_cv_endpoint(request: PayVideoCVRequest, uid = Depends(authenticate_user)):
    if request.id:
        db.update_video_request_to_paid(uid, request.id)
    
    return {"status": "success"}


@router.get("/get_videos")
def get_video_endpoint(uid = Depends(authenticate_user)):
    try:
        file_name = db.get_pfp_for_user(uid)
    except Exception as e:
        file_name = 'contact.png'
    
    upload_url = generate_file_url(file_name, VIDEOS_BUCKET)

    return GeneratePfpUploadUrlResponse(upload_url=upload_url)