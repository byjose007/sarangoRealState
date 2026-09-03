'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/context';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  href: string;
}

// Photos live in the "Fotografías y Galería" section of PropertyForm now —
// that's the section actually submitted on save (see property-form.tsx /
// lib/admin/properties.ts updateProperty, which replaces every PropertyImage
// row to match the form's array). A second, independently-persisting image
// uploader here would race it: drop a file here, then save the form with
// its now-stale image list, and the form's submit deletes the file you just
// added. Documents have no such conflict — there's no "documents" array in
// the form — so this stays the one place that manages them.
export function MediaManager({
  propertyId,
  documents,
}: {
  propertyId: string;
  documents: DocumentItem[];
}) {
  return <DocumentsPanel propertyId={propertyId} documents={documents} />;
}

/** Uploads a batch sequentially (predictable order, no server hammering) and
 * reports one summary toast instead of one per file. */
async function uploadBatch(
  files: File[],
  postOne: (file: File) => Promise<{ ok: boolean; message?: string }>,
  labels: {
    successOne: string;
    successMany: (n: number) => string;
    someFailed: (ok: number, fail: number) => string;
  },
) {
  let succeeded = 0;
  let failed = 0;
  let lastError: string | undefined;
  for (const file of files) {
    const result = await postOne(file);
    if (result.ok) succeeded += 1;
    else {
      failed += 1;
      lastError = result.message;
    }
  }
  if (failed === 0) {
    toast.success(succeeded === 1 ? labels.successOne : labels.successMany(succeeded));
  } else if (succeeded === 0) {
    toast.error(lastError ?? labels.someFailed(succeeded, failed));
  } else {
    toast.warning(labels.someFailed(succeeded, failed));
  }
  return succeeded > 0;
}

function useDropzone(onFiles: (files: File[]) => void, disabled: boolean) {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  return {
    dragging,
    handlers: {
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        if (disabled) return;
        dragCounter.current += 1;
        setDragging(true);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) setDragging(false);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragging(false);
        if (disabled) return;
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) onFiles(files);
      },
    },
  };
}

function DocumentsPanel({
  propertyId,
  documents,
}: {
  propertyId: string;
  documents: DocumentItem[];
}) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function postOne(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId);
    formData.append('kind', 'document');
    formData.append('name', file.name);
    return fetch('/api/uploads', { method: 'POST', body: formData }).then((r) => r.json());
  }

  function uploadMany(files: File[]) {
    startTransition(async () => {
      await uploadBatch(files, postOne, {
        successOne: isEs ? 'Documento subido con éxito.' : 'Document uploaded.',
        successMany: (n) =>
          isEs ? `${n} documentos subidos con éxito.` : `${n} documents uploaded.`,
        someFailed: (ok, fail) =>
          isEs
            ? `${ok} documento(s) subidos, ${fail} fallaron.`
            : `${ok} document(s) uploaded, ${fail} failed.`,
      });
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/uploads?id=${id}&kind=document`, { method: 'DELETE' });
      const result = await response.json();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(isEs ? 'Documento eliminado.' : 'Document removed.');
      router.refresh();
    });
  }

  const { dragging, handlers } = useDropzone(uploadMany, pending);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          {isEs ? 'Documentos' : 'Documents'} ({documents.length})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" /> {isEs ? 'Subir' : 'Upload'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,application/acad,image/vnd.dwg,application/zip,application/x-zip-compressed"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) uploadMany(files);
            e.target.value = '';
          }}
        />
      </div>

      <div
        {...handlers}
        className={cn(
          'space-y-2 rounded-md border-2 border-dashed p-2 transition-colors',
          dragging ? 'border-primary bg-primary-soft/40' : 'border-transparent',
        )}
      >
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{doc.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{doc.size}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(doc.id)}
                disabled={pending}
                aria-label={isEs ? 'Eliminar documento' : 'Remove document'}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            'grid place-items-center rounded-md p-4 text-center text-xs text-muted-foreground',
            documents.length === 0 ? 'border border-dashed border-border' : '',
          )}
        >
          {dragging
            ? isEs
              ? 'Suelta para subir'
              : 'Drop to upload'
            : documents.length === 0
              ? isEs
                ? 'Aún no hay documentos subidos. Arrastra archivos aquí o usa "Subir".'
                : 'No documents yet. Drag files here or use "Upload".'
              : isEs
                ? 'Arrastra más documentos aquí para añadirlos.'
                : 'Drag more documents here to add them.'}
        </div>
      </div>
    </div>
  );
}
