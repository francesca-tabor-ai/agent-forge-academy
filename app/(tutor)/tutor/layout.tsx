import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import { USER_ROLES } from '@/lib/types/roles';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTutor = await hasRole(USER_ROLES.INSTRUCTOR);

  if (!isTutor) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

