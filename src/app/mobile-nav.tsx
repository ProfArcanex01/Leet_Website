'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, ArrowRight, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { detectPlatform, APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/device';

const links = [
  { href: '#how', label: 'How it works' },
  { href: '#trust', label: 'Trust & safety' },
  { href: '#faqs', label: 'FAQ' },
  { href: '/agents', label: 'Become an agent', highlight: true },
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
    platform === 'ios' ? 'Download for iPhone' :
    platform === 'android' ? 'Download for Android' :
    'Download the App';

  const isExternal = platform !== 'unknown';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/15 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[300px] max-w-[85vw] flex-col border-l border-white/10 bg-[#0A0907] p-0 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-white/15 [&>button]:bg-white/5 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:bg-white/10 [&>button]:hover:opacity-100"
      >
        <SheetHeader className="border-b border-white/8 px-6 pb-5 pt-8 text-left">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Link href="/" onClick={() => setOpen(false)} className="inline-block">
            <span className="rounded-xl bg-white/10 px-4 py-2.5 text-xl font-bold tracking-tight text-white backdrop-blur-sm">
              Leet
            </span>
          </Link>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-0 px-4 py-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition ${
                link.highlight
                  ? 'bg-[#E06C2C]/15 text-[#f0b48c] hover:bg-[#E06C2C]/25'
                  : 'text-white/85 hover:bg-white/8 hover:text-white'
              }`}
            >
              {link.label}
              <ArrowRight className="h-4 w-4 opacity-60" />
            </a>
          ))}
        </nav>

        <div className="space-y-4 border-t border-white/8 p-6">
          <a
            href={storeHref}
            onClick={() => setOpen(false)}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E06C2C] py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(224,108,44,0.4)] transition hover:bg-[#c95d24]"
          >
            <Download className="h-4 w-4" />
            {storeLabel}
          </a>
          <div className="flex items-center justify-center gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
              onClick={() => setOpen(false)}
              className="opacity-90 transition hover:opacity-100"
            >
              <Image src="/app-store.svg" alt="App Store" width={120} height={36} className="h-9 w-auto" />
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get it on Google Play"
              onClick={() => setOpen(false)}
              className="opacity-90 transition hover:opacity-100"
            >
              <Image src="/play-store.svg" alt="Google Play" width={120} height={36} className="h-9 w-auto" />
            </a>
          </div>
          <p className="text-center text-[11px] text-white/45">
            Search <span className="font-semibold text-white/60">Leet-carpooling</span>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
