import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTutor = await hasRole('tutor');

  if (!isTutor) {
    redirect('/');
  }

  return (
    <div className="tutor-layout">
      <nav className="tutor-nav">
        <h1>AgentForge Academy - Tutor Portal</h1>
        <div className="nav-links">
          <a href="/tutor/dashboard">Dashboard</a>
          <a href="/tutor/questions">Questions</a>
          <a href="/tutor/students">Students</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

