'use client';

import { useState, useEffect } from 'react';
import { assessmentService } from '@/services/assessment';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  questionId: number;
  questionText: string;
  score: number;
}

interface AssessmentResult {
  id: string;
  assessmentType: string;
  score: number;
  severity: string;
  completedAt: string;
  responses: any;
  userId: string;
  questions?: Question[];
  // PTSD-specific fields
  criteriaB?: boolean;
  criteriaC?: boolean;
  criteriaD?: boolean;
  criteriaE?: boolean;
}

interface Assessment {
  id: string;
  userId: string;
  status: string;
  responses: any;
  score?: number;
  severity?: string;
  startedAt: string;
  completedAt?: string;
  questions?: Question[];
  // PTSD-specific fields
  criteriaB?: boolean;
  criteriaC?: boolean;
  criteriaD?: boolean;
  criteriaE?: boolean;
}

export default function AssessmentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      try {
        let allResults: AssessmentResult[] = [];

        if (user.role === 'doctor') {
          // For doctors, fetch all patient submissions (excluding pre-assessment)
          const [stressAssessments, anxietyAssessments, ptsdAssessments] =
            await Promise.all([
              assessmentService.getAllStressAssessments(),
              assessmentService.getAllAnxietyAssessments(),
              assessmentService.getAllPTSDAssessments(),
            ]);

          allResults = [
            ...stressAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'Stress Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
            ...anxietyAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'Anxiety Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
            ...ptsdAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'PTSD Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
          ];
        } else {
          // For patients, fetch only their own submissions (excluding pre-assessment)
          const [stressAssessments, anxietyAssessments, ptsdAssessments] =
            await Promise.all([
              assessmentService.getStressAssessments(user.id),
              assessmentService.getAnxietyAssessments(user.id),
              assessmentService.getPTSDAssessments(user.id),
            ]);

          allResults = [
            ...stressAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'Stress Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
            ...anxietyAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'Anxiety Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
            ...ptsdAssessments.map((a: Assessment) => ({
              ...a,
              assessmentType: 'PTSD Assessment',
              score: a.score || 0,
              severity: a.severity || 'Not Available',
              completedAt: a.completedAt || a.startedAt,
            })),
          ];
        }

        // Sort results by completion date
        allResults.sort((a, b) => {
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return dateB - dateA;
        });

        setResults(allResults);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch results'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

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
      <div className="flex justify-center items-center h-64" role="status">
        <div
          key="loading-spinner"
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No assessment results found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {result.assessmentType}
              </h3>
              <p className="text-sm text-gray-500">
                Completed on {new Date(result.completedAt).toLocaleDateString()}
              </p>
              {user?.role === 'doctor' && (
                <p className="text-sm text-gray-500">
                  Patient ID: {result.userId}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">{result.score}</div>
              <div
                className={`font-semibold ${getSeverityColor(result.severity)}`}
              >
                {result.severity}
              </div>
            </div>
          </div>

          {/* Assessment-specific details */}
          {result.assessmentType === 'Anxiety Assessment' && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Key Symptoms:</h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>
                  Feeling nervous:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('nervous')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Trouble relaxing:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('relaxing')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Worrying too much:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('Worrying too much')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Easily annoyed:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('annoyed')
                  )?.score || 0}
                  /3
                </li>
              </ul>
            </div>
          )}

          {result.assessmentType === 'PTSD Assessment' && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Criteria Met:</h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>Re-experiencing: {result.criteriaB ? 'Yes' : 'No'}</li>
                <li>Avoidance: {result.criteriaC ? 'Yes' : 'No'}</li>
                <li>Negative alterations: {result.criteriaD ? 'Yes' : 'No'}</li>
                <li>
                  Arousal and reactivity: {result.criteriaE ? 'Yes' : 'No'}
                </li>
              </ul>
            </div>
          )}

          {result.assessmentType === 'Stress Assessment' && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Key Metrics:</h4>
              <ul className="list-disc list-inside text-gray-600">
                <li>
                  Stress Level:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('stress level')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Sleep Quality:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('sleep')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Physical Symptoms:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('physical')
                  )?.score || 0}
                  /3
                </li>
                <li>
                  Social Support:{' '}
                  {result.questions?.find((q) =>
                    q.questionText.includes('social support')
                  )?.score || 0}
                  /3
                </li>
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
