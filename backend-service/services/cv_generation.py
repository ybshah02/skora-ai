from openai import OpenAI
from dotenv import load_dotenv
from pyppeteer import launch
from threading import Thread

import logging
import os
import json
import asyncio
import tracemalloc

from models import db
from services.cv.html_formatter import HTMLTemplateFormatter
from services.chat_assistant import ChatAssistant

from services.cloud_storage import upload_cv
#from cv.html_formatter import HTMLTemplateFormatter

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PERSONAL_STATEMENT_MIN_LENGTH = 180
PERSONAL_SATATEMENT_MAX_LENGTH = 330

CLUB_AND_AWARDS_MIN_LENGTH = 630
CLUB_AND_AWARDS_MAX_LENGTH = 880

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
db = db.DB()
chat_assistant = ChatAssistant(db)

def manage_length_of_personal_statement(personal_statement):

    # Manage length of personal statement
    new_personal_statement = personal_statement
    personal_statement_length = len(personal_statement)
    count = 0
    while (personal_statement_length > PERSONAL_SATATEMENT_MAX_LENGTH or personal_statement_length < PERSONAL_STATEMENT_MIN_LENGTH) and count <= 5:

        action = ''
        if personal_statement_length > PERSONAL_SATATEMENT_MAX_LENGTH:
            action = 'shorten'
        elif personal_statement_length < PERSONAL_STATEMENT_MIN_LENGTH:
            action = 'lengthen'

        prompt = f"""
        
        Here is a personal statement for the player:
        {personal_statement}
        Please {action} the personal statement so that it is greater than 130 characters, but no more than 280 characters.
        Please only include the personal statement - do not add any reasoning or extra content before or after. 
        
        """
        response = client.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                messages=[
                    {"role": "system", "content": 'The assistant has been programmed to serve as a sports agent for aspiring soccer players worldwide. You are helping build a cover letter for a soccer player. Please answer with that in context.'},
                    {"role": "user", "content": f"{prompt}"},
                ],
        )

        new_personal_statement = response.choices[0].message.content
        personal_statement_length = len(new_personal_statement)
        count += 1
    
    return new_personal_statement

def manage_length_of_club_and_awards(club_experiences, awards):

    def calculate_club_and_awards_length(club_experiences, awards):
        club_and_awards_length = 0
        for club_experience in club_experiences:
            club_and_awards_length += len(club_experience["club_name"])
            for detail in club_experience["details"]:
                club_and_awards_length += len(detail)

        for award in awards:
            club_and_awards_length += len(award["award"])
        
        return club_and_awards_length
    
    new_club_experiences = club_experiences
    new_awards = awards
    
    club_and_awards_length = calculate_club_and_awards_length(club_experiences, awards)
    count = 0
    while (club_and_awards_length > CLUB_AND_AWARDS_MAX_LENGTH or club_and_awards_length < CLUB_AND_AWARDS_MIN_LENGTH) and count <= 5:

        action = ''
        if club_and_awards_length > CLUB_AND_AWARDS_MAX_LENGTH:
            action = 'shorten'
        elif club_and_awards_length < CLUB_AND_AWARDS_MIN_LENGTH:
            action = 'lengthen'


        response_object = """
        
        {
            "club_experiences": [
                {"club_name": "Club Name", "year": "Year", "details": ["Participation Details 1", "Participation Details 2", ...]}
                ...
            ],
            "awards": [
                {"award": "Award Name", "year": "Year Won"}
                ...
            ], 
        }

        """
        prompt = f"""
        
        Here is the club experience and awards objects for the player:
        Club experience: 
        {club_experiences}

        Awards:
        {awards}

        Please {action} the club_experience and awards objects depending so that the total of the names + details + award name + year is greater than {CLUB_AND_AWARDS_MIN_LENGTH} characters, but no more than {CLUB_AND_AWARDS_MAX_LENGTH} characters.
        Please respond with a singular JSON object in the following format

        {response_object}
        
        Please do not add any reasoning or extra content before or after. The only response should be the object with the altered changes.
        Each detail for club experience should have a limit of 30 characters
        If there are too many club experiences (>5) or too many awards (>10) such that it is impossible to meet the required thresholds for character count,
        please determine which award / club_experience is the least significant to the CV profile, and delete it from the records. Then you can have more freedom
        to add more content to the other club_experiences, or shorten it without communicating the important information.
        """

        response = client.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                messages=[
                    {"role": "system", "content": 'The assistant has been programmed to serve as a sports agent for aspiring soccer players worldwide. You are helping build a cover letter for a soccer player. Please answer with that in context.'},
                    {"role": "user", "content": f"{prompt}"},
                ],
        )

        res = response.choices[0].message.content

        if res.startswith("```json"):
            res = res.strip()[7:-3] 

        response_object = json.loads(res, strict=False)
        new_club_experiences, new_awards = response_object['club_experiences'], response_object['awards']
        club_and_awards_length = calculate_club_and_awards_length(new_club_experiences, new_awards)
        count += 1

    return new_club_experiences, new_awards


