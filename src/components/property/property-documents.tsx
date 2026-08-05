import { Download, FileText } from 'lucide-react';
import type { PropertyDocument } from '@/types';

export function PropertyDocuments({ documents }: { documents: PropertyDocument[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {documents.map((document) => (
        <li key={document.id}>
          <a
            href={document.href}
            download
            className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 transition-colors hover:border-primary"
          >
            <FileText className="size-5 shrink-0 text-brass" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{document.name}</span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                {document.type} · {document.size}
              </span>
            </span>
            <Download className="size-4 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}
