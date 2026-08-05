'use client';

import Link from 'next/link';
import type { Article } from '@/types';
import { articleCategories } from '@/data/articles';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ArticleCard } from '@/components/blog/article-card';
import { Reveal } from '@/components/shared/reveal';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';

export function BlogView({ filtered, category }: { filtered: Article[]; category?: string }) {
  const { t, isEs } = useTranslation();
  const [lead, ...rest] = filtered;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="container py-12 lg:py-16">
          <Breadcrumb items={[{ label: t.home.theJournal }]} />
          <h1 className="mt-6 text-headline balance">{t.home.theJournalTitle}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {isEs
              ? 'Artículos sobre precios, planos, costes de reforma y análisis técnico del mercado inmobiliario.'
              : 'Thirty pieces on pricing, plans, renovation costs and what the market is actually doing.'}
          </p>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Article categories">
            <Link
              href="/blog"
              className={cn(
                'rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors',
                !category ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted',
              )}
            >
              {isEs ? 'Todos' : 'All'}
            </Link>
            {articleCategories.map((item) => (
              <Link
                key={item.value}
                href={`/blog?category=${item.value}`}
                className={cn(
                  'rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors',
                  category === item.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:bg-muted',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="container py-14">
        {!filtered.length ? (
          <EmptyState
            title={isEs ? 'No hay artículos en esta categoría' : 'No articles in this category yet'}
            body={isEs ? 'Publicamos nuevos artículos e informes cada dos semanas.' : 'The journal is written by the field team — new pieces land every fortnight.'}
            actionLabel={isEs ? 'Leer todo' : 'Read everything'}
            actionHref="/blog"
          />
        ) : (
          <>
            {lead ? (
              <Reveal className="mb-10">
                <ArticleCard article={lead} />
              </Reveal>
            ) : null}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, index) => (
                <Reveal key={article.id} delay={Math.min(index, 6) * 0.05}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
