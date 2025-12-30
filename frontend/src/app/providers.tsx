'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/hooks/useAuth';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: 'bg-white border border-gray-200 shadow-lg rounded-xl',
            title: 'text-gray-800 font-medium text-sm',
            description: 'text-gray-500 text-sm',
            success: 'border-green-200 bg-green-50',
            error: 'border-red-200 bg-red-50',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
