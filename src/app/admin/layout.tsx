import { cookies } from 'next/headers';
import AdminClientLayout from './AdminClientLayout';
import {
  DEMO_ROLE_COOKIE,
  buildDemoSession,
  isDemoRole,
} from '@/lib/demo-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const demoRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;

  if (isDemoRole(demoRole) && demoRole === 'ADMIN') {
    const session = buildDemoSession('ADMIN');
    return (
      <AdminClientLayout session={session as any}>{children}</AdminClientLayout>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/conta/login?msg=faça-login-primeiro');
  }

  return <AdminClientLayout session={session}>{children}</AdminClientLayout>;
}
