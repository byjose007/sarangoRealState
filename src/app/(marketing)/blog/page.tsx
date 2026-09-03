import { articles } from '@/data/articles';
import { buildMetadata } from '@/lib/seo';
import { BlogView } from '@/components/blog/blog-view';

export const metadata = buildMetadata({
  title: 'Journal',
  description:
    'Market reports, buying guides and field notes from the Sarango Real Estate survey team.',
  path: '/blog',
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const filtered = category
    ? articles.filter((article) => article.category === category)
    : articles;

  return <BlogView filtered={filtered} category={category} />;
}
