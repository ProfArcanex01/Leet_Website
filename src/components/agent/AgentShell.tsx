"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronsUpDown,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clearAgentToken, getAgentToken } from "@/lib/api";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/agent-portal",
    description: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Invitees",
    href: "/agent-portal/invitees",
    description: "Your people",
    icon: Users,
  },
  {
    label: "Materials",
    href: "/agent-portal/materials",
    description: "Training",
    icon: BookOpen,
  },
  {
    label: "Invite codes",
    href: "/agent-portal/invite-codes",
    description: "Your codes",
    icon: KeyRound,
  },
];

function AgentNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => onNavigate(item.href)}
            className={cn(
              "group rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300",
              isActive
                ? "border-white/20 bg-white/12 text-white shadow-[0_24px_50px_rgba(0,0,0,0.18)]"
                : "border-white/8 bg-white/[0.03] text-white/72 hover:border-white/14 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                  isActive ? "bg-[#F08E43] text-white" : "bg-white/8 text-white/70 group-hover:bg-white/12",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 text-xs leading-5 text-white/52">{item.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export function AgentShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAgentToken();
    if (!token) {
      router.replace("/agent-portal/login");
      return;
    }
    setReady(true);
  }, [router]);

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

  function signOut() {
    clearAgentToken();
    router.replace("/agent-portal/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1020] text-sm text-white/70">
        Securing your workspace...
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <div className="min-h-screen bg-[#07111E] text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_20%_20%,rgba(35,145,112,0.25),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(240,142,67,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_58%)]" />

        <div className="relative mx-auto flex max-w-[1500px] gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <aside className="hidden w-[300px] flex-shrink-0 xl:block">
            <div className="sticky top-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#96FFD5]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Agent Portal
                </div>
                <h2 className="mt-5 text-[2rem] leading-none text-white">Field Ops</h2>
              </div>

              <AgentNavList pathname={pathname} onNavigate={navigate} />

              <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/40">
                  <span>Mode</span>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </div>
                <div className="mt-3 text-lg font-semibold text-white">Agent workspace</div>
              </div>

              <Button
                variant="outline"
                className="mt-7 w-full rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </aside>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-[88vw] max-w-[340px] border-white/10 bg-[#091424] p-5 text-white">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#96FFD5]">
                    Agent Portal
                  </span>
                  <span className="mt-2 block text-2xl font-semibold text-white">Field Ops</span>
                </SheetTitle>
              </SheetHeader>
              <AgentNavList pathname={pathname} onNavigate={navigate} />
              <Button
                variant="outline"
                className="mt-6 w-full rounded-2xl border-white/12 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </SheetContent>
          </Sheet>

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-5 py-5 shadow-[0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/84 xl:hidden"
                  aria-label="Open agent menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="mt-2 text-3xl font-semibold text-white">{activeItem.label}</h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-white/12 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                  onClick={() => navigate("/agent-portal/invitees")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Invitees
                </Button>
                <Button
                  className="rounded-full bg-[#F08E43] text-white shadow-[0_18px_40px_rgba(240,142,67,0.34)] hover:bg-[#df7f35]"
                  onClick={() => navigate("/agent-portal/materials")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Open materials
                </Button>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
