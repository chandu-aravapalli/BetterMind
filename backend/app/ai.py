import os
from datetime import datetime
from typing import List, Dict, Any
from openai import AsyncOpenAI
from .core.config import settings

# Configure OpenAI client
client = AsyncOpenAI(api_key=settings.openai_api_key)

async def generate_patient_summary(patient: Dict[str, Any], assessments: List[Dict[str, Any]]) -> str:
    """Generate an AI summary of the patient's mental health status based on their assessments."""
    
    # Format patient information
    patient_info = f"""
Patient Information:
- Name: {patient.get('firstName', '')} {patient.get('lastName', '')}
- Age: {patient.get('age', 'Not specified')}
- Gender: {patient.get('gender', 'Not specified')}
    """
    
    # Format assessment information
    assessment_info = "Assessment History:\n"
    for assessment in assessments:
        date = assessment.get('completedAt', datetime.now()).strftime('%Y-%m-%d')
        assessment_info += f"""
- {assessment.get('assessmentType', 'Unknown')} ({date}):
  Score: {assessment.get('score', 'N/A')}
  Severity: {assessment.get('severity', 'N/A')}
  Responses: {format_responses(assessment.get('responses', {}))}
        """
    
    # Generate prompt for GPT
    prompt = f"""
As a mental health professional, provide a concise summary of the patient's mental health status based on the following information:

{patient_info}

{assessment_info}

Please include:
1. Overall mental health status
2. Key observations from assessments
3. Notable patterns or trends
4. Areas of concern (if any)
5. Positive developments (if any)

Keep the summary professional and factual.
"""
    
    try:
        # Call OpenAI API with the latest format
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional mental health expert providing patient summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating AI summary: {str(e)}")
        if hasattr(e, 'response'):
            print(f"API Response: {e.response}")
        return "Unable to generate AI summary at this time. Please try again later."

def format_responses(responses: Dict[str, Any]) -> str:
    """Format assessment responses for the prompt."""
    formatted = []
    for question, answer in responses.items():
        if isinstance(answer, dict):
            answer = answer.get('answer', answer.get('value', str(answer)))
        formatted.append(f"{question}: {answer}")
    return "\n    " + "\n    ".join(formatted) if formatted else "No detailed responses available"