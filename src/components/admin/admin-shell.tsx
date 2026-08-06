'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, KanbanSquare, LayoutDashboard, LogOut, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { logoutAction } from '@/app/admin/actions';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Array<'ADMIN' | 'AGENT'>;
}

const NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/properties', label: 'Properties', icon: Building2, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/leads', label: 'Leads', icon: KanbanSquare, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/clients', label: 'Clients', icon: UserRound, roles: ['ADMIN', 'AGENT'] },
  { href: '/admin/agents', label: 'Agents', icon: Users, roles: ['ADMIN'] },
];

interface AdminShellProps {
  user: { email: string; role: 'ADMIN' | 'AGENT' };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <span className="font-display text-lg">Vestra</span>
          <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            Admin
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <UserFooter user={user} />
        </div>
      </aside>

      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} compact />
          ))}
        </div>
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

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 whitespace-nowrap rounded-md text-sm transition-colors',
        compact ? 'px-3 py-2' : 'px-3 py-2.5',
        active ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}

function UserFooter({ user }: { user: { email: string; role: string } }) {
  return (
    <div>
      <p className="truncate text-sm">{user.email}</p>
      <Badge variant="outline" className="mt-1.5">
        {user.role}
      </Badge>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );
}
