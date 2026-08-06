'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageItem {
  id: string;
  url: string;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  href: string;
}

export function MediaManager({
  propertyId,
  images,
  documents,
}: {
  propertyId: string;
  images: ImageItem[];
  documents: DocumentItem[];
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <ImagesPanel propertyId={propertyId} images={images} />
      <DocumentsPanel propertyId={propertyId} documents={documents} />
    </div>
  );
}

function ImagesPanel({ propertyId, images }: { propertyId: string; images: ImageItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);
      formData.append('kind', 'image');
      const response = await fetch('/api/uploads', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success('Image uploaded.');
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/uploads?id=${id}&kind=image`, { method: 'DELETE' });
      const result = await response.json();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Images ({images.length})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" /> Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary uploaded file, not worth next/image's optimization pipeline */}
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(image.id)}
              disabled={pending}
              aria-label="Remove image"
              className="absolute right-1 top-1 hidden rounded-full bg-foreground/70 p-1.5 text-background group-hover:block"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {images.length === 0 ? <p className="col-span-3 text-sm text-muted-foreground">No images yet.</p> : null}
      </div>
    </div>
  );
}

function DocumentsPanel({ propertyId, documents }: { propertyId: string; documents: DocumentItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);
      formData.append('kind', 'document');
      formData.append('name', file.name);
      const response = await fetch('/api/uploads', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success('Document uploaded.');
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
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Documents ({documents.length})
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" /> Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,application/acad,image/vnd.dwg,application/zip,application/x-zip-compressed"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2 truncate">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{doc.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{doc.size}</span>
            </span>
            <button
              type="button"
              onClick={() => remove(doc.id)}
              disabled={pending}
              aria-label="Remove document"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents yet.</p> : null}
      </ul>
    </div>
  );
}
