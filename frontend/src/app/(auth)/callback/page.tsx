'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import * as authApi from '@/lib/api/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        router.push('/login?error=no_code');
        return;
      }

      try {
        // Exchange the authorization code for tokens via secure POST request
        const { accessToken } = await authApi.exchangeOAuthCode(code);

        // Store token and redirect
        localStorage.setItem('tasktrox_access_token', accessToken);
        router.push('/dashboard');
      } catch (err) {
        console.error('OAuth code exchange failed:', err);
        setStatus('error');
        setErrorMessage('Failed to complete sign in. Please try again.');

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?error=oauth_exchange_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{errorMessage}</p>
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <p className="text-gray-500">Completing sign in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
