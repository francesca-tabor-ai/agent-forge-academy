import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTutor = await hasRole('tutor') || await hasRole('instructor');

  if (!isTutor) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

