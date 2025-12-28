import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { haffer } from '@/lib/fonts';

export const metadata: Metadata = {
  title: {
    default: 'Tasktrox - Project Management',
    template: '%s | Tasktrox',
  },
  description: 'A modern Kanban-style project management application',
  keywords: ['project management', 'kanban', 'tasks', 'productivity'],
  authors: [{ name: 'Tasktrox' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${haffer.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
