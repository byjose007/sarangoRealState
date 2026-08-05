'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { sendContactMessage } from '@/actions/leads';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';

export function ContactForm() {
  const [pending, setPending] = React.useState(false);
  const { t, isEs } = useTranslation();

  const topics: { value: ContactInput['topic']; label: string }[] = React.useMemo(
    () => [
      { value: 'buying', label: isEs ? 'Comprar una vivienda' : 'Buying a home' },
      { value: 'selling', label: isEs ? 'Vender una vivienda' : 'Selling a home' },
      { value: 'renting', label: isEs ? 'Alquilar' : 'Renting' },
      { value: 'investment', label: isEs ? 'Inversión / Cartera' : 'Investment / portfolio' },
      { value: 'other', label: isEs ? 'Otro motivo' : 'Something else' },
    ],
    [isEs],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', topic: 'buying', message: '' },
  });

  const onSubmit = async (values: ContactInput) => {
    setPending(true);
    const result = await sendContactMessage(values);
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(t.agent.messageSent, { description: result.message });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 lg:p-8">
      <p className="font-mono text-eyebrow uppercase text-muted-foreground">{t.agent.sendMessage}</p>
      <h2 className="mt-3 font-display text-2xl tracking-tight">
        {isEs ? 'Dinos qué estás buscando' : 'Tell us what you are looking for'}
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">{t.agent.yourName}</Label>
          <Input id="contact-name" placeholder={t.agent.yourName} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="contact-email">{t.propertyDetail.email}</Label>
          <Input id="contact-email" type="email" placeholder="tu@email.com" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="contact-phone">{t.agent.phoneOptional}</Label>
          <Input id="contact-phone" placeholder="+34 600 000 000" {...register('phone')} />
        </div>
        <div>
          <Label htmlFor="contact-topic">{isEs ? '¿De qué trata tu consulta?' : 'What is this about?'}</Label>
          <Select id="contact-topic" {...register('topic')}>
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">{t.agent.message}</Label>
          <Textarea
            id="contact-message"
            rows={5}
            placeholder={isEs ? 'Zona, presupuesto, fechas — cuéntanos tus preferencias.' : 'Neighbourhood, budget, timing — whatever you have.'}
            {...register('message')}
          />
          <FieldError message={errors.message?.message} />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-6">
        <Send className="size-4" /> {pending ? t.propertyDetail.sending : t.agent.sendMessage}
      </Button>
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
        {isEs ? 'Respuesta el mismo día laborable · sin listas publicitarias' : 'Replies the same working day · no marketing lists'}
      </p>
    </form>
  );
}
