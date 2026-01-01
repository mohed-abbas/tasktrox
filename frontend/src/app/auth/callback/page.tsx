'use client';

import { useEffect, Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import * as authApi from '@/lib/api/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double-processing in strict mode
    if (hasProcessed.current) return;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        router.push(`/login?error=${encodeURIComponent(errorParam)}`);
        return;
      }

      if (!code) {
        router.push('/login?error=no_code');
        return;
      }

      hasProcessed.current = true;

      try {
        // Exchange the authorization code for tokens via secure POST request
        const { accessToken } = await authApi.exchangeOAuthCode(code);

        // Store token
        localStorage.setItem('tasktrox_access_token', accessToken);

        // Refresh auth state to pick up the new token, then navigate
        await refreshAuth();
        router.push('/dashboard');
      } catch (err) {
        console.error('OAuth code exchange failed:', err);
        setError('Failed to complete sign in. Please try again.');
        setTimeout(() => {
          router.push('/login?error=oauth_exchange_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams, refreshAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-500">{error}</p>
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

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
