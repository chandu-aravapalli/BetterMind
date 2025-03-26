'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { assessmentService } from '@/services/assessment';
import { useAuth } from '@/hooks/useAuth';
import SuccessMessage from '@/app/components/SuccessMessage';

interface Question {
  id: number;
  text: string;
  score: number | undefined;
}

const questions = [
  {
    id: 1,
    text: 'Feeling nervous, anxious, or on edge',
    score: undefined,
  },
  {
    id: 2,
    text: 'Not being able to stop or control worrying',
    score: undefined,
  },
  {
    id: 3,
    text: 'Worrying too much about different things',
    score: undefined,
  },
  {
    id: 4,
    text: 'Having trouble relaxing',
    score: undefined,
  },
  {
    id: 5,
    text: 'Being so restless that it is hard to sit still',
    score: undefined,
  },
  {
    id: 6,
    text: 'Becoming easily annoyed or irritable',
    score: undefined,
  },
  {
    id: 7,
    text: 'Feeling afraid as if something awful might happen',
    score: undefined,
  },
];

const getAnxietySeverity = (score: number) => {
  if (score <= 4) return { level: 'Minimal anxiety', color: 'text-green-600' };
  if (score <= 9) return { level: 'Mild anxiety', color: 'text-yellow-600' };
  if (score <= 14)
    return { level: 'Moderate anxiety', color: 'text-orange-600' };
  return { level: 'Severe anxiety', color: 'text-red-600' };
};

export default function AnxietyAssessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Question[]>(questions);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (questionId: number, score: number) => {
    const updatedAnswers = answers.map((q) =>
      q.id === questionId ? { ...q, score } : q
    );
    setAnswers(updatedAnswers);
    const newTotal = updatedAnswers.reduce((sum, q) => sum + (q.score || 0), 0);
    setTotalScore(newTotal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit an assessment');
      return;
    }

    // Check if all questions are answered
    if (answers.some((q) => q.score === undefined)) {
      setError('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Map answers to form data fields, now we can safely assert scores are numbers
      const formData = {
        feelingNervous: answers[0].score!,
        notAbleToStopWorrying: answers[1].score!,
        worryingTooMuch: answers[2].score!,
        troubleRelaxing: answers[3].score!,
        beingSoRestless: answers[4].score!,
        becomingEasilyAnnoyed: answers[5].score!,
        feelingAfraid: answers[6].score!,
        totalScore: totalScore,
        severity: getAnxietySeverity(totalScore).level,
        additionalNotes: `GAD-7 Score: ${totalScore}, Severity: ${
          getAnxietySeverity(totalScore).level
        }`,
      };

      await assessmentService.submitAnxietyAssessment(formData, user.id);

      // Show success message
      setShowSuccess(true);
      setIsSubmitted(true);

      // Redirect after 4 seconds
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 4000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit assessment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            GAD-7 Anxiety Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            Over the last 2 weeks, how often have you been bothered by the
            following problems?
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            {/* Questions */}
            <div className="space-y-6">
              {answers.map((question) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {question.id}. {question.text}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 0, label: 'Not at all' },
                      { value: 1, label: 'Several days' },
                      { value: 2, label: 'More than half the days' },
                      { value: 3, label: 'Nearly every day' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleScoreChange(question.id, option.value)
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          question.score === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-bold text-xl mb-1">
                          {option.value}
                        </div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress and Submit */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {answers.filter((q) => q.score !== undefined).length} of{' '}
                    {answers.length} answered
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (answers.filter((q) => q.score !== undefined).length /
                          answers.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/patient/dashboard')}
                  className="w-1/3 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || answers.some((q) => q.score === undefined)
                  }
                  className="w-2/3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // Results View
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Assessment Results
              </h2>
              <p className="text-gray-600">
                Based on your responses, here's your anxiety severity
                assessment:
              </p>
            </div>

            <div className="mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{totalScore}</div>
                <div
                  className={`text-xl font-semibold ${
                    getAnxietySeverity(totalScore).color
                  }`}
                >
                  {getAnxietySeverity(totalScore).level}
                </div>
              </div>

              <div className="mt-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${(totalScore / 21) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>0</span>
                  <span>21</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  What Your Score Means:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>0-4: Minimal anxiety symptoms</li>
                  <li>5-9: Mild anxiety symptoms</li>
                  <li>10-14: Moderate anxiety symptoms</li>
                  <li>15-21: Severe anxiety symptoms</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Recommended Next Steps:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Share these results with your healthcare provider</li>
                  <li>Consider scheduling a follow-up appointment</li>
                  <li>Monitor your symptoms regularly</li>
                  <li>Practice stress-reduction techniques</li>
                </ul>
              </div>

              {totalScore >= 10 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your score indicates significant anxiety symptoms. We
                        strongly recommend discussing these results with a
                        healthcare professional.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-300"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {showSuccess && (
          <SuccessMessage message="Assessment submitted successfully! Redirecting to dashboard..." />
        )}
      </div>
    </DashboardLayout>
  );
}
