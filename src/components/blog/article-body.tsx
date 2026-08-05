import { cn } from '@/lib/utils';

/**
 * Minimal markdown renderer for the mock journal content.
 * Handles headings, ordered lists and paragraphs — enough for the demo, and
 * without dragging an MDX runtime into the bundle.
 */
export function ArticleBody({ content, className }: { content: string; className?: string }) {
  const blocks = content.split('\n\n');

  return (
    <div className={cn('space-y-6', className)}>
      {blocks.map((block, index) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={index} className="pt-4 font-display text-2xl tracking-tight">
              {block.replace('## ', '')}
            </h2>
          );
        }
        if (/^\d\./m.test(block)) {
          return (
            <ol key={index} className="space-y-2 border-l-2 border-brass pl-5">
              {block.split('\n').map((line) => (
                <li key={line} className="text-[0.95rem] text-muted-foreground">
                  {line.replace(/^\d\.\s*/, '')}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={index} className="text-[1.02rem] leading-[1.75] text-muted-foreground">
            {block}
          </p>
        );
      })}
    </div>
  );
}
