'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Menu, Phone, Scale, Search } from 'lucide-react';
import { getMainNav, NavItem } from '@/constants/navigation';
import { siteConfig } from '@/constants/site';
import { useCollections } from '@/store/collections';
import { useUi } from '@/store/ui-store';
import { useScroll } from '@/hooks/use-scroll';
import { useMounted } from '@/hooks/use-mounted';
import { useTranslation } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { MobileNav } from './mobile-nav';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrolled, direction } = useScroll(30);
  const mounted = useMounted();
  const { t } = useTranslation();
  const setMobileNav = useUi((state) => state.setMobileNav);
  const favorites = useCollections((state) => state.favorites);
  const compare = useCollections((state) => state.compare);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [term, setTerm] = React.useState('');

  const navItems = React.useMemo(() => getMainNav(t), [t]);

  React.useEffect(() => setOpenMenu(null), [pathname]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchOpen(false);
    router.push(`/properties?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <header
        onMouseLeave={() => setOpenMenu(null)}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-entrance',
          direction === 'down' && !openMenu ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        {/* Utility strip — collapses away as soon as the page moves */}
        <div
          className={cn(
            'hidden overflow-hidden border-b border-border/60 bg-foreground text-background transition-all duration-500 lg:block',
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
          )}
        >
          <div className="container flex h-10 items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em]">
            <span>{t.nav.utilityStripText}</span>
            <div className="flex items-center gap-6">
              <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 hover:text-brass">
                <Phone className="size-3" /> {siteConfig.phone}
              </a>
              <span className="text-background/60">{t.common.hours}</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'transition-all duration-500',
            scrolled ? 'glass border-b border-border/70' : 'border-b border-transparent bg-background',
          )}
        >
          <div className="container flex h-[5rem] sm:h-[5.5rem] items-center justify-between gap-6">
            <Logo size="md" />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
              {navItems.map((item) => (
                <div key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.label)}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors',
                      pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.label}
                    {item.children ? <ChevronDown className="size-3.5 opacity-60" /> : null}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <LanguageToggle className="mr-1" />

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t.nav.findHome}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <Search className="size-4" />
              </button>

              <Link
                href="/compare"
                aria-label={t.nav.compareListings}
                className="relative hidden h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-muted sm:grid"
              >
                <Scale className="size-4" />
                {mounted && compare.length ? <Count value={compare.length} /> : null}
              </Link>

              <Link
                href="/favorites"
                aria-label={t.nav.savedHomes}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <Heart className="size-4" />
                {mounted && favorites.length ? <Count value={favorites.length} /> : null}
              </Link>

              <ThemeToggle className="hidden sm:grid" />

              <Link href="/contact" className="hidden lg:block">
                <Button size="sm" variant="ink">
                  {t.nav.bookViewing}
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setMobileNav(true)}
                aria-label={t.nav.openMenu}
                className="grid h-10 w-10 place-items-center rounded-full border border-border lg:hidden"
              >
                <Menu className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openMenu ? <MegaPanel label={openMenu} navItems={navItems} /> : null}
        </AnimatePresence>
      </header>

      <MobileNav />

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title={t.nav.findHome}>
        <form onSubmit={submitSearch} className="space-y-4">
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t.nav.searchPlaceholder}
          />
          <div className="flex flex-wrap gap-2">
            {['Cuenca', t.property.types.penthouse, t.property.forRent, t.property.types.apartment].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setTerm(chip)}
                className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
              >
                {chip}
              </button>
            ))}
          </div>
          <Button type="submit" className="w-full">
            {t.nav.searchBtn}
          </Button>
        </form>
      </Modal>
    </>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brass px-1 font-mono text-[0.6rem] text-brass-foreground">
      {value}
    </span>
  );
}

function MegaPanel({ label, navItems }: { label: string; navItems: NavItem[] }) {
  const item = navItems.find((entry) => entry.label === label);
  if (!item?.children) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full hidden border-b border-border bg-surface shadow-soft lg:block"
    >
      <div className="container grid gap-x-10 gap-y-2 py-8 md:grid-cols-3">
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="group rounded-md p-4 transition-colors hover:bg-muted"
          >
            <span className="font-display text-base tracking-tight">{child.label}</span>
            {child.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{child.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
