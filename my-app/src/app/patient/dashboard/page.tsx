'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { assessmentService } from '@/services/assessment';
import { useAuth } from '@/hooks/useAuth';

interface Assessment {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in-progress';
  icon: string;
  duration: string;
}

const defaultAssessments: Assessment[] = [
  {
    id: 1,
    title: 'Preassessment Task',
    description: 'Complete initial assessment to help us understand your needs',
    status: 'pending',
    icon: '📋',
    duration: '15-20 min',
  },
  {
    id: 2,
    title: 'Stress Assessment',
    description: 'Evaluate your current stress levels',
    status: 'pending',
    icon: '🎯',
    duration: '10-15 min',
  },
  {
    id: 3,
    title: 'Anxiety Assessment',
    description: 'Measure your anxiety levels and triggers',
    status: 'pending',
    icon: '🧠',
    duration: '20-25 min',
  },
  {
    id: 4,
    title: 'PTSD Assessment',
    description: 'Assess your PTSD symptoms and severity',
    status: 'pending',
    icon: '❤️',
    duration: '25-30 min',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [assessments, setAssessments] =
    useState<Assessment[]>(defaultAssessments);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentStatus = async () => {
      if (!user) return;

      try {
        const statusData = await assessmentService.getAssessmentStatus(user.id);

        // Update assessments with status from backend
        setAssessments(
          defaultAssessments.map((assessment) => ({
            ...assessment,
            status: statusData[assessment.id] || 'pending',
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch assessment status'
        );
        console.error('Error fetching assessment status:', err);
      }
    };

    fetchAssessmentStatus();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Here are your assessments</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{assessment.icon}</div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      assessment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : assessment.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {assessment.status.charAt(0).toUpperCase() +
                      assessment.status.slice(1)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {assessment.title}
                </h3>
                <p className="text-gray-600 mb-4">{assessment.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    Duration: {assessment.duration}
                  </span>
                </div>
                <button
                  onClick={() =>
                    router.push(`/patient/assessment/${assessment.id}`)
                  }
                  className={`w-full py-2 rounded-lg transition-all duration-300 ${
                    assessment.status === 'completed'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                  }`}
                  disabled={assessment.status === 'completed'}
                >
                  {assessment.status === 'completed'
                    ? 'Completed'
                    : 'Start Assessment'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
