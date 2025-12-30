'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double-processing in strict mode
    if (hasProcessed.current) return;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      hasProcessed.current = true;

      // Store token first
      localStorage.setItem('tasktrox_access_token', token);

      // Refresh auth state to pick up the new token, then navigate
      refreshAuth().then(() => {
        router.push('/dashboard');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [router, searchParams, refreshAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <p className="text-gray-500">Completing sign in...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
