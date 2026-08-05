import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FloatingChat } from '@/components/layout/floating-chat';
import { BackToTop } from '@/components/layout/back-to-top';
import { Preloader } from '@/components/layout/preloader';
import { QuickViewHost } from '@/components/property/quick-view';
import { CompareBar } from '@/components/property/compare-bar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="pt-[5rem] sm:pt-[5.5rem] lg:pt-[7.5rem]">
        {children}
      </main>
      <Footer />
      <FloatingChat />
      <BackToTop />
      <QuickViewHost />
      <CompareBar />
    </>
  );
}
