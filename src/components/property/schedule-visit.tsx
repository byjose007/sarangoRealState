'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CalendarCheck } from 'lucide-react';
import { requestViewing } from '@/actions/leads';
import { viewingSchema, type ViewingInput } from '@/lib/validation';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TIMES = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

// Deterministic base date for SSR hydration parity
const SSR_BASE = new Date('2026-08-01T00:00:00Z');

function nextDays(count: number, baseDate?: Date, lang: string = 'es') {
  const now = baseDate ?? SSR_BASE;
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() + index + 1);
    return {
      value: date.toISOString().slice(0, 10),
      weekday: date.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' }),
      day: date.getUTCDate(),
      month: date.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' }),
    };
  });
}

export function ScheduleVisit({ reference, className }: { reference: string; className?: string }) {
  const { language, t, isEs } = useTranslation();
  const [days, setDays] = React.useState(() => nextDays(5, SSR_BASE, language));

  React.useEffect(() => {
    setDays(nextDays(5, new Date(), language));
  }, [language]);

  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ViewingInput>({
    resolver: zodResolver(viewingSchema),
    defaultValues: {
      date: days[0]?.value ?? '',
      time: TIMES[1],
      propertyReference: reference,
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const selectedDate = watch('date');

  const onSubmit = async (values: ViewingInput) => {
    setPending(true);
    const result = await requestViewing(values);
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(isEs ? 'Visita solicitada con éxito' : 'Viewing requested', { description: result.message });
    reset({ ...values, name: '', email: '', phone: '', message: '' });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('rounded-lg border border-border bg-card p-6', className)}
    >
      <p className="font-mono text-eyebrow uppercase text-muted-foreground">{t.propertyDetail.scheduleViewing}</p>
      <p className="mt-3 font-display text-xl tracking-tight">{t.propertyDetail.walkPlanInPerson}</p>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {days.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setValue('date', day.value, { shouldValidate: true })}
            className={cn(
              'rounded-md border px-1 py-2.5 text-center transition-colors',
              selectedDate === day.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            <span className="block font-mono text-[0.6rem] uppercase opacity-70">{day.weekday}</span>
            <span className="block font-display text-lg leading-tight">{day.day}</span>
            <span className="block font-mono text-[0.6rem] uppercase opacity-70">{day.month}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="time">{t.propertyDetail.time}</Label>
          <Select id="time" {...register('time')}>
            {TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Select>
          <FieldError message={errors.time?.message} />
        </div>
        <div>
          <Label htmlFor="visit-name">{t.propertyDetail.name}</Label>
          <Input id="visit-name" placeholder={t.agent.yourName} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="visit-email">{t.propertyDetail.email}</Label>
            <Input id="visit-email" type="email" placeholder="tu@email.com" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="visit-phone">{t.propertyDetail.phone}</Label>
            <Input id="visit-phone" placeholder="+34 600 000 000" {...register('phone')} />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="visit-message">{t.propertyDetail.anythingToFlag}</Label>
          <Textarea id="visit-message" rows={3} placeholder={t.propertyDetail.optional} {...register('message')} />
          <FieldError message={errors.message?.message} />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="mt-5 w-full">
        <CalendarCheck className="size-4" />
        {pending ? t.propertyDetail.sending : t.propertyDetail.requestSlot}
      </Button>
      <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
        Ref {reference} · {isEs ? 'confirmación en 2h' : 'confirmation within 2h'}
      </p>
    </form>
  );
}
