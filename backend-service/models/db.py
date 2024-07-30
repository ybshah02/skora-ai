from dotenv import load_dotenv
import os
from datetime import datetime
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId

from services.firebase_auth import authenticate_user

load_dotenv()  
DB_URI = os.getenv("DB_URI")
DB_NAME = os.getenv("DB_NAME")

class DB:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(DB, cls).__new__(cls)
        return cls._instance

    def __init__(self, uri=DB_URI):
        self.client = MongoClient(uri, server_api=ServerApi('1'), tlsAllowInvalidCertificates=True)  
        self.database = self.client[DB_NAME]  
        self.users_collection = self.database['users']
        self.profiles_collection = self.database['profiles'] 
        self.interest_form_collection = self.database['interest_form']
        self.video_requests_collection = self.database['video_requests']

    ## USER COLLECTION ##

    def register_user(self, uid, name, email, thread_id):
        user_data = {
            'uid': uid,
            'name': name,
            'email': email,
            'thread_id': thread_id,
            'videos': [],
            'documents': [],
            'purchased_services': [],
        }
        self.users_collection.insert_one(user_data)
    
    def get_name_for_user(self, uid):
        user_record = self.users_collection.find_one({'uid': uid})
        
        if user_record:
            return user_record.get('name')
        else:
            return None
    
    def get_email_for_user(self, uid):
        user_record = self.users_collection.find_one({'uid': uid})
        
        if user_record:
            return user_record.get('email')
        else:
            return None
    
    def get_thread_for_user(self, uid):
        user_record = self.users_collection.find_one({'uid': uid})  

        if user_record:
            return user_record.get('thread_id')  
        else:
            return None  
    
    def create_video_request(self, uid, notes):
        video_request_data = {
            'uid': uid,
            'notes': notes,
            'paid': False
        }   
        result = self.video_requests_collection.insert_one(video_request_data)
        return result.inserted_id
    
    def update_video_request_to_paid(self, uid, video_request_id):
        if isinstance(video_request_id, str):
            video_request_id = ObjectId(video_request_id)

        self.video_requests_collection.update_one(
            {'_id': video_request_id, 'uid': uid},
            {'$set': {'paid': True}}
        )
    
    def add_video_to_user(self, uid, video_file_name):
        query = {'uid': uid} 
        update_data = {'$push': {'videos': video_file_name}}
        self.users_collection.update_one(query, update_data) 

    def add_document_to_user(self, uid, document_file_name):
        query = {'uid': uid}
        update_data = {'$push': {'documents': document_file_name}}
        self.users_collection.update_one(query, update_data)
    
    def get_documents_of_user(self, uid):
        user_record = self.users_collection.find_one({'uid': uid})

        if user_record:
            return user_record.get('documents', [])
        else:
            return []
    
    def get_videos_of_user(self, uid):
        user_record = self.users_collection.find_one({'uid': uid})

        if user_record:
            return user_record.get('videos', [])
        else:
            return []
        
    def add_purchased_service_to_user(self, auth_token, service_name):
        uid = authenticate_user(auth_token)
        query = {'uid': uid}
        update_data = {'$push': {'purchased_services': service_name}}
        self.users_collection.update_one(query, update_data)

    ## PROFILE COLLECTION ##

    def create_new_profile_record(self, uid):
        user_data = {
            'uid': uid, 
            'name': self.get_name_for_user(uid)
        }
        self.profiles_collection.insert_one(user_data) 

    def update_profile_record(self, uid, attribute, value):
        query = {'uid': uid} 
        update_data = {'$set': {attribute: value}}
        self.profiles_collection.update_one(query, update_data) 

    def get_profile_record(self, uid):
        return self.profiles_collection.find_one({'uid': uid})
    
    def add_pfp_to_user(self, uid, pfp_file_name):
        query = {'uid': uid} 
        update_data = {'$set': {'pfp': pfp_file_name}}
        self.profiles_collection.update_one(query, update_data)
    
    def get_pfp_for_user(self, uid):
        return self.profiles_collection.find_one({'uid': uid}).get('pfp')

    ## INTEREST FORM COLLECTION ##

    def add_interest(self, email):
        interest_data = {'email': email}
        query = {'email': email}
        update = {'$set': interest_data}
        self.interest_form_collection.update_one(query, update, upsert=True)