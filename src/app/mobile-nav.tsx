'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { detectPlatform, APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/device';

const links = [
  { href: '#how', label: 'How it works' },
  { href: '#trust', label: 'Trust & safety' },
  { href: '#faqs', label: 'FAQ' },
  { href: '/support', label: 'Support' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const storeHref =
    platform === 'ios' ? APP_STORE_URL :
    platform === 'android' ? GOOGLE_PLAY_URL :
    '#download';

  const storeLabel =
    platform === 'ios' ? 'Download for iPhone (Leet-carpooling)' :
    platform === 'android' ? 'Download for Android (Leet-carpooling)' :
    'Download the App';

  const isExternal = platform !== 'unknown';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--stroke)] bg-[color:var(--card)] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[280px] flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">
            <span className="rounded-xl bg-[color:var(--ink)] px-3 py-1.5 text-lg font-bold tracking-tight text-white">
              Leet
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-[color:var(--stroke)]/60 px-1 py-3.5 text-sm font-medium text-[color:var(--ink)]"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pb-2">
          <Button asChild className="w-full rounded-full py-3 text-sm font-semibold shadow-[var(--shadow)]">
            <a
              href={storeHref}
              onClick={() => setOpen(false)}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {storeLabel}
            </a>
          </Button>
          <div className="flex items-center justify-center gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
              onClick={() => setOpen(false)}
            >
              <Image src="/app-store.svg" alt="App Store" width={110} height={32} className="h-8 w-auto" />
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
              onClick={() => setOpen(false)}
            >
              <Image src="/play-store.svg" alt="Google Play" width={110} height={32} className="h-8 w-auto" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
