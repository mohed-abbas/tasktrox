'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-block text-gray-800 hover:text-gray-600 transition-colors">
          <Logo />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* 404 Number */}
          <div className="mb-6">
            <span className="text-[120px] sm:text-[160px] font-bold leading-none text-gray-200 select-none">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 mb-8 text-base sm:text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-gray-400">
          Need help?{' '}
          <Link href="/contact" className="text-gray-600 hover:text-gray-800 underline underline-offset-4">
            Contact support
          </Link>
        </p>
      </footer>
    </div>
  );
}
