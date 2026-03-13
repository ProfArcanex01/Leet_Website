"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { clearAdminToken, getAdminToken } from '@/lib/api';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  description: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/ops-9xk3', description: 'Overview & quick links' },
  { label: 'Users', href: '/ops-9xk3/users', description: 'Hosts, riders, and staff' },
  { label: 'Notifications', href: '/ops-9xk3/notifications', description: 'Custom push & scheduled sends' },
  { label: 'Network', href: '/ops-9xk3/network', description: 'Invite relationship graph' },
  { label: 'Transactions', href: '/ops-9xk3/transactions', description: 'Payments & settlements' },
  { label: 'Rides', href: '/ops-9xk3/rides', description: 'Ride history & status' },
  { label: 'System', href: '/ops-9xk3/system', description: 'Pricing & configuration' },
  { label: 'Waitlist', href: '/ops-9xk3/waitlist', description: 'Launch waitlist signups' },
  { label: 'Agents', href: '/ops-9xk3/agents', description: 'Recruitment applications' },
  { label: 'Training', href: '/ops-9xk3/training', description: 'Agent learning materials' },
  { label: 'Support', href: '/ops-9xk3/support', description: 'Support tickets & reports' },
];

/* Shared nav list — used by both the sidebar and the mobile drawer */
function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => onNavigate(item.href)}
          className={cn(
            'rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-semibold transition-all',
            pathname === item.href
              ? 'border-[color:var(--stroke)] bg-[color:var(--soft)]'
              : 'text-muted-foreground hover:bg-[color:var(--soft)]',
          )}
        >
          <div>{item.label}</div>
          <div className="text-xs font-normal text-muted-foreground">{item.description}</div>
        </button>
      ))}
    </nav>
  );
}

function QuickNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {navItems
        .filter((item) => item.href !== '/ops-9xk3')
        .map((item) => (
          <Button
            key={item.href}
            variant="outline"
            className={cn(
              'h-10 shrink-0 rounded-2xl border-[color:var(--stroke)] bg-white px-4',
              pathname === item.href && 'bg-[color:var(--soft)] text-foreground',
            )}
            onClick={() => onNavigate(item.href)}
          >
            {item.label}
          </Button>
        ))}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/ops-9xk3/login');
      return;
    }
    setReady(true);
  }, [router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeItem = useMemo(
    () => navItems.find((item) => pathname === item.href) ?? navItems[0],
    [pathname],
  );

  function navigate(href: string) {
    router.push(href);
    setMobileMenuOpen(false);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <div className="min-h-screen bg-[color:var(--paper)]">
        <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:py-10">

          {/* ── Desktop sidebar (lg+) ──────────────────────────── */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Leet Admin
                </p>
                <h2 className="mt-2 text-xl font-semibold">Superadmin</h2>
              </div>
              <NavList pathname={pathname} onNavigate={navigate} />
            </div>
          </aside>

          {/* ── Mobile drawer (<lg) ────────────────────────────── */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-72 overflow-y-auto p-6">
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Leet Admin
                  </p>
                  <span className="mt-1 block text-xl font-semibold">Superadmin</span>
                </SheetTitle>
              </SheetHeader>
              <NavList pathname={pathname} onNavigate={navigate} />
              <div className="mt-6 border-t border-[color:var(--stroke)] pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearAdminToken();
                    router.replace('/ops-9xk3/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <main className="flex-1">
            {/* ── Top bar ──────────────────────────────────────── */}
            <div className="mb-8 rounded-3xl border border-[color:var(--stroke)] bg-white px-4 py-4 shadow-[var(--shadow)] sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-3">
                {/* Hamburger — visible below lg */}
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="inline-flex items-center justify-center rounded-xl border border-[color:var(--stroke)] p-2 text-muted-foreground transition-colors hover:bg-[color:var(--soft)] lg:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold">{activeItem.label}</h1>
                    <p className="text-sm text-muted-foreground">{activeItem.description}</p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:max-w-3xl">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                    <form
                      className="flex w-full items-center gap-2 md:max-w-md"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!searchTerm.trim()) return;
                        router.push(`/ops-9xk3/users?q=${encodeURIComponent(searchTerm.trim())}`);
                      }}
                    >
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search users by name, phone, or email"
                        className="bg-[color:var(--paper)]"
                      />
                      <Button type="submit" variant="outline" className="shrink-0">
                        Search
                      </Button>
                    </form>

                    <Button
                      variant="outline"
                      className="hidden shrink-0 rounded-2xl border-[color:var(--stroke)] lg:inline-flex"
                      onClick={() => {
                        clearAdminToken();
                        router.replace('/ops-9xk3/login');
                      }}
                    >
                      Sign out
                    </Button>
                  </div>

                  <div className="hidden lg:block">
                    <QuickNav pathname={pathname} onNavigate={navigate} />
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:hidden">
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] px-3 py-2 text-xs text-muted-foreground">
                  Open the menu for full admin navigation.
                </div>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
