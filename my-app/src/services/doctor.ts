import { API_BASE_URL } from './api';

export interface Patient {
  id: string;
  name: string;
  email: string;
  gender?: string;
  age?: number;
  dateOfBirth?: string;
  lastAssessment?: string;
  assessmentCount: number;
  status: 'active' | 'inactive';
  recentResults?: {
    type: string;
    score: number;
    severity: string;
    date: string;
  }[];
}

export const doctorService = {
  async getPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE_URL}/doctor/patients`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch patients');
    }

    return response.json();
  },

  async getPatientDetails(patientId: string): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch patient details');
    }

    return response.json();
  },

  async getPatientAISummary(patientId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/doctor/patients/${patientId}/ai-summary`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate AI summary');
    }

    const data = await response.json();
    return data.summary;
  }
}; 