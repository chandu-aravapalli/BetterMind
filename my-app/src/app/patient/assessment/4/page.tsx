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
  criterion: 'B' | 'C' | 'D' | 'E';
}

const questions: Question[] = [
  // Criterion B: Re-experiencing
  {
    id: 1,
    text: 'Repeated, disturbing, and unwanted memories of the stressful experience?',
    score: undefined,
    criterion: 'B',
  },
  {
    id: 2,
    text: 'Repeated, disturbing dreams related to the stressful experience?',
    score: undefined,
    criterion: 'B',
  },
  {
    id: 3,
    text: 'Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were reliving it)?',
    score: undefined,
    criterion: 'B',
  },
  {
    id: 4,
    text: 'Feeling very upset when something reminded you of the stressful experience?',
    score: undefined,
    criterion: 'B',
  },
  {
    id: 5,
    text: 'Having strong physical reactions when something reminded you of the stressful experience (e.g., heart pounding, trouble breathing, sweating)?',
    score: undefined,
    criterion: 'B',
  },

  // Criterion C: Avoidance
  {
    id: 6,
    text: 'Avoiding memories, thoughts, or feelings related to the stressful experience?',
    score: undefined,
    criterion: 'C',
  },
  {
    id: 7,
    text: 'Avoiding external reminders of the stressful experience (e.g., people, places, conversations, activities, objects, or situations)?',
    score: undefined,
    criterion: 'C',
  },

  // Criterion D: Negative alterations in cognition and mood
  {
    id: 8,
    text: 'Trouble remembering important parts of the stressful experience?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 9,
    text: 'Having strong negative beliefs about yourself, other people, or the world (e.g., I am bad, The world is completely dangerous)?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 10,
    text: 'Blaming yourself or others for the stressful experience or what happened after it?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 11,
    text: 'Having strong negative feelings such as fear, horror, anger, guilt, or shame?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 12,
    text: 'Loss of interest in activities you used to enjoy?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 13,
    text: 'Feeling distant or cut off from other people?',
    score: undefined,
    criterion: 'D',
  },
  {
    id: 14,
    text: 'Trouble experiencing positive feelings (e.g., being unable to feel happiness or love)?',
    score: undefined,
    criterion: 'D',
  },

  // Criterion E: Alterations in arousal and reactivity
  {
    id: 15,
    text: 'Being irritable or having angry outbursts (with little or no provocation)?',
    score: undefined,
    criterion: 'E',
  },
  {
    id: 16,
    text: 'Engaging in reckless or self-destructive behavior?',
    score: undefined,
    criterion: 'E',
  },
  {
    id: 17,
    text: 'Being overly alert or watchful (hypervigilance)?',
    score: undefined,
    criterion: 'E',
  },
  {
    id: 18,
    text: 'Feeling jumpy or easily startled?',
    score: undefined,
    criterion: 'E',
  },
  {
    id: 19,
    text: 'Having difficulty concentrating?',
    score: undefined,
    criterion: 'E',
  },
  {
    id: 20,
    text: 'Having trouble falling or staying asleep?',
    score: undefined,
    criterion: 'E',
  },
];

const criteriaLabels = {
  B: 'Re-experiencing Symptoms',
  C: 'Avoidance Symptoms',
  D: 'Negative Alterations in Cognition and Mood',
  E: 'Alterations in Arousal and Reactivity',
};

