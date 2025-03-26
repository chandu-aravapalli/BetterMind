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
    text: 'Little interest or pleasure in doing things',
    score: undefined,
  },
  {
    id: 2,
    text: 'Feeling down, depressed, or hopeless',
    score: undefined,
  },
  {
    id: 3,
    text: 'Trouble falling or staying asleep, or sleeping too much',
    score: undefined,
  },
  {
    id: 4,
    text: 'Feeling tired or having little energy',
    score: undefined,
  },
  {
    id: 5,
    text: 'Poor appetite or overeating',
    score: undefined,
  },
  {
    id: 6,
    text: 'Feeling bad about yourself—or that you are a failure or have let yourself or your family down',
    score: undefined,
  },
  {
    id: 7,
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    score: undefined,
  },
  {
    id: 8,
    text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual',
    score: undefined,
  },
  {
    id: 9,
    text: 'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way',
    score: undefined,
  },
];

const getDepressionSeverity = (score: number) => {
  if (score <= 4)
    return { level: 'Minimal or no depression', color: 'text-green-600' };
  if (score <= 9) return { level: 'Mild depression', color: 'text-yellow-600' };
  if (score <= 14)
    return { level: 'Moderate depression', color: 'text-orange-600' };
  if (score <= 19)
    return { level: 'Moderately severe depression', color: 'text-red-600' };
  return { level: 'Severe depression', color: 'text-red-700' };
};

export default function StressAssessment() {
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

  // const handleChange = (field: string, value: any) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  // };

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
      // Format the assessment data, now we can safely assert scores are numbers
      const assessmentData = {
        userId: user.id,
        questions: answers.map((q) => ({
          questionId: q.id,
          questionText: q.text,
          score: q.score!,
        })),
        totalScore: totalScore,
        assessmentType: 'stress',
      };

      // Submit the assessment
      const response = await assessmentService.submitStressAssessment(
        assessmentData
      );

      if (response) {
        // Show success message
        setShowSuccess(true);
        setIsSubmitted(true);

        // Redirect after 4 seconds
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 4000);
      }
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
            PHQ-9 Depression Assessment
          </h1>
          <p className="text-gray-600 mt-2">
            Over the last 2 weeks, how often have you been bothered by any of
            the following problems?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
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
                    answers.some((q) => q.score === undefined) || isSubmitting
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
                Based on your responses, here's your stress level assessment:
              </p>
            </div>

            <div className="mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{totalScore}</div>
                <div
                  className={`text-xl font-semibold ${
                    getDepressionSeverity(totalScore).color
                  }`}
                >
                  {getDepressionSeverity(totalScore).level.replace(
                    'depression',
                    'stress'
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${(totalScore / 27) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>0</span>
                  <span>27</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Review these results with your healthcare provider</li>
                <li>Consider stress management techniques</li>
                <li>Monitor your stress levels regularly</li>
                <li>Practice self-care and relaxation methods</li>
              </ul>
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
          <SuccessMessage message="Stress assessment submitted successfully! Redirecting to dashboard..." />
        )}
      </div>
    </DashboardLayout>
  );
}
