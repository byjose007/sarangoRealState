'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { articles } from '@/data/articles';
import { useTranslation } from '@/i18n/context';
import { ArticleCard } from '@/components/blog/article-card';
import { SectionHeading } from '@/components/shared/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { Reveal } from '@/components/shared/reveal';

export function JournalPreview() {
  const { t } = useTranslation();

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={t.home.theJournal}
          title={t.home.theJournalTitle}
          action={
            <Link href="/blog" className={buttonVariants({ variant: 'outline' })}>
              {t.home.readJournal} <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article, index) => (
            <Reveal key={article.id} delay={index * 0.08}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
