import { notFound } from 'next/navigation';
import { articleBySlug, articles } from '@/data/articles';
import { agentById } from '@/data/agents';
import { buildMetadata } from '@/lib/seo';
import { ArticleDetailView } from '@/components/blog/article-detail-view';

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return buildMetadata({ title: 'Article not found', path: '/blog' });
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    image: article.cover,
    type: 'article',
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const author = agentById(article.authorId);
  const related = articles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .slice(0, 3);

  return <ArticleDetailView article={article} author={author} related={related} />;
}
