from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

import firebase_admin
from firebase_admin import auth

import uvicorn 

from routers.interest_router import router as interest_router
from routers.chat_router import router as chat_router 
from routers.user_router import router as user_router 
from routers.cv_router import router as cv_router
from routers.stripe_router import router as stripe_router

from services.firebase_auth import authenticate_user

app = FastAPI() 
origins = [
    "*"  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
app.include_router(chat_router, prefix="/chat")
app.include_router(user_router, prefix="/user")
app.include_router(cv_router, prefix="/cv")
app.include_router(interest_router, prefix="/interest")
app.include_router(stripe_router, prefix="/stripe")

firebase_admin.initialize_app()

@app.get("/hello")  
def wave():  
    return {"msg": "hello"}  

@app.get("/hello-auth")  
def wave(uid: str = Depends(authenticate_user)):  
    return {"msg": "hello", "uid": uid}  

if __name__ == '__main__': 
    uvicorn.run(app, host="", port=8080) 