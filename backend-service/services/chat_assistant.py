import os
import json
import time
from openai import OpenAI
from dotenv import load_dotenv

with open('./services/retrieval/assistant_instructions.txt', 'r') as f:
    ASSISTANT_INSTRUCTIONS = f.read()

ASSISTANT_FILEPATH = './assistant.id'

class ChatAssistant:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ChatAssistant, cls).__new__(cls)
        return cls._instance

    def __init__(self, db):
        self.db = db 

        load_dotenv() 
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY')) 
        self.assistant_id = self.get_assistant_id() 
    
    def create_thread(self):
        thread = self.client.beta.threads.create() 
        return thread.id
    
    def add_assistant_message(self, uid, prompt):
        thread_id = self.db.get_thread_for_user(uid) 

        self.client.beta.threads.messages.create(
            thread_id=thread_id, role="assistant", content=prompt
        )

    def send_message(self, uid, user_message):
        thread_id = self.db.get_thread_for_user(uid) 

        self.client.beta.threads.messages.create(
            thread_id=thread_id, role="user", content=user_message
        ) 

        run = self.client.beta.threads.runs.create(thread_id=thread_id, assistant_id=self.assistant_id)
        timeout = 30
        while True:
            start_t = time.time() 
            run_status = self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if run_status.status == 'completed':
                break
            elif run_status.status == 'requires_action':
                tool_calls = run_status.required_action.submit_tool_outputs.tool_calls
                outputs = []
                for tool_call in tool_calls:
                    name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    self.db.update_profile_record(uid, arguments['key'], arguments['value'])
                    outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps({'success': 'true'})
                    })
                
                run = self.client.beta.threads.runs.submit_tool_outputs(
                    thread_id = thread_id,
                    run_id = run.id,
                    tool_outputs = outputs 
                )
            elif run_status.status == 'queued' or run_status.status == "in_progress":
                if time.time() - start_t > timeout:
                    break

        return self.get_last_assistant_message(thread_id)  

    def get_last_assistant_message(self, thread_id):
        messages_response = self.client.beta.threads.messages.list(thread_id=thread_id)
        messages = messages_response.data

        for message in messages:
            if message.role == 'assistant':
                assistant_message_content = " ".join(
                    content.text.value for content in message.content if hasattr(content, 'text')
                )
                return assistant_message_content.strip()
        return ""

    def get_message_history(self, uid):
        thread_id = self.db.get_thread_for_user(uid)  
        if thread_id == None:
            return []

        messages = self.client.beta.threads.messages.list(
            thread_id=thread_id
        ) 

        processed = []  
        for message in messages:
            values = []
            for content in message.content:
                values.append(content.text.value)

            processed.append({
                'role': message.role,
                'values': values
            })

        return processed
    
    def get_unprocessed_message_history(self, uid):
        thread_id = self.db.get_thread_for_user(uid)  
        if thread_id == None:
            return []

        messages = self.client.beta.threads.messages.list(
            thread_id=thread_id
        )

        processed = []  
        for message in messages:
            values = []
            for content in message.content:
                values.append(content.text.value)

            processed.append({
                'role': message.role,
                'content': ''.join(values)
            })

        return processed

    def get_assistant_id(self):
        if os.path.exists(ASSISTANT_FILEPATH):
            with open(ASSISTANT_FILEPATH, 'r') as file:
                return file.readline()
        else:
            agent_guide = self.client.files.create(
                file=open("../backend-service/services/retrieval/agent_guide.pdf", 'rb'),
                purpose="assistants"
            )
            athlete_input_data = self.client.files.create(
                file=open("../backend-service/services/retrieval/athlete_input_data.pdf", 'rb'),
                purpose="assistants"
            )
            process = self.client.files.create(
                file=open("../backend-service/services/retrieval/process.pdf", 'rb'),
                purpose="assistants"
            )

            assistant = self.client.beta.assistants.create(
                name="sKora-AI",
                instructions=ASSISTANT_INSTRUCTIONS,
                #model="gpt-4-1106-preview",
                model="gpt-3.5-turbo-0125",
                tools=[
                    {"type": "retrieval"},
                    {
                        "type": "function",
                        "function": {
                            "name": "update_user_record",
                            "description": "Add a single player attribute to its record in the database",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "key": {"type":"string", "description":"The name of the attribute we would like to add, in English ONLY"},
                                    "value": {"type":"string", "description":"The value corresponding to the attribute we would like to add, in English ONLY"}
                                },
                                "required": ["key", "value"]
                            }
                        }
                    }
                ],
                file_ids=[agent_guide.id, athlete_input_data.id, process.id]
            )
            
            with open(ASSISTANT_FILEPATH, 'w') as file:
                file.write(assistant.id)

            return assistant.id
