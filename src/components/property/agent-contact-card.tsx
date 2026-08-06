'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import type { Agent } from '@/types';
import { messageAgent } from '@/actions/leads';
import { agentMessageSchema, type AgentMessageInput } from '@/lib/validation';
import { siteConfig } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { Rating } from '@/components/shared/rating';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Textarea } from '@/components/ui/input';

export function AgentContactCard({ agent, subject }: { agent: Agent; subject?: string }) {
  const [pending, setPending] = React.useState(false);
  const { t, isEs } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentMessageInput>({
    resolver: zodResolver(agentMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: subject
        ? isEs ? `Me gustaría solicitar más información sobre ${subject}.` : `I would like more information about ${subject}.`
        : '',
    },
  });

  const onSubmit = async (values: AgentMessageInput) => {
    setPending(true);
    const result = await messageAgent(values, agent.id);
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(t.agent.messageSent, { description: result.message });
    reset();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
          <SmartImage src={agent.avatar} alt={agent.name} fill sizes="64px" fallbackSeed={agent.id} />
        </div>
        <div>
          <Link href={`/agents/${agent.slug}`} className="font-display text-lg tracking-tight hover:text-primary">
            {agent.name}
          </Link>
          <p className="text-sm text-muted-foreground">{agent.role}</p>
          {agent.license && (
            <p className="flex items-center gap-1.5 text-xs text-brass font-medium mt-0.5">
              <ShieldCheck className="size-3.5" /> {agent.license}
            </p>
          )}
          <Rating value={agent.rating} className="mt-1" />
        </div>
      </div>

      <div className="mt-5 space-y-2 border-y border-border py-4 font-mono text-xs">
        {agent.address && (
          <div className="flex items-start gap-2 text-muted-foreground pb-1">
            <MapPin className="size-3.5 shrink-0 text-brass mt-0.5" />
            <span className="leading-snug">{agent.address}</span>
          </div>
        )}
        <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-primary">
          <Phone className="size-3.5 text-brass" /> {agent.phone}
        </a>
        <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-primary">
          <Mail className="size-3.5 text-brass" /> {agent.email}
        </a>
        {(agent.social?.tiktok || agent.social?.instagram || agent.social?.facebook) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-2">
            {agent.social?.tiktok && (
              <a
                href={agent.social.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="TikTok"
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brass hover:text-brass"
              >
                <FaTiktok className="size-3.5" />
              </a>
            )}
            {agent.social?.instagram && (
              <a
                href={agent.social.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brass hover:text-brass"
              >
                <FaInstagram className="size-3.5" />
              </a>
            )}
            {agent.social?.facebook && (
              <a
                href={agent.social.facebook}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brass hover:text-brass"
              >
                <FaFacebookF className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
        <div>
          <Input placeholder={t.agent.yourName} aria-label={t.agent.yourName} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Input type="email" placeholder={t.propertyDetail.email} aria-label={t.propertyDetail.email} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Input placeholder={t.agent.phoneOptional} aria-label={t.agent.phoneOptional} {...register('phone')} />
        </div>
        <div>
          <Textarea rows={4} aria-label={t.agent.message} {...register('message')} />
          <FieldError message={errors.message?.message} />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t.propertyDetail.sending : t.agent.sendMessage}
        </Button>
      </form>

      <a
        href={`https://wa.me/${siteConfig.whatsapp}`}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-black"
      >
        <FaWhatsapp className="size-4" /> {t.agent.chatWhatsapp}
      </a>
    </div>
  );
}
