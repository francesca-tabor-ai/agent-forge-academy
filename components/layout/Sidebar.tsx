'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'student' | 'instructor' | 'recruiter' | 'admin' | null;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { href: '/student/courses', label: 'Courses' },
          { href: '/student/portfolio', label: 'Portfolio' },
          { href: '/student/jobs', label: 'Job Opportunities' },
          { href: '/student/ai-advisor', label: 'AI Advisor' },
          { href: '/student/offers', label: 'Offers' },
          { href: '/student/subscription', label: 'Subscription' },
        ];
      case 'instructor':
        return [
          { href: '/tutor/dashboard', label: 'Dashboard' },
          { href: '/tutor/questions', label: 'Questions' },
        ];
      case 'recruiter':
        return [
          { href: '/recruiter/directory', label: 'Directory' },
          { href: '/recruiter/contacts', label: 'Contact Requests' },
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Overview' },
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/subscriptions', label: 'Subscriptions' },
          { href: '/admin/api-tester', label: 'API Tester' },
          { href: '/admin/logs', label: 'Logs' },
          { href: '/admin/bulk-upload', label: 'Bulk Upload' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r flex flex-col" style={{ borderColor: 'var(--ca-neutral-300)' }}>
      <div className="p-6 border-b" style={{ backgroundColor: 'var(--ca-navy)', borderColor: 'var(--ca-neutral-300)' }}>
        <h1 className="text-lg font-semibold text-white">AI Growth Hub</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out relative ${
                isActive
                  ? 'text-ca-text scale-105'
                  : 'text-ca-neutral-500 hover:text-ca-text hover:scale-105 hover:bg-gray-50'
              }`}
              style={isActive ? { backgroundColor: 'var(--ca-bg-warm)' } : {}}
            >
              {item.label}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ca-gold rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--ca-neutral-300)' }}>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-ca-neutral-500 hover:text-ca-text transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-50 active:scale-95"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

