'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  BriefcaseIcon, 
  Bot, 
  Wrench, 
  CreditCard,
  Users,
  FileQuestion,
  FolderOpen,
  UserCheck,
  BarChart3,
  Database,
  Upload
} from 'lucide-react';
import type { UserRole } from '@/lib/types/roles';

interface SidebarProps {
  role: UserRole | null;
  isExpanded: boolean;
  isMobile: boolean;
}

export default function Sidebar({ role, isExpanded, isMobile }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/student/courses', label: 'Courses', icon: BookOpen },
          { href: '/student/portfolio', label: 'Portfolio', icon: Briefcase },
          { href: '/student/jobs', label: 'Job Opportunities', icon: BriefcaseIcon },
          { href: '/student/ai-advisor', label: 'AI Advisor', icon: Bot },
          { href: '/student/tools', label: 'Tools', icon: Wrench },
          { href: '/student/subscription', label: 'Subscription', icon: CreditCard },
        ];
      case 'instructor':
        return [
          { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/tutor/questions', label: 'Questions', icon: FileQuestion },
        ];
      case 'recruiter':
        return [
          { href: '/recruiter/directory', label: 'Directory', icon: Users },
          { href: '/recruiter/contacts', label: 'Contact Requests', icon: UserCheck },
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Overview', icon: BarChart3 },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
          { href: '/admin/api-tester', label: 'API Tester', icon: Database },
          { href: '/admin/logs', label: 'Logs', icon: FolderOpen },
          { href: '/admin/bulk-upload', label: 'Bulk Upload', icon: Upload },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Navigation - Primary navigation area, no duplicate branding */}
      <nav 
        className="flex-1 p-4 space-y-1 overflow-y-auto"
        aria-label="Primary navigation"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out relative
                ${isActive
                  ? 'text-ca-text scale-105'
                  : 'text-ca-neutral-500 hover:text-ca-text hover:scale-105 hover:bg-gray-50'
                }
                ${!isExpanded ? 'justify-center' : ''}
              `}
              style={isActive ? { backgroundColor: 'var(--ca-bg-warm)' } : {}}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ca-gold rounded-r-full" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

