import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function StartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
