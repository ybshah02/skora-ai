from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Frame, Paragraph, Spacer, Image, KeepInFrame
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def generate_cv_pdf(cv_descriptor_object, filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    #pdfmetrics.registerFont(TTFont('Inter', '/services/cv/Inter/static/Inter.ttf'))
    #pdfmetrics.registerFont(TTFont('Inter-Bold', '/services/cv/Inter/static/Inter-Bold.ttf'))
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='SummaryStyle', fontSize=10, spaceAfter=10))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=12, spaceAfter=6, textColor=colors.HexColor("#000000"), fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='ClubName', fontSize=10, spaceAfter=6, textColor=colors.HexColor("#FF4100"), fontName='Helvetica-Bold'))
    bullet_style = ParagraphStyle('BulletStyle', parent=styles['Normal'], leftIndent=15, bulletIndent=5, spaceBefore=2, bulletFontName='Symbol', bulletFontSize=10, bulletText='•')

    # Header section with profile photo and name
    c.setFillColor(colors.HexColor("#FF4100"))
    c.rect(-1, height - 2 * inch, width + 2, 2 * inch, stroke=0, fill=1)
    #if cv_descriptor_object['profile_photo']:
    #    c.drawImage(cv_descriptor_object['profile_photo'], 30, height - 1.75 * inch, 100, 100, preserveAspectRatio=True, mask='auto')

    # Name and Personal Details
    c.setFillColor(colors.whitesmoke)
    text = c.beginText(160, height - 0.5 * inch)
    text.setFont("Helvetica-Bold", 16)
    text.textLine(cv_descriptor_object['name'])
    text.setFont("Helvetica", 12)
    text.textLine(f"Nationality: {cv_descriptor_object['nationality']}")
    text.textLine(f"Residence: {cv_descriptor_object['residence']}")
    text.textLine(f"Age: {cv_descriptor_object['age']}")
    text.textLine(f"Date of Birth: {cv_descriptor_object['date_of_birth']}")
    text.textLine(f"Social Media: {cv_descriptor_object['social_media_links']}")
    c.drawText(text)

    # Personal Summary
    # summary_text = cv_descriptor_object['personal_summary']
    # summary_height = 100 
    # frame = Frame(30, height - 2.1 * inch - summary_height, width - 60, summary_height, showBoundary=0)
    # exec_summary_title = Paragraph('Executive Summary', styles['SectionTitle'])
    # summary = Paragraph(summary_text, styles['SummaryStyle'])
    # frame.addFromList([exec_summary_title, summary], c)

    c.setStrokeColor(colors.HexColor("#00000"))
    c.line(width/2.5, 10, width/2.5, height - 2 * inch)

    left_column_sections = [
        ('Physical Attributes', cv_descriptor_object['physical_attributes'], 'attribute'),
        ('Skills', cv_descriptor_object['skills'], 'skill'),
        ('Statistics', cv_descriptor_object['statistics'], 'statistic'),
        ('Education', cv_descriptor_object['education'], 'institution'),
        ('Languages', cv_descriptor_object['languages'], 'language'),
    ]

    right_column_sections = [
        ('Club Experiences', cv_descriptor_object['club_experiences'], 'club_name'),
        ('Awards', cv_descriptor_object['awards'], 'award'),
        ('References', cv_descriptor_object['references'], 'name'),
    ]

    # Function to add sections to the PDF
    def add_sections_to_pdf(sections, start_x, start_y, section_name):
        y_position = start_y
        for title, items, key in sections:
            items_paragraphs = []
            for item in items:
                if key == 'attribute':
                    text = f"{item['attribute']}: {item['value']}"
                elif key == 'skill':
                    text = f"{item['skill']}"
                elif key == 'statistic':
                    text = f"{item['statistic']}: {item['value']}"
                elif key == 'institution':
                    text = f"{item['institution']}: {item['degree']}"
                elif key == 'language':
                    text = f"{item['language']} | {item['level']}"
                elif key == 'club_name':
                    text = f"{item['club_name']} - {item['year']} {item['details']}"
                elif key == 'award':
                    text = f"{item['award']} - {item['year']}"
                elif key == 'name':
                    text = f"{item['name']} - {item.get('contact')}"

                items_paragraphs.append(Paragraph(text, bullet_style))

                if key in ['skill', 'institution', 'attribute']:
                    frame_height = 120
                elif key in ['language', 'name']:
                    frame_height = 100
                elif key == "club_name":
                    frame_height = 400
                else:
                    frame_height = 80

            
            section_header = Paragraph(title, styles['SectionTitle'])
            spacer = Spacer(1, 0.1 * inch)
            frame_content = [section_header, spacer] + items_paragraphs
            
            if key == 'award' and len(items) > 1:
                frame_content_left = [section_header, spacer] + items_paragraphs[:len(items_paragraphs)//2+1]
                frame_content_right = items_paragraphs[len(items_paragraphs)//2+1:]

                frame_left = Frame(start_x, y_position - frame_height - 5, (width / 2) / 2, frame_height, showBoundary=0)
                frame_right = Frame(start_x + (width / 2) / 2 + 10, y_position - frame_height - 25, (width / 2 - 60) / 2 - 5, frame_height, showBoundary=0)
                
                frame_left.addFromList(frame_content_left, c)
                frame_right.addFromList(frame_content_right, c)
                y_position -= (frame_height + 10)

            elif key == 'club_name':
                for i, experience in enumerate(items):
                    club_name_year = f"{experience['club_name']} | {experience['year']}"
                    club_name_paragraph = Paragraph(club_name_year, styles['ClubName'])
                    
                    
                    details_lines = experience['details']
                    detail_paragraphs = [Paragraph(line.strip(), bullet_style) for line in details_lines if line.strip()]

                    frame_height = len(details_lines) * 25
                    frame = Frame(start_x, y_position - frame_height, width * 2, frame_height, showBoundary=0)
                    if i == 0:
                        content = [section_header, club_name_paragraph] + detail_paragraphs
                    else:
                        content = [club_name_paragraph] + detail_paragraphs

                    frame.addFromList(content, c)
                    y_position -= (frame_height)
            else:
                frame_content = [section_header, spacer] + items_paragraphs
                frame_height = 100 + len(items)

                frame = Frame(start_x, y_position - frame_height, width / 2 - 100 if section_name == 'left' else width - start_x - 30, frame_height, showBoundary=0)
                frame.addFromList(frame_content, c)

                y_position -= (frame_height + 10)

    # Add sections to the PDF
    add_sections_to_pdf(left_column_sections, 30, height - 150, 'left')
    add_sections_to_pdf(right_column_sections, width / 2 - 30, height - 150, 'right')

    c.save()

# user_profile = {
#     "uid": "teJzPR3gL3PH2AE5oEejrazbHgj1",
#     "name": "Alex Johnson",
#     "email": "alexjohnson@example.com",
#     "date_of_birth": "June 15, 1998",
#     "nationality": "British",
#     "current_city": "Manchester, England",
#     "preferred_positions": "Central Midfield, Attacking Midfield, Winger",
#     "current_club": "Manchester United FC",
#     "playing_experience": "Over 10 years, winner of U18 Premier League, Academy Player of the Year 2017",
#     "international_representation": "England U19, UEFA European Under-19 Championship, U21 training camps",
#     "height": "6 feet",
#     "weight": "170 pounds",
#     "strengths": "Speed, Technique, Vision, Agility, Acceleration, Ball Control, Passing Accuracy",
#     "individual_skills": "Dribbling, Through Balls, Free-Kick Taking",
#     "teamwork_and_leadership": "Team-Oriented, Good Communication, Tactically Adaptable, Executes Instructions, Leadership through Captaincy",
#     "education": "Bachelor's degree in Sports Science",
#     "additional_languages": "Spanish",
#     "volunteer_experience": "Youth soccer camps coach, community outreach programs",
#     "career_goals": "Playing in top-tier leagues, coaching, mentorship, positive impact in soccer",
#     "team_training_frequency": "5 days a week",
#     "individual_training_frequency": "2-3 times a week",
#     "diet": "Balanced diet with lean proteins, complex carbs, healthy fats, fruits, vegetables, hydration",
#     "fitness_regimen": "Cardiovascular exercises, strength training, agility drills, interval training, weightlifting, plyometrics",
#     "mental_preparation": "Visualizing success, relaxation techniques, game plan review"
# }

# cv = build_cv_descriptor_object(user_profile)
# generate_cv_pdf(cv, 'output.pdf')