export default function PTSDAssessment() {
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

  const analyzeCriteria = () => {
    const criteriaB =
      answers.filter((q) => q.criterion === 'B' && (q.score || 0) >= 2)
        .length >= 1;
    const criteriaC =
      answers.filter((q) => q.criterion === 'C' && (q.score || 0) >= 2)
        .length >= 1;
    const criteriaD =
      answers.filter((q) => q.criterion === 'D' && (q.score || 0) >= 2)
        .length >= 2;
    const criteriaE =
      answers.filter((q) => q.criterion === 'E' && (q.score || 0) >= 2)
        .length >= 2;
    return { criteriaB, criteriaC, criteriaD, criteriaE };
  };

  const calculateSeverity = (score: number) => {
    if (score <= 20) return 'Minimal symptoms';
    if (score <= 40) return 'Mild symptoms';
    if (score <= 60) return 'Moderate symptoms';
    return 'Severe symptoms';
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
        // Criterion B: Re-experiencing
        repeatedMemories: answers[0].score!,
        disturbingDreams: answers[1].score!,
        relivingExperience: answers[2].score!,
        upsetByReminders: answers[3].score!,
        physicalReactions: answers[4].score!,

        // Criterion C: Avoidance
        avoidMemories: answers[5].score!,
        avoidExternalReminders: answers[6].score!,

        // Criterion D: Negative alterations in cognition and mood
        troubleRemembering: answers[7].score!,
        negativeBeliefs: answers[8].score!,
        blamingSelfOrOthers: answers[9].score!,
        negativeFeelings: answers[10].score!,
        lossOfInterest: answers[11].score!,
        feelingDistant: answers[12].score!,
        troublePositiveFeelings: answers[13].score!,

        // Criterion E: Alterations in arousal and reactivity
        irritableOrAngry: answers[14].score!,
        recklessBehavior: answers[15].score!,
        hypervigilance: answers[16].score!,
        easilyStartled: answers[17].score!,
        difficultyConcentrating: answers[18].score!,
        troubleSleeping: answers[19].score!,

        // Calculate total score and criteria met
        totalScore: totalScore,
        criteriaB:
          answers.filter((q) => q.criterion === 'B' && q.score! >= 2).length >=
          1,
        criteriaC:
          answers.filter((q) => q.criterion === 'C' && q.score! >= 2).length >=
          1,
        criteriaD:
          answers.filter((q) => q.criterion === 'D' && q.score! >= 2).length >=
          2,
        criteriaE:
          answers.filter((q) => q.criterion === 'E' && q.score! >= 2).length >=
          2,
        severity: calculateSeverity(totalScore),
        additionalNotes: `PCL-5 Score: ${totalScore}, Severity: ${calculateSeverity(
          totalScore
        )}`,
      };

      await assessmentService.submitPTSDAssessment(formData, user.id);

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

  const getCurrentSection = (criterion: 'B' | 'C' | 'D' | 'E') => {
    return answers.filter((q) => q.criterion === criterion);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            PTSD Checklist (PCL-5)
          </h1>
          <p className="text-gray-600 mt-2">
            Over the past month, how much were you bothered by these problems?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            {(['B', 'C', 'D', 'E'] as const).map((criterion) => (
              <div key={criterion} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  {criteriaLabels[criterion]}
                </h2>
                <div className="space-y-6">
                  {getCurrentSection(criterion).map((question) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl shadow-sm p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          {question.id}. {question.text}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          { value: 0, label: 'Not at all' },
                          { value: 1, label: 'A little bit' },
                          { value: 2, label: 'Moderately' },
                          { value: 3, label: 'Quite a bit' },
                          { value: 4, label: 'Extremely' },
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
              </div>
            ))}

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
                Based on your responses to the PCL-5:
              </p>
            </div>

            <div className="mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{totalScore}</div>
                <div
                  className={`text-xl font-semibold ${
                    totalScore >= 31 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {totalScore >= 31
                    ? 'Suggests possible PTSD'
                    : 'Below clinical threshold'}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Criteria Analysis:
                </h3>
                {Object.entries(analyzeCriteria()).map(([criterion, met]) => (
                  <div
                    key={criterion}
                    className={`flex items-center mb-2 ${
                      met ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {met ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    Criterion {criterion.slice(-1)}:{' '}
                    {
                      criteriaLabels[
                        criterion.slice(-1) as keyof typeof criteriaLabels
                      ]
                    }
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Important Note:
                </h3>
                <p className="text-gray-600">
                  This assessment is a screening tool and not a diagnostic
                  instrument. A formal diagnosis can only be made by a qualified
                  mental health professional.
                </p>
              </div>

              {totalScore >= 31 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Your score suggests significant PTSD symptoms. We
                        strongly recommend discussing these results with a
                        mental health professional who can provide a thorough
                        evaluation and appropriate support.
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
          <SuccessMessage message="PTSD assessment submitted successfully! Redirecting to dashboard..." />
        )}
      </div>
    </DashboardLayout>
  );
}
