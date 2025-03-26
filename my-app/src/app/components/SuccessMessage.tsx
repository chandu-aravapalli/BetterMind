'use client';

interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
}

export default function SuccessMessage({
  message,
  onClose,
}: SuccessMessageProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <p className="text-center text-gray-800 font-medium mb-4">{message}</p>
      </div>
    </div>
  );
}

// Add this to your global CSS file (app/globals.css)
// @keyframes fade-in {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
//
// .animate-fade-in {
//   animation: fade-in 0.3s ease-out;
// }
