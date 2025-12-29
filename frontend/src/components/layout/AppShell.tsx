'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NewProjectModal } from '@/components/project';
import { createProject } from '@/lib/api/projects';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppShellProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
}

export function AppShell({
  children,
  breadcrumbs = [],
  showBackButton = true,
}: AppShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProjectModalOpen(false);
      // Navigate to the new project
      router.push(`/projects/${newProject.id}`);
    },
  });

  const handleCreateProject = async (data: { name: string; description: string }) => {
    await createMutation.mutateAsync(data);
  };

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar
        className="hidden lg:flex flex-shrink-0"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewProject={() => setNewProjectModalOpen(true)}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          isMobile
          onClose={() => setMobileMenuOpen(false)}
          onNewProject={() => {
            setMobileMenuOpen(false);
            setNewProjectModalOpen(true);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 pb-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5 text-gray-500" />
            </button>

            {/* Header Component */}
            <Header
              breadcrumbs={breadcrumbs}
              showBackButton={showBackButton}
              className="flex-1"
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      {/* New Project Modal (triggered from sidebar) */}
      <NewProjectModal
        open={newProjectModalOpen}
        onOpenChange={setNewProjectModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default AppShell;
