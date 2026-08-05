import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  compact = false,
  showText = true,
  size = 'md',
}: {
  className?: string;
  compact?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const badgeSizes = {
    sm: 'h-10 w-10 p-1 rounded-xl',
    md: 'h-12 w-12 sm:h-14 sm:w-14 p-1 rounded-2xl',
    lg: 'h-16 w-16 sm:h-20 sm:w-20 p-1.5 rounded-3xl',
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl sm:text-2xl font-extrabold',
    lg: 'text-2xl sm:text-3xl font-extrabold',
  };

  const subtitleSizes = {
    sm: 'text-[0.6rem]',
    md: 'text-[0.68rem] sm:text-xs',
    lg: 'text-xs sm:text-sm',
  };

  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-3 shrink-0 select-none', className)}
      aria-label="Sarango Real Estate"
    >
      <div
        className={cn(
          'relative overflow-hidden bg-white shadow-sm ring-1 ring-border/70 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:ring-brass/60 shrink-0 flex items-center justify-center',
          badgeSizes[size],
        )}
      >
        <Image
          src="/images/logo-sarango-real.jpeg"
          alt="Sarango Real Estate Logo"
          width={120}
          height={120}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      {!compact && showText ? (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'font-display tracking-tight text-current transition-colors group-hover:text-brass',
              titleSizes[size],
            )}
          >
            Sarango
          </span>
          <span
            className={cn(
              'font-sans font-bold tracking-[0.18em] text-brass uppercase mt-1',
              subtitleSizes[size],
            )}
          >
            Real Estate
          </span>
        </div>
      ) : null}
    </Link>
  );
}


