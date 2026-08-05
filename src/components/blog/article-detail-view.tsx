'use client';

import Link from 'next/link';
import type { Agent, Article } from '@/types';
import { articleCategories } from '@/data/articles';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/i18n/context';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { SmartImage } from '@/components/shared/smart-image';
import { ArticleBody } from '@/components/blog/article-body';
import { ArticleCard } from '@/components/blog/article-card';
import { ShareButtons } from '@/components/property/share-buttons';
import { Badge } from '@/components/ui/badge';
import { Newsletter } from '@/components/layout/newsletter';

interface ArticleDetailViewProps {
  article: Article;
  author?: Agent;
  related: Article[];
}

export function ArticleDetailView({ article, author, related }: ArticleDetailViewProps) {
  const { language, t, isEs } = useTranslation();
  const category = articleCategories.find((item) => item.value === article.category);

  return (
    <>
      <header className="container py-12">
        <Breadcrumb items={[{ label: t.home.theJournal, href: '/blog' }, { label: category?.label ?? (isEs ? 'Artículo' : 'Article') }]} />
        <Badge variant="soft" className="mt-6">
          {category?.label ?? article.category}
        </Badge>
        <h1 className="mt-4 max-w-3xl text-headline balance">{article.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {author ? `${author.name} · ` : ''}
            {formatDate(article.publishedAt, language)} · {article.readingMinutes} {isEs ? 'min de lectura' : 'min read'}
          </p>
          <ShareButtons title={article.title} path={`/blog/${article.slug}`} />
        </div>
      </header>

      <div className="container">
        <div className="tick-frame relative aspect-[16/8] overflow-hidden rounded-xl">
          <SmartImage
            src={article.cover}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            fallbackSeed={article.id}
          />
        </div>
      </div>

      <article className="container grid gap-12 py-12 lg:grid-cols-[1fr_18rem]">
        <ArticleBody content={article.content} className="max-w-2xl" />

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-eyebrow uppercase text-muted-foreground">Etiquetas</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="font-mono text-eyebrow uppercase text-muted-foreground">{t.footer.marketNotes}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {isEs ? 'Un correo al mes con la información real del mercado.' : 'One email a month with the numbers behind the headlines.'}
            </p>
            <div className="mt-4">
              <Newsletter compact />
            </div>
          </div>
        </aside>
      </article>

      {related.length ? (
        <section className="border-t border-border bg-surface py-16">
          <div className="container">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-2xl tracking-tight">{isEs ? 'Lecturas relacionadas' : 'Related reading'}</h2>
              <Link href="/blog" className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-primary hover:underline">
                {isEs ? 'Todos los artículos →' : 'All articles →'}
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} compact />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
