import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isRecruiter = await hasRole('recruiter');

  if (!isRecruiter) {
    redirect('/');
  }

  return (
    <div className="recruiter-layout">
      <nav className="recruiter-nav">
        <h1>AgentForge Academy - Recruiter Portal</h1>
        <div className="nav-links">
          <a href="/recruiter/directory">Student Directory</a>
          <a href="/recruiter/events">Events</a>
          <a href="/recruiter/contacts">Contact Requests</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

