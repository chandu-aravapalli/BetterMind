import { API_BASE_URL } from './api';

export interface PreAssessmentFormData {
  consent: string;
  mentalHealthDiagnosis: string;
  pastChallenges: string;
  currentTreatment: string;
  previousTherapy: string;
  medications: string;
  primaryPhysician: string;
  insurance: string;
  emergencyContact: string;
  familyHistory: string;
  supportSystem: string;
  therapyGoals: string;
}

interface AssessmentQuestion {
  questionId: number;
  questionText: string;
  score: number;
}

interface StressAssessmentData {
  userId: string;
  questions: AssessmentQuestion[];
  totalScore: number;
  assessmentType: string;
}

export interface AnxietyAssessmentFormData {
  feelingNervous: number;
  notAbleToStopWorrying: number;
  worryingTooMuch: number;
  troubleRelaxing: number;
  beingSoRestless: number;
  becomingEasilyAnnoyed: number;
  feelingAfraid: number;
  totalScore: number;
  severity: string;
  additionalNotes?: string;
}

export interface PTSDAssessmentFormData {
  // Criterion B: Re-experiencing
  repeatedMemories: number;
  disturbingDreams: number;
  relivingExperience: number;
  upsetByReminders: number;
  physicalReactions: number;
  
  // Criterion C: Avoidance
  avoidMemories: number;
  avoidExternalReminders: number;
  
  // Criterion D: Negative alterations in cognition and mood
  troubleRemembering: number;
  negativeBeliefs: number;
  blamingSelfOrOthers: number;
  negativeFeelings: number;
  lossOfInterest: number;
  feelingDistant: number;
  troublePositiveFeelings: number;
  
  // Criterion E: Alterations in arousal and reactivity
  irritableOrAngry: number;
  recklessBehavior: number;
  hypervigilance: number;
  easilyStartled: number;
  difficultyConcentrating: number;
  troubleSleeping: number;
  
  totalScore: number;
  criteriaB: boolean;
  criteriaC: boolean;
  criteriaD: boolean;
  criteriaE: boolean;
  severity: string;
  additionalNotes?: string;
}

export interface PreAssessmentSubmission {
  user_id: string;
  form_data: PreAssessmentFormData;
  submitted_at: string;
  id: string;
}

export const assessmentService = {
  async submitPreAssessment(formData: PreAssessmentFormData, userId: string) {
    const response = await fetch(`${API_BASE_URL}/pre-assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ ...formData, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit pre-assessment');
    }

    return response.json();
  },

  async submitStressAssessment(assessmentData: StressAssessmentData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/stress-assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(assessmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit assessment');
    }

    return response.json();
  },

  async submitAnxietyAssessment(formData: AnxietyAssessmentFormData, userId: string) {
    const response = await fetch(`${API_BASE_URL}/anxiety-assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ ...formData, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit anxiety assessment');
    }

    return response.json();
  },

  async submitPTSDAssessment(formData: PTSDAssessmentFormData, userId: string) {
    const response = await fetch(`${API_BASE_URL}/ptsd-assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ ...formData, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit PTSD assessment');
    }

    return response.json();
  },

  async getAssessmentStatus(userId: string): Promise<{ [key: string]: 'pending' | 'completed' | 'in-progress' }> {
    const response = await fetch(`${API_BASE_URL}/assessments/status/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch assessment status');
    }

    return response.json();
  },

  async getSubmissions(userId: string): Promise<PreAssessmentSubmission[]> {
    const response = await fetch(`${API_BASE_URL}/pre-assessment/submissions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch submissions');
    }

    return response.json();
  },

  async getSubmission(submissionId: string): Promise<PreAssessmentSubmission> {
    const response = await fetch(`${API_BASE_URL}/pre-assessment/submission/${submissionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch submission');
    }

    return response.json();
  },

  async getStressAssessments(userId: string) {
    const response = await fetch(`${API_BASE_URL}/stress-assessment/submissions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch stress assessment results');
    }

    return response.json();
  },

  async getAnxietyAssessments(userId: string) {
    const response = await fetch(`${API_BASE_URL}/anxiety-assessment/submissions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch anxiety assessment results');
    }

    return response.json();
  },

  async getPTSDAssessments(userId: string) {
    const response = await fetch(`${API_BASE_URL}/ptsd-assessment/submissions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch PTSD assessment results');
    }

    return response.json();
  },

  async getAllStressAssessments() {
    const response = await fetch(`${API_BASE_URL}/stress-assessment/all-results`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch all stress assessment results');
    }

    return response.json();
  },

  async getAllAnxietyAssessments() {
    const response = await fetch(`${API_BASE_URL}/anxiety-assessment/all-results`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch all anxiety assessment results');
    }

    return response.json();
  },

  async getAllPTSDAssessments() {
    const response = await fetch(`${API_BASE_URL}/ptsd-assessment/all-results`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch all PTSD assessment results');
    }

    return response.json();
  },
}; 