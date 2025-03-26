'use client';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import AssessmentResults from '@/app/components/AssessmentResults';

export default function ResultsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Assessment Results
          </h1>
          <p className="text-gray-600 mt-2">
            View your assessment history and progress
          </p>
        </div>
        <AssessmentResults />
      </div>
    </DashboardLayout>
  );
}
