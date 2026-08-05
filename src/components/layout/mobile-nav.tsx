'use client';

import * as React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { getMainNav } from '@/constants/navigation';
import { siteConfig } from '@/constants/site';
import { useUi } from '@/store/ui-store';
import { useTranslation } from '@/i18n/context';
import { Drawer } from '@/components/ui/drawer';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const open = useUi((state) => state.mobileNavOpen);
  const setOpen = useUi((state) => state.setMobileNav);
  const { t } = useTranslation();
  const close = () => setOpen(false);

  const navItems = React.useMemo(() => getMainNav(t), [t]);

  return (
    <Drawer open={open} onClose={close} side="right" title={t.nav.openMenu}>
      <nav className="flex flex-col divide-y divide-border" aria-label="Mobile">
        {navItems.map((item) => (
          <div key={item.label} className="px-5 py-4">
            <Link href={item.href} onClick={close} className="font-display text-xl tracking-tight">
              {item.label}
            </Link>
            {item.children ? (
              <div className="mt-3 flex flex-col gap-2">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={close}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-4 border-t border-border p-5">
        <a
          href={`tel:${siteConfig.phone}`}
          className="inline-flex items-center gap-2 font-mono text-sm"
        >
          <Phone className="size-4 text-brass" /> {siteConfig.phone}
        </a>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/contact" onClick={close} className="flex-1">
            <Button className="w-full" variant="ink">
              {t.nav.bookViewing}
            </Button>
          </Link>
          <LanguageToggle showLabel />
          <ThemeToggle />
        </div>
      </div>
    </Drawer>
  );
}
