'use client';

import Link from 'next/link';
import type { Article } from '@/types';
import { agentById } from '@/data/agents';
import { articleCategories } from '@/data/articles';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/i18n/context';
import { SmartImage } from '@/components/shared/smart-image';
import { Badge } from '@/components/ui/badge';

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const author = agentById(article.authorId);
  const category = articleCategories.find((item) => item.value === article.category);
  const { language, isEs } = useTranslation();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={article.cover}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          fallbackSeed={article.id}
          className="transition-transform duration-700 ease-entrance group-hover:scale-105"
        />
        <Badge variant="glass" className="absolute left-4 top-4">
          {category?.label ?? article.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
          {formatDate(article.publishedAt, language)} · {article.readingMinutes} {isEs ? 'min de lectura' : 'min read'}
        </p>
        <h3 className="mt-3 font-display text-xl leading-tight tracking-tight">
          <Link href={`/blog/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        {compact ? null : (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        {author ? (
          <p className="mt-auto pt-5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
            {isEs ? `Por ${author.name}` : `By ${author.name}`}
          </p>
        ) : null}
      </div>
    </article>
  );
}
