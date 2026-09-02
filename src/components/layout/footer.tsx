'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { getFooterNav } from '@/constants/navigation';
import { siteConfig } from '@/constants/site';
import { useTranslation } from '@/i18n/context';
import { Logo } from './logo';
import { Newsletter } from './newsletter';

const socials = [
  { href: siteConfig.social.tiktok, icon: FaTiktok, label: 'TikTok' },
  { href: siteConfig.social.instagram, icon: FaInstagram, label: 'Instagram' },
  { href: siteConfig.social.facebook, icon: FaFacebookF, label: 'Facebook' },
];

export function Footer() {
  const { t } = useTranslation();
  const footerColumns = React.useMemo(() => getFooterNav(t), [t]);

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo size="lg" className="text-background" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/70">
              {t.footer.description}
            </p>
            <div className="mt-8">
              <p className="font-mono text-eyebrow uppercase text-background/50">
                {t.footer.marketNotes}
              </p>
              <div className="mt-3 max-w-md [&_input]:border-background/25 [&_input]:bg-background/5 [&_input]:text-background [&_input]:placeholder:text-background/40">
                <Newsletter compact />
              </div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="font-mono text-eyebrow uppercase text-background/50">
                  {column.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-background/80 hover:text-background"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-background/15 pt-10 sm:grid-cols-3">
          {siteConfig.offices.map((office) => (
            <div key={office.city}>
              <p className="font-display text-lg">{office.city}</p>
              <p className="mt-2 flex gap-2 text-sm text-background/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brass" />
                {office.address}
              </p>
              <a
                href={`tel:${office.phone}`}
                className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-background/70 hover:text-background"
              >
                <Phone className="size-3.5 text-brass" /> {office.phone}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-background/15 pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer noopener"
                className="grid h-10 w-10 place-items-center rounded-full border border-background/20 text-background/80 transition-colors hover:border-brass hover:text-brass"
              >
                <social.icon className="size-4" />
              </a>
            ))}
          </div>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-2 font-mono text-xs text-background/70 hover:text-background"
          >
            <Mail className="size-3.5 text-brass" /> {siteConfig.email}
          </a>
        </div>
      </div>

      {/* Oversized wordmark: the plan-sheet title block, blown up */}
      <div className="overflow-hidden border-t border-background/15">
        <p className="select-none whitespace-nowrap px-4 pt-6 text-center font-display text-[clamp(3.5rem,15vw,14rem)] leading-[0.8] tracking-[-0.05em] text-background/10">
          Sarango
        </p>
      </div>

      <div className="border-t border-background/15">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-background/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. {t.footer.rightsReserved}
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-background">
              {t.footer.privacy}
            </Link>
            <Link href="/about" className="hover:text-background">
              {t.footer.terms}
            </Link>
            <Link href="/coming-soon" className="hover:text-background">
              {t.footer.careers}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
