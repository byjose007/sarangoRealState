'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, KanbanSquare, LayoutDashboard, LogOut, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { logoutAction } from '@/app/admin/actions';
import { useTranslation } from '@/i18n/context';
import { LanguageToggle } from '@/components/layout/language-toggle';

interface NavItemConfig {
  href: string;
  key: 'dashboard' | 'properties' | 'leads' | 'clients' | 'agents';
  icon: typeof LayoutDashboard;
  roles: Array<'ADMIN' | 'AGENT'>;
}

const NAV_CONFIG: NavItemConfig[] = [
  { href: '/admin/dashboard', key: 'dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/properties', key: 'properties', icon: Building2, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/leads', key: 'leads', icon: KanbanSquare, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/clients', key: 'clients', icon: UserRound, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/agents', key: 'agents', icon: Users, roles: ['ADMIN'] },
];

interface AdminShellProps {
  user: { email: string; role: 'ADMIN' | 'AGENT' };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const { t, isEs } = useTranslation();

  const items = NAV_CONFIG.filter((item) => item.roles.includes(user.role)).map((item) => ({
    ...item,
    label: t.admin?.[item.key] ?? (isEs ? item.key : item.key),
  }));

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-5">
          <div>
            <span className="font-display text-lg tracking-tight">Sarango Real Estate</span>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {isEs ? 'Administración' : 'Admin'}
            </p>
          </div>
          <LanguageToggle />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <UserFooter user={user} isEs={isEs} signOutLabel={t.admin?.signOut ?? 'Cerrar sesión'} />
        </div>
      </aside>

      <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} compact />
          ))}
        </div>
        <LanguageToggle className="shrink-0" />
      </div>

      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  compact,
}: {
  item: { href: string; label: string; icon: typeof LayoutDashboard };
  active: boolean;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 whitespace-nowrap rounded-md text-sm transition-colors',
        compact ? 'px-3 py-2' : 'px-3 py-2.5',
        active
          ? 'bg-primary-soft font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}

function UserFooter({
  user,
  isEs,
  signOutLabel,
}: {
  user: { email: string; role: string };
  isEs: boolean;
  signOutLabel: string;
}) {
  const roleDisplay =
    user.role === 'ADMIN' ? (isEs ? 'Administrador' : 'Admin') : isEs ? 'Agente' : 'Agent';

  return (
    <div>
      <p className="truncate text-sm font-medium">{user.email}</p>
      <Badge variant="outline" className="mt-1.5 font-mono text-[0.65rem] uppercase">
        {roleDisplay}
      </Badge>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" /> {signOutLabel}
        </button>
      </form>
    </div>
  );
}
