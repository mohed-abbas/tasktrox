'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Folder,
  User,
  Plus,
  LogOut,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo, LogoIcon } from '@/components/icons/Logo';
import { useAuth, useProjects } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

// Navigation items for Dashboard section
const dashboardNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/files', label: 'Files', icon: Folder },
  { href: '/profile', label: 'My Profile', icon: User },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
}

export function Sidebar({
  className,
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
  onClose,
  onNewProject,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col justify-between bg-white border-r border-sidebar-border h-full px-3 py-8 transition-all duration-300',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        className
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-8">
        {/* Logo & Close/Collapse Button */}
        <div className={cn(
          'flex items-center relative',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {collapsed ? (
            <LogoIcon className="text-gray-800" />
          ) : (
            <Logo className="text-gray-800" />
          )}

          {/* Mobile Close Button - positioned absolutely to stay within sidebar */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="size-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {/* Dashboard Section */}
          <div className="flex flex-col gap-1.5">
            {!collapsed && (
              <p className="px-4 text-xs text-gray-500 leading-4">Dashboard</p>
            )}
            <div className="flex flex-col">
              {dashboardNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'sidebar-item',
                      isActive && 'active',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Projects Section - Hidden when collapsed */}
          {!collapsed && (
            <div className="flex flex-col gap-1.5 mt-2">
              <p className="px-4 text-xs text-gray-500 leading-4">Projects</p>
              <div className="flex flex-col">
                {/* All Projects Toggle */}
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="sidebar-item justify-between"
                >
                  <span>All Projects</span>
                  <ChevronUp
                    className={cn(
                      'size-5 shrink-0 transition-transform duration-200',
                      !projectsExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Project List */}
                {projectsExpanded && (
                  <div className="flex flex-col">
                    {isLoadingProjects ? (
                      // Loading skeletons
                      <div className="space-y-1 px-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-9 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : projects.length === 0 ? (
                      // Empty state
                      <p className="px-4 py-2 text-sm text-gray-400">
                        No projects yet
                      </p>
                    ) : (
                      // Project list
                      projects.map((project) => {
                        const isActive = pathname === `/projects/${project.id}`;
                        return (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            onClick={handleNavClick}
                            className={cn(
                              'sidebar-item',
                              isActive && 'active'
                            )}
                          >
                            <GripVertical className="size-[18px] shrink-0 text-gray-400" />
                            <span className="truncate">{project.name}</span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}

                {/* New Project Button */}
                <div className="px-4 mt-2">
                  <button
                    onClick={onNewProject}
                    className="btn-primary flex items-center justify-center gap-1.5 w-full"
                  >
                    <Plus className="size-5" />
                    <span>New Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed: New Project Icon Button */}
          {collapsed && (
            <div className="flex justify-center mt-4">
              <button
                onClick={onNewProject}
                className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="New Project"
              >
                <Plus className="size-5" />
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
        {/* Collapse Toggle Button - Desktop only */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'sidebar-item text-gray-500 hover:text-gray-700',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="size-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="size-5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-item text-body hover:text-gray-700',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
