'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DoctorDashboardLayout from '@/app/components/layout/DoctorDashboardLayout';
import { doctorService } from '@/services/doctor';

export default function PatientDetails() {
  const params = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments'>(
    'overview'
  );

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const data = await doctorService.getPatientDetails(params.id as string);
        setPatient(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch patient details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [params.id]);

  const handleGetAISummary = async () => {
    try {
      setLoadingAiSummary(true);
      const summary = await doctorService.getPatientAISummary(
        params.id as string
      );
      setAiSummary(summary);
      setShowSummaryModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate AI summary'
      );
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const closeModal = () => {
    setShowSummaryModal(false);
  };

  const getSeverityColor = (severity: string) => {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('severe') || severityLower.includes('high'))
      return 'text-red-600';
    if (severityLower.includes('moderate') || severityLower.includes('medium'))
      return 'text-orange-600';
    if (severityLower.includes('mild') || severityLower.includes('low'))
      return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <DoctorDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorDashboardLayout>
    );
  }

  if (error) {
    return (
      <DoctorDashboardLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </DoctorDashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorDashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Patient not found</p>
        </div>
      </DoctorDashboardLayout>
    );
  }

  return (
    <DoctorDashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{patient.gender}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {patient.age
                      ? `${patient.age} years old`
                      : 'Age not specified'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{patient.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGetAISummary}
              disabled={loadingAiSummary}
              className={`px-4 py-2 rounded-full ${
                loadingAiSummary
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              } transition-colors duration-200`}
            >
              {loadingAiSummary ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate AI Summary'
              )}
            </button>
          </div>

          {/* AI Summary Modal */}
          {showSummaryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="mt-2">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    AI Summary for {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={`${
                activeTab === 'assessments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Assessments
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Age</label>
                  <p className="font-medium">
                    {patient.age || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">
                    {patient.phone || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium">
                    {patient.address || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Medical Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p
                    className={`font-medium ${
                      patient.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {patient.status.charAt(0).toUpperCase() +
                      patient.status.slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Emergency Contact
                  </label>
                  {patient.emergencyContact ? (
                    <div className="mt-1">
                      <p className="font-medium">
                        {patient.emergencyContact.name || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {patient.emergencyContact.phone || 'No phone number'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {patient.emergencyContact.relationship ||
                          'No relationship specified'}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium">Not specified</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Medical History
                  </label>
                  {patient.medicalHistory ? (
                    <div className="mt-1 space-y-2">
                      <p className="font-medium">
                        Conditions:{' '}
                        {patient.medicalHistory.conditions?.join(', ') ||
                          'None'}
                      </p>
                      <p className="font-medium">
                        Medications:{' '}
                        {patient.medicalHistory.medications?.join(', ') ||
                          'None'}
                      </p>
                      <p className="font-medium">
                        Allergies:{' '}
                        {patient.medicalHistory.allergies?.join(', ') || 'None'}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium">No medical history available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Assessment History
              </h2>
              <div className="space-y-6">
                {patient.assessments?.map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {assessment.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Completed on{' '}
                          {new Date(
                            assessment.completedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold mb-2 text-gray-900">
                          Score: {assessment.score}
                        </div>
                        <div
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${getSeverityColor(
                            assessment.severity
                          )} bg-opacity-10`}
                        >
                          {assessment.severity}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Responses:
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                Question
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                Score
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {assessment.questions?.map(
                              (question: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-900">
                                    {question.questionText}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {question.score}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorDashboardLayout>
  );
}
