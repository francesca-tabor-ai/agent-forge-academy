'use client';

import { Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import type { UserRole } from '@/lib/types/roles';

interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  role?: UserRole | null;
}

export function Header({ isSidebarExpanded, onToggleSidebar, role }: HeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b flex-shrink-0" 
      style={{ 
        borderColor: 'var(--ca-neutral-300)',
        borderBottomWidth: '1px',
        height: '64px', // ~64px as specified
      }}
      role="banner"
      aria-label="App header"
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Burger icon + App name */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center p-2 rounded-md text-ca-neutral-500 hover:text-ca-text hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ca-gold focus:ring-offset-2"
            aria-label={isSidebarExpanded ? 'Collapse navigation menu' : 'Expand navigation menu'}
            aria-expanded={isSidebarExpanded}
          >
            {isSidebarExpanded ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="ml-3 flex items-center">
            <span className="text-base font-semibold text-ca-text">AI Growth Hub</span>
          </div>
        </div>

        {/* Right: Profile + Sign Out */}
        <div className="flex items-center gap-2">
          {/* Profile button - role-aware link */}
          <Link
            href={
              role === 'student' 
                ? '/student/portfolio'
                : role === 'instructor'
                ? '/tutor/dashboard'
                : role === 'recruiter'
                ? '/recruiter/directory'
                : role === 'admin'
                ? '/admin'
                : '/student/portfolio' // fallback
            }
            className="inline-flex items-center justify-center p-2 rounded-md text-ca-neutral-500 hover:text-ca-text hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ca-gold focus:ring-offset-2"
            aria-label="Profile"
            title={userEmail || 'Profile'}
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Sign Out button */}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center p-2 rounded-md text-ca-neutral-500 hover:text-ca-text hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ca-gold focus:ring-offset-2"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
