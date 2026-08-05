'use client';

import * as React from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState(path);

  React.useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const links = [
    { label: 'WhatsApp', icon: FaWhatsapp, href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: 'X', icon: FaXTwitter, href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { label: 'Facebook', icon: FaFacebookF, href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: 'LinkedIn', icon: FaLinkedinIn, href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user dismissed the sheet */
      }
    }
    setOpen(true);
  };

  return (
    <>
      <Button variant="outline" onClick={share} className="h-11">
        <Share2 className="size-4" /> Share
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share this home">
        <div className="grid grid-cols-4 gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-col items-center gap-2 rounded-md border border-border p-4 text-xs transition-colors hover:bg-muted"
            >
              <link.icon className="size-5" />
              {link.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-left text-sm hover:bg-muted"
        >
          <span className="truncate text-muted-foreground">{url}</span>
          {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
        </button>
      </Modal>
    </>
  );
}
