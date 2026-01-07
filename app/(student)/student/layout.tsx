import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isStudent = await hasRole('student');

  if (!isStudent) {
    redirect('/');
  }

  return (
    <div className="student-layout">
      <nav className="student-nav">
        <h1>AgentForge Academy - Student Portal</h1>
        <div className="nav-links">
          <a href="/student/dashboard">Dashboard</a>
          <a href="/student/portfolio">Portfolio</a>
          <a href="/student/questions">Questions</a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

