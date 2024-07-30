from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from models import db
from services.chat_assistant import ChatAssistant
from services.firebase_auth import authenticate_user

router = APIRouter() 
db = db.DB()
chat_assistant = ChatAssistant(db)

class SendMessageRequest(BaseModel): 
    msg: str = Field(..., description="Message content") 

class SendMessageResponse(BaseModel):
    msg: str = Field(..., description="Message content") 

class GetMessageResponse(BaseModel):  
    msgs: list = Field(..., description="List of messages") 
 
@router.post('/send_message')
async def send_message(request: SendMessageRequest, uid: str = Depends(authenticate_user)): 
    if not request.msg:
        raise HTTPException(status_code=400, detail="No message sent") 

    chat_response = chat_assistant.send_message(uid, request.msg)  

    return SendMessageResponse(msg=chat_response)  

@router.post('/get_history')  
async def get_history(uid: str = Depends(authenticate_user)): 
    messages = chat_assistant.get_message_history(uid)
    return GetMessageResponse(msgs=messages) 
