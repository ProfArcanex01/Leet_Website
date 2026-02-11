"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
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
  { label: 'Network', href: '/ops-9xk3/network', description: 'Invite relationship graph' },
  { label: 'Transactions', href: '/ops-9xk3/transactions', description: 'Payments & settlements' },
  { label: 'Rides', href: '/ops-9xk3/rides', description: 'Ride history & status' },
  { label: 'System', href: '/ops-9xk3/system', description: 'Pricing & configuration' },
  { label: 'Waitlist', href: '/ops-9xk3/waitlist', description: 'Launch waitlist signups' },
  { label: 'Support', href: '/ops-9xk3/support', description: 'Support tickets & reports' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/ops-9xk3/login');
      return;
    }
    setReady(true);
  }, [router]);

  const activeItem = useMemo(
    () => navItems.find((item) => pathname === item.href) ?? navItems[0],
    [pathname]
  );

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
        <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Leet Admin
                </p>
                <h2 className="mt-2 text-xl font-semibold">Superadmin</h2>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-semibold transition-all',
                      pathname === item.href
                        ? 'border-[color:var(--stroke)] bg-[color:var(--soft)]'
                        : 'text-muted-foreground hover:bg-[color:var(--soft)]'
                    )}
                  >
                    <div>{item.label}</div>
                    <div className="text-xs font-normal text-muted-foreground">{item.description}</div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-[color:var(--stroke)] bg-white px-6 py-4 shadow-[var(--shadow)] lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{activeItem.label}</h1>
                <p className="text-sm text-muted-foreground">{activeItem.description}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                <form
                  className="flex flex-1 items-center gap-2 lg:max-w-md"
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
                  />
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={() => router.push('/ops-9xk3/users')}>
                    Users
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/ops-9xk3/network')}>
                    Network
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/ops-9xk3/transactions')}>
                    Transactions
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/ops-9xk3/rides')}>
                    Rides
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearAdminToken();
                      router.replace('/ops-9xk3/login');
                    }}
                  >
                    Sign out
                  </Button>
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
