import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { ToastProvider } from '@/components/admin/Toast';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // The login page renders outside this shell; everything else needs a session.
  // (Middleware already redirects unauthenticated requests, this is a defensive second check.)
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <ToastProvider>
      <AdminShell adminName={session.name}>{children}</AdminShell>
    </ToastProvider>
  );
}