def build_cv_descriptor_object(uid, user_profile, pfp_url):
    
    # Get system message
    with open('./services/cv/system_msg.txt', 'r') as f:
        system_msg = f.read()
    
    messages = [
        {"role": "system", "content": system_msg}
    ]

    print(chat_assistant.get_unprocessed_message_history(uid))

    messages.extend(chat_assistant.get_unprocessed_message_history(uid))
    messages.append({"role": "user", "content": f"Please use the message history given to generate the object desired in the system message."},)

    try:
        response = client.chat.completions.create(
            model="gpt-4-0125-preview",
            response_format={ "type": "json_object" },
            messages=messages,
        )
        res = response.choices[0].message.content
        if res.startswith("```json"):
            res = res.strip()[7:-3]

        logger.info(f'{res}')

        cv_descriptor_object = json.loads(res, strict=False)
        cv_descriptor_object['profile_image'] = pfp_url

        missing_fields = find_missing_fields(cv_descriptor_object)
        print(missing_fields)
        response = client.chat.completions.create(
            model="gpt-4-0125-preview",
            messages=[
                {"role": "system", "content": f"Using the user_profile object uploaded here {user_profile}, please remove any fields from missing_fields that will be inputted by the user that are specified as 'None' in user_profile. Please respond with a single array as the response. If the array is empty after analysis, respond with an empty array"},
                {"role": "user", "content": f"Here are the missing fields {missing_fields}"},
            ],
        )
        missing_fields = json.loads(response.choices[0].message.content)
        if missing_fields:
            return missing_fields, True
        else:
            return cv_descriptor_object, False    

    except Exception as e:
        print(f"An error occurred: {e}")

def find_missing_fields(data, prefix=""):
    missing_fields = []
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                missing_fields.extend(find_missing_fields(value, prefix=f"{prefix}{key}."))
            elif value == "":
                missing_fields.append(f"{prefix}{key}")
    elif isinstance(data, list):
        if not data:
            missing_fields.append(prefix)
        else:
            for index, item in enumerate(data):
                if isinstance(item, (dict, list)):
                    missing_fields.extend(find_missing_fields(item, prefix=f"{prefix}[{index}]."))

    return missing_fields

def construct_missing_fields_prompt(uid, missing_fields, user_profile):

    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    print(user_profile)

    system_msg = f"""
        The assistant has been programmed to serve as a sports agent for aspiring soccer players worldwide. 
        Given the missing_fields object that you will receive, please generate a prompt that asks the user to update their information.
        Ask only one field at a time. Please keep it short to a 2-3 sentences max.
    """

    response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": f"Here is the user profile: {user_profile}. Here are the {missing_fields}"},
                ],
            )
    
    prompt = response.choices[0].message.content
    chat_assistant.add_assistant_message(uid, prompt)
    return prompt

async def generate_pdf(html_content, file_name):
    os.environ['PYPPETEER_DEBUG'] = '1'
    try:
        logger.info('launching browser')
        browser = await launch(
            executablePath='/usr/bin/chromium',
            args=[
                '--headless'
                '--disable-gpu',
                '--no-sandbox',
            ],
            dumpio=True,
        )

        page = await browser.newPage()
        await page.setJavaScriptEnabled(True)
        await page.setContent(html_content)
        await asyncio.sleep(30)

        pdf_bytes = await page.pdf({'format': 'A4', 'printBackground': True, 'margin': {'top': '0mm', 'right': '0mm', 'bottom': '0mm', 'left': '0mm'}})
        await upload_cv(pdf_bytes, file_name)

        logger.info(f'Document Generated at {file_name}')
        await browser.close()

    except Exception as e:
        try:
            try:
                await page.close()
            except:
                pass
            try:
                await browser.disconnect()
            except:
                pass
            await browser.close()
        except:
            pass

async def generate_cv_pdf(cv_descriptor_object, file_name):
    logger.info(f'Starting generation of {file_name}')
    template = './services/cv/blue-template.html'
    template_formatter = HTMLTemplateFormatter(template)

    logger.info('Formatted template')

    filled_html = template_formatter.fill_template(
        profile_image=cv_descriptor_object.get('profile_image', 'contact.png'),
        club_experiences=cv_descriptor_object.get('club_experiences'),
        awards=cv_descriptor_object.get('awards', None),
        statistics=cv_descriptor_object.get('statistics', None),
        name=cv_descriptor_object.get('name'),
        nationality=cv_descriptor_object.get('nationality', None),
        date_of_birth=cv_descriptor_object.get('date_of_birth', None),
        position_main=cv_descriptor_object.get('position'),
        dominant_foot=cv_descriptor_object.get('dominant_foot'),
        social_link=next((link['link'] for link in cv_descriptor_object.get('social_media_links', [])), None),
        personal_statement=cv_descriptor_object.get('personal_statement'),
        education=cv_descriptor_object.get('education', None),
        languages=cv_descriptor_object.get('languages', None),
        references=cv_descriptor_object.get('references', None),
        physical_attributes=cv_descriptor_object.get('physical_attributes', []),
        skills=cv_descriptor_object.get('skills', None),
        age=cv_descriptor_object.get('age', None),
        svg_position=cv_descriptor_object.get('norm_position')
    )

    logger.info('Template filled')

    try:
        logger.info('Generating PDF')
        await generate_pdf(filled_html, file_name)
        logger.info('Generated PDF')
    except Exception as e:
        print(f'Exception: {e}')

def build_file_name(name):
    response = client.chat.completions.create(
                model="gpt-3.5-turbo-1106",
                messages=[
                    {"role": "system", "content": 'Please assist me in my tasks.'},
                    {"role": "user", "content": f"Please give me a document title using my name: {name}. Please give it in the structure FirstName_LastName_CV - don't give anything except the resume name."},
                ],
        )
    
    resume_title = response.choices[0].message.content
    return resume_title