'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#how', label: 'How it works' },
  { href: '#trust', label: 'Trust & safety' },
  { href: '#faqs', label: 'FAQ' },
  { href: '#download', label: 'Download App' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

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
      <SheetContent side="right" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <span className="rounded-xl bg-black px-3 py-1.5 text-lg font-bold tracking-tight text-white">
              Leet
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-[color:var(--ink)] transition-colors hover:bg-[color:var(--soft)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-6 px-4">
          <Button asChild className="w-full rounded-full text-sm font-semibold shadow-[var(--shadow)]">
            <a href="#download" onClick={() => setOpen(false)}>
              Download App
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
