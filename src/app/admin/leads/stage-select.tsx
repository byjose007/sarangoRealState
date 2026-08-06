'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select } from '@/components/ui/input';
import { updateLeadStageAction } from '@/actions/lead-pipeline';
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/admin/labels';

export function StageSelect({ leadId, stage, className }: { leadId: string; stage: string; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(nextStage: string) {
    if (nextStage === stage) return;
    startTransition(async () => {
      const result = await updateLeadStageAction(leadId, nextStage);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Select
      value={stage}
      disabled={pending}
      onClick={(e) => e.preventDefault()}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {STAGE_ORDER.map((value) => (
        <option key={value} value={value}>
          {STAGE_LABELS[value]}
        </option>
      ))}
    </Select>
  );
}
