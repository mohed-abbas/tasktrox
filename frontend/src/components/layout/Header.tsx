'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lightbulb,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export function Header({
  breadcrumbs = [],
  showBackButton = true,
  className,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        'flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2',
        className
      )}
    >
      {/* Left Side - Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-3.5 text-gray-500" />
          </button>
        )}

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-gray-500 text-base">/</span>
                )}
                <span className="text-gray-500 text-base leading-5">
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Right Side - User Info */}
      <div className="flex items-center gap-2">
        {/* Updates/What's New Icon */}
        <button
          className="flex items-center justify-center p-2.5 rounded hover:bg-gray-50 transition-colors"
          aria-label="What's new"
        >
          <Lightbulb className="size-6 text-gray-500" />
        </button>

        {/* Notifications Icon */}
        <button
          className="flex items-center justify-center p-2.5 rounded hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-6 text-gray-500" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-white rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
            )}

            {/* User Name */}
            <span className="text-gray-700 text-base leading-5">
              {user?.name || 'User'}
            </span>

            {/* Chevron */}
            <ChevronDown
              className={cn(
                'size-6 text-gray-400 transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-dropdown py-1 z-50 animate-fade-in">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/profile');
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors"
              >
                <User className="size-4 text-gray-500" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/settings');
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors"
              >
                <Settings className="size-4 text-gray-500" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-body hover:bg-gray-50 transition-colors"
              >
                <LogOut className="size-4 text-gray-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
