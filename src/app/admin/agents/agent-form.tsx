'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAgentAction, updateAgentAction } from '@/actions/agents';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/field';

export interface AgentFormValues {
  slug: string;
  name: string;
  role: string;
  license: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  citySlug: string;
  bio: string;
  languages: string;
  specialties: string;
  experienceYears: string;
  dealsClosed: string;
  rating: string;
  socialTiktok: string;
  socialInstagram: string;
  socialFacebook: string;
  loginEmail: string;
  password: string;
}

const EMPTY: AgentFormValues = {
  slug: '',
  name: '',
  role: '',
  license: '',
  avatar: '',
  phone: '',
  email: '',
  address: '',
  citySlug: '',
  bio: '',
  languages: '',
  specialties: '',
  experienceYears: '0',
  dealsClosed: '0',
  rating: '0',
  socialTiktok: '',
  socialInstagram: '',
  socialFacebook: '',
  loginEmail: '',
  password: '',
};

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPayload(values: AgentFormValues) {
  return {
    slug: values.slug,
    name: values.name,
    role: values.role,
    license: values.license || undefined,
    avatar: values.avatar,
    phone: values.phone,
    email: values.email,
    address: values.address || undefined,
    citySlug: values.citySlug,
    bio: values.bio,
    languages: splitList(values.languages),
    specialties: splitList(values.specialties),
    experienceYears: Number(values.experienceYears) || 0,
    dealsClosed: Number(values.dealsClosed) || 0,
    rating: Number(values.rating) || 0,
    social: {
      tiktok: values.socialTiktok || undefined,
      instagram: values.socialInstagram || undefined,
      facebook: values.socialFacebook || undefined,
    },
  };
}

interface AgentFormProps {
  agentId?: string;
  initialValues?: Partial<AgentFormValues>;
}

export function AgentForm({ agentId, initialValues }: AgentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AgentFormValues>({ ...EMPTY, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(agentId);

  function set<K extends keyof AgentFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = buildPayload(values);
      const result = isEdit
        ? await updateAgentAction(agentId!, payload)
        : await createAgentAction({ ...payload, loginEmail: values.loginEmail, password: values.password });

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(result.message);
      router.push('/admin/agents');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={fieldErrors.name}>
          <Input value={values.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Slug" error={fieldErrors.slug}>
          <Input value={values.slug} onChange={(e) => set('slug', e.target.value)} placeholder="jane-doe" required />
        </Field>
        <Field label="Role / title" error={fieldErrors.role}>
          <Input value={values.role} onChange={(e) => set('role', e.target.value)} placeholder="Senior Agent" required />
        </Field>
        <Field label="License (optional)" error={fieldErrors.license}>
          <Input value={values.license} onChange={(e) => set('license', e.target.value)} />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <Input value={values.phone} onChange={(e) => set('phone', e.target.value)} required />
        </Field>
        <Field label="Public email" error={fieldErrors.email}>
          <Input type="email" value={values.email} onChange={(e) => set('email', e.target.value)} required />
        </Field>
        <Field label="City slug" error={fieldErrors.citySlug}>
          <Input value={values.citySlug} onChange={(e) => set('citySlug', e.target.value)} placeholder="austin" required />
        </Field>
        <Field label="Address (optional)" error={fieldErrors.address}>
          <Input value={values.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Avatar URL" error={fieldErrors.avatar}>
          <Input value={values.avatar} onChange={(e) => set('avatar', e.target.value)} required />
        </Field>
      </section>

      <Field label="Bio" error={fieldErrors.bio}>
        <Textarea rows={4} value={values.bio} onChange={(e) => set('bio', e.target.value)} required />
      </Field>

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Languages (comma-separated)">
          <Input value={values.languages} onChange={(e) => set('languages', e.target.value)} placeholder="English, Spanish" />
        </Field>
        <Field label="Specialties (comma-separated)">
          <Input value={values.specialties} onChange={(e) => set('specialties', e.target.value)} placeholder="Luxury Condos, Relocation" />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <Field label="Years of experience">
          <Input type="number" min={0} value={values.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} />
        </Field>
        <Field label="Deals closed">
          <Input type="number" min={0} value={values.dealsClosed} onChange={(e) => set('dealsClosed', e.target.value)} />
        </Field>
        <Field label="Rating (0–5)">
          <Input type="number" min={0} max={5} step={0.1} value={values.rating} onChange={(e) => set('rating', e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <Field label="TikTok URL">
          <Input value={values.socialTiktok} onChange={(e) => set('socialTiktok', e.target.value)} />
        </Field>
        <Field label="Instagram URL">
          <Input value={values.socialInstagram} onChange={(e) => set('socialInstagram', e.target.value)} />
        </Field>
        <Field label="Facebook URL">
          <Input value={values.socialFacebook} onChange={(e) => set('socialFacebook', e.target.value)} />
        </Field>
      </section>

      {!isEdit ? (
        <section className="space-y-5 rounded-md border border-border p-5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">Login credentials</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Login email" error={fieldErrors.loginEmail}>
              <Input type="email" value={values.loginEmail} onChange={(e) => set('loginEmail', e.target.value)} required />
            </Field>
            <Field label="Temporary password" error={fieldErrors.password}>
              <Input type="text" value={values.password} onChange={(e) => set('password', e.target.value)} minLength={8} required />
            </Field>
          </div>
        </section>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create agent'}
        </Button>
      </div>
    </form>
  );
}
