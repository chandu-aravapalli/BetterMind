'use client';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'message' | 'reminder' | 'update';
  sender?: string;
  date: string;
  read: boolean;
}

export default function Notifications() {
  const notifications: Notification[] = [
    {
      id: 1,
      title: "Doctor's Feedback",
      message:
        "Your recent assessment results have been reviewed. Let's discuss them in our next session.",
      type: 'message',
      sender: 'Dr. Sarah Johnson',
      date: '2024-02-15T10:30:00',
      read: false,
    },
    {
      id: 2,
      title: 'Assessment Reminder',
      message: 'Your weekly stress assessment is due tomorrow.',
      type: 'reminder',
      date: '2024-02-14T15:00:00',
      read: false,
    },
    {
      id: 3,
      title: 'Assessment Completed',
      message:
        'Your depression assessment has been processed. View your results now.',
      type: 'update',
      date: '2024-02-13T09:15:00',
      read: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with your care journey
          </p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-300 ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`mt-1 p-2 rounded-lg ${
                      notification.type === 'message'
                        ? 'bg-blue-100 text-blue-600'
                        : notification.type === 'reminder'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {notification.type === 'message' ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    ) : notification.type === 'reminder' ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    {notification.sender && (
                      <p className="text-sm text-gray-500 mb-1">
                        From: {notification.sender}
                      </p>
                    )}
                    <p className="text-gray-600">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
