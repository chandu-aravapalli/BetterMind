# BetterMind - Mental Health Assessment Platform

BetterMind is a comprehensive mental health assessment platform that connects patients with healthcare providers. The platform facilitates mental health screenings, assessments, and patient monitoring through a secure and user-friendly interface.

## Features

### For Patients
- **Secure Authentication**: Personal account creation and login
- **Multiple Assessments**: Access to various mental health assessments including:
  - Pre-Assessment Questionnaire
  - Stress Assessment
  - Anxiety Assessment
  - PTSD Assessment
- **Progress Tracking**: View assessment history and track mental health progress
- **Private Dashboard**: Personal space to manage assessments and view results

### For Doctors
- **Patient Management**: Comprehensive view of assigned patients
- **Assessment Monitoring**: Track patient assessment completion and results
- **AI-Powered Insights**: Generate AI summaries of patient mental health status
- **Detailed Patient Profiles**: Access to patient history and assessment responses

## Technology Stack

### Frontend
- Next.js 13 (React)
- TypeScript
- Tailwind CSS
- React Hooks
- Next.js App Router

### Backend
- FastAPI (Python)
- MongoDB
- JWT Authentication
- OpenAI Integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- OpenAI API key

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URL=your_mongodb_url
SECRET_KEY=your_secret_key
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend server.

## Authentication

The platform uses JWT (JSON Web Tokens) for authentication. Access tokens are required for all protected endpoints.

## Role-Based Access

- **Patients**: Can access their own assessments and results
- **Doctors**: Can view patient lists, access patient details, and generate AI summaries

## Security Features

- Password hashing
- JWT authentication
- Role-based access control
- Secure API endpoints
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

- OpenAI for AI integration
- MongoDB for database solutions
- FastAPI for backend framework
- Next.js team for frontend framework
