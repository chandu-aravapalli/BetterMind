'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="container mx-auto px-6 py-4 backdrop-blur-sm bg-white/70 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <Image
                src="/brain-logo.png"
                alt="BetterMind Brain Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BetterMind
            </h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-md mx-auto">
          {' '}
          {/* Changed from max-w-2xl to max-w-md */}
          {/* Content Card with adjusted padding */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            {' '}
            {/* Added p-8 padding */}
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-sm border-t border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-center items-center space-x-2">
            <p className="text-sm text-gray-600">
              &copy; 2024 BetterMind. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
