import { Logo } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-8">
        <Logo className="h-8 w-auto" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-8 pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Tasktrox. All rights reserved.
      </footer>
    </div>
  );
}
