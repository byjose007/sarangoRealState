import type { Metadata } from 'next';
import { LoginForm } from './login-form';
import { LoginHeader } from './login-header';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface p-8 shadow-soft">
        <LoginHeader />
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl ?? '/admin/dashboard'} />
        </div>
      </div>
    </div>
  );
}
