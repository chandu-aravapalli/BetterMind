'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorDashboardLayout from '@/app/components/layout/DoctorDashboardLayout';
import { doctorService, Patient } from '@/services/doctor';

export default function DoctorDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<
    'name' | 'age' | 'gender' | 'ptsd' | 'anxiety' | 'stress'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log('Fetching patients...');
        const data = await doctorService.getPatients();
        console.log('Received patients data:', data);
        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch patients'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      !searchTerm ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getAssessmentScore = (patient: Patient, type: string) => {
    const result = patient.recentResults?.find((r) =>
      r.type.toLowerCase().includes(type.toLowerCase())
    );
    return result?.score || 0;
  };

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === 'age') {
      const aAge = a.age || 0;
      const bAge = b.age || 0;
      return sortOrder === 'asc' ? aAge - bAge : bAge - aAge;
    }
    if (sortBy === 'gender') {
      const aGender = a.gender || '';
      const bGender = b.gender || '';
      return sortOrder === 'asc'
        ? aGender.localeCompare(bGender)
        : bGender.localeCompare(aGender);
    }
    if (['ptsd', 'anxiety', 'stress'].includes(sortBy)) {
      const aScore = getAssessmentScore(a, sortBy);
      const bScore = getAssessmentScore(b, sortBy);
      return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
    }
    return 0;
  });

  console.log('All patients:', patients);
  console.log('Filtered and sorted patients:', sortedPatients);
  console.log('Current search term:', searchTerm);

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

  return (
    <DoctorDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient List</h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor your patients' assessments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="age">Sort by Age</option>
                <option value="gender">Sort by Gender</option>
                <option value="ptsd">Sort by PTSD Score</option>
                <option value="anxiety">Sort by Anxiety Score</option>
                <option value="stress">Sort by Stress Score</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? (
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4h13M3 8h9M3 12h5M3 16h13"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4h13M3 8h9M3 12h9M3 16h5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm mr-3">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.gender || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.age ? `${patient.age} years` : 'Not specified'}
                  </td>
                  <td className="px-6 py-4">
                    {patient.recentResults ? (
                      <div className="space-y-1">
                        {patient.recentResults.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {result.type}:
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                Score: {result.score}
                              </span>
                              <span
                                className={`font-medium ${getSeverityColor(
                                  result.severity
                                )}`}
                              >
                                ({result.severity})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No results yet
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        router.push(`/doctor/patients/${patient.id}`)
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DoctorDashboardLayout>
  );
}
