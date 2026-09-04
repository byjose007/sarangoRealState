'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addLeadNoteAction } from '@/actions/lead-pipeline';
import { useTranslation } from '@/i18n/context';

export function AddNoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      const result = await addLeadNoteAction(leadId, body);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setBody('');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={isEs ? 'Añadir una nota interna…' : 'Add a note…'}
      />
      <Button type="submit" size="sm" disabled={pending || !body.trim()}>
        {pending ? (isEs ? 'Guardando…' : 'Saving…') : isEs ? 'Añadir nota' : 'Add note'}
      </Button>
    </form>
  );
}
