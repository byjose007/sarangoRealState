'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/button';

interface ClientItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}

export function ClientsView({ clients }: { clients: ClientItem[] }) {
  const { t, isEs } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl text-headline tracking-tight">
          {t.admin?.clients ?? (isEs ? 'Clientes' : 'Clients')}
        </h1>
        <Link href="/admin/clients/new">
          <Button>{t.admin?.newClient ?? (isEs ? 'Nuevo cliente' : 'New client')}</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">
                {t.admin?.name ?? (isEs ? 'Nombre' : 'Name')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.email ?? (isEs ? 'Correo' : 'Email')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.phone ?? (isEs ? 'Teléfono' : 'Phone')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.added ?? (isEs ? 'Fecha de registro' : 'Added')}
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="font-medium hover:underline"
                  >
                    {client.firstName} {client.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">{client.email}</td>
                <td className="px-4 py-3">{client.phone ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {new Date(client.createdAt).toLocaleDateString(isEs ? 'es-EC' : 'en-US', {
                    dateStyle: 'medium',
                  })}
                </td>
              </tr>
            ))}
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {t.admin?.noClientsYet ??
                    (isEs ? 'Aún no hay clientes registrados.' : 'No clients yet.')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
