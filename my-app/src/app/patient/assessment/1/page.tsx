'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  assessmentService,
  PreAssessmentFormData,
} from '@/services/assessment';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import SuccessMessage from '@/app/components/SuccessMessage';

export default function Preassessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PreAssessmentFormData>({
    consent: '',
    mentalHealthDiagnosis: '',
    pastChallenges: '',
    currentTreatment: '',
    previousTherapy: '',
    medications: '',
    primaryPhysician: '',
    insurance: '',
    emergencyContact: '',
    familyHistory: '',
    supportSystem: '',
    therapyGoals: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit an assessment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await assessmentService.submitPreAssessment(formData, user.id);

      // Show success message
      setShowSuccess(true);

      // Redirect after 4 seconds
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 4000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit pre-assessment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Pre-Assessment Questionnaire
          </h1>
          <p className="text-gray-600 mt-2">
            Please provide detailed information to help us understand your needs
            better
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you consent to sharing this information with our healthcare
                providers?
              </label>
              <select
                name="consent"
                value={formData.consent}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please select</option>
                <option value="yes">Yes, I consent</option>
                <option value="no">No, I do not consent</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you ever been diagnosed with a mental health condition?
              </label>
              <textarea
                name="mentalHealthDiagnosis"
                value={formData.mentalHealthDiagnosis}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe any previous diagnoses..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What challenges are you currently facing that brought you here?
              </label>
              <textarea
                name="pastChallenges"
                value={formData.pastChallenges}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your current challenges..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently receiving any form of mental health treatment?
              </label>
              <textarea
                name="currentTreatment"
                value={formData.currentTreatment}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe any current treatments..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you previously attended therapy or counseling?
              </label>
              <textarea
                name="previousTherapy"
                value={formData.previousTherapy}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your previous therapy experiences..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently taking any medications for mental health?
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please list any current medications..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have a primary care physician?
              </label>
              <textarea
                name="primaryPhysician"
                value={formData.primaryPhysician}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide your primary care physician's information..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have health insurance that covers mental health services?
              </label>
              <textarea
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide your insurance information..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Information
              </label>
              <textarea
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide emergency contact details (name, relationship, phone number)..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Family History of Mental Health Conditions
              </label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe any family history of mental health conditions..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Support System
              </label>
              <textarea
                name="supportSystem"
                value={formData.supportSystem}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your current support system (family, friends, support groups)..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goals for Therapy
              </label>
              <textarea
                name="therapyGoals"
                value={formData.therapyGoals}
                onChange={handleChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What do you hope to achieve through therapy?"
              />
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                type="button"
                onClick={() => router.push('/patient/dashboard')}
                className="w-1/3 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-2/3 px-6 py-3 rounded-lg text-white font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Pre-Assessment'}
              </button>
            </div>
          </div>
        </form>

        {showSuccess && (
          <SuccessMessage message="Pre-assessment submitted successfully! Redirecting to dashboard..." />
        )}
      </div>
    </DashboardLayout>
  );
}
