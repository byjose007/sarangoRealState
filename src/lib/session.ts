import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Use inside Server Actions/Components — proxy.ts guards routes, this guards data. */
export async function requireAgentOrAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  return user;
}

export async function requireAdmin() {
  const user = await requireAgentOrAdmin();
  if (user.role !== 'ADMIN') redirect('/admin/dashboard');
  return user;
}
