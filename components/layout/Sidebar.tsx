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
          { href: '/student/dashboard', label: 'Dashboard' },
          { href: '/student/portfolio', label: 'Portfolio' },
          { href: '/student/questions', label: 'Questions' },
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
          { href: '/admin', label: 'Admin' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">AgentForge Academy</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

