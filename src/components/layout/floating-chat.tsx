'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Phone, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { siteConfig } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/button';

/** Contact launcher: WhatsApp, phone, or a message to the desk. */
export function FloatingChat() {
  const [open, setOpen] = React.useState(false);
  const { isEs } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="w-[min(20rem,84vw)] rounded-lg border border-border bg-card p-5 shadow-lift"
          >
            <p className="font-mono text-eyebrow uppercase text-muted-foreground">
              {isEs ? 'Atención al cliente' : 'Talk to the desk'}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {isEs
                ? 'Un agente homologado te atenderá de 9:00 a 18:00. Fuera de ese horario te responderemos la siguiente mañana laboral.'
                : 'A licensed agent answers between 9:00 and 18:00. Outside those hours you will get a reply the next working morning.'}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-medium text-black"
              >
                <FaWhatsapp className="size-4" /> {isEs ? 'Mensaje por WhatsApp' : 'Message on WhatsApp'}
              </a>
              <a href={`tel:${siteConfig.phone}`}>
                <Button variant="outline" className="w-full">
                  <Phone className="size-4" /> {siteConfig.phone}
                </Button>
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close contact panel' : 'Open contact panel'}
        className="grid h-13 w-13 place-items-center rounded-full bg-primary p-4 text-primary-foreground shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}
