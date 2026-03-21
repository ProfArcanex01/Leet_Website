"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  CircleAlert,
  Clock3,
  Film,
  FileText,
  ImageIcon,
  LoaderCircle,
  MapPinned,
  PlayCircle,
  Rocket,
  Smartphone,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agentAuthFetch } from "@/lib/api";

export type InviteCodeSummary = {
  id: number;
  code: string;
  is_active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  redemptions_remaining: number | null;
};

export type Invitee = {
  id: number;
  first_name: string;
  last_name: string;
  user_type: string | null;
  date_joined: string | null;
  invite_activated_at: string | null;
  redeemed_at: string | null;
};

export type LearningMaterial = {
  id: number;
  title: string;
  slug: string;
  description: string;
  material_type: "PDF" | "IMAGE" | "VIDEO";
  asset_url: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  published_at: string | null;
  progress_percent: number;
  completed_at: string | null;
  last_viewed_at: string | null;
};

export type DashboardResponse = {
  total_invited_users: number;
  host_invites: number;
  rider_invites: number;
  active_invite_codes: number;
  total_invite_redemptions: number;
  one_time_invite_activations: number;
  published_materials: number;
  recent_invitees: Invitee[];
  invite_codes: InviteCodeSummary[];
};

type InviteeListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invitee[];
};

const statCards = [
  {
    key: "total_invited_users",
    label: "People activated",
    accent: "from-[#96FFD5]/20 via-white/0 to-white/0",
    icon: Users,
  },
  {
    key: "host_invites",
    label: "Hosts onboarded",
    accent: "from-[#F08E43]/18 via-white/0 to-white/0",
    icon: Rocket,
  },
  {
    key: "rider_invites",
    label: "Riders onboarded",
    accent: "from-[#7DB8FF]/18 via-white/0 to-white/0",
    icon: BadgeCheck,
  },
  {
    key: "published_materials",
    label: "Live materials",
    accent: "from-[#B695FF]/16 via-white/0 to-white/0",
    icon: BookOpen,
  },
  {
    key: "one_time_invite_activations",
    label: "One-time invites used",
    accent: "from-[#F8D66D]/18 via-white/0 to-white/0",
    icon: PlayCircle,
  },
] as const;

const workflowSteps = [
  {
    step: "01",
    title: "Find drivers in the right places.",
    copy: "Washing bays, fuel stations, mechanics. Meet drivers where they already wait and start the conversation there.",
    icon: MapPinned,
  },
  {
    step: "02",
    title: "Get them set up in minutes.",
    copy: "Help them download Leet, complete their profile, and get to their first route without dropping off halfway.",
    icon: Smartphone,
  },
  {
    step: "03",
    title: "Earn when they qualify.",
    copy: "Your credit comes from qualified recruits under Leet's current commission terms, not downloads or empty profiles.",
    icon: CircleDollarSign,
  },
] as const;

export function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function materialIcon(type: LearningMaterial["material_type"]) {
  switch (type) {
    case "VIDEO":
      return Film;
    case "IMAGE":
      return ImageIcon;
    case "PDF":
    default:
      return FileText;
  }
}

function materialLabel(type: LearningMaterial["material_type"]) {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "IMAGE":
      return "Image guide";
    case "PDF":
    default:
      return "PDF playbook";
  }
}

export function useAgentPortalData() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadPortal() {
      setLoading(true);
      setError(null);
      try {
        const [dashboardResponse, materialsResponse, inviteesResponse] = await Promise.all([
          agentAuthFetch("/agents/me/dashboard/"),
          agentAuthFetch("/agents/me/materials/"),
          agentAuthFetch("/agents/me/invitees/?page_size=8"),
        ]);

        if (!dashboardResponse.ok || !materialsResponse.ok || !inviteesResponse.ok) {
          throw new Error("Unable to load the agent portal right now.");
        }

        const [dashboardPayload, materialsPayload, inviteesPayload] = await Promise.all([
          dashboardResponse.json(),
          materialsResponse.json(),
          inviteesResponse.json(),
        ]);

        if (!isMounted) return;
        setDashboard(dashboardPayload);
        setMaterials(materialsPayload);
        setInvitees((inviteesPayload as InviteeListResponse).results || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load the agent portal.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPortal();
    return () => {
      isMounted = false;
    };
  }, []);

  async function updateMaterialProgress(materialId: number, currentProgress: number) {
    setProgressUpdates((state) => ({ ...state, [materialId]: true }));
    try {
      const nextProgress = currentProgress >= 100 ? 100 : Math.min(currentProgress + 25, 100);
      const response = await agentAuthFetch(`/agents/me/materials/${materialId}/progress/`, {
        method: "POST",
        body: JSON.stringify({
          progress_percent: nextProgress,
          is_completed: nextProgress >= 100,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || "Unable to update progress.");
      }

      setMaterials((current) =>
        current.map((material) =>
          material.id === materialId
            ? {
                ...material,
                progress_percent: payload.progress_percent ?? nextProgress,
                completed_at: payload.completed_at ?? material.completed_at,
                last_viewed_at: payload.last_viewed_at ?? material.last_viewed_at,
              }
            : material,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update material progress.");
    } finally {
      setProgressUpdates((state) => ({ ...state, [materialId]: false }));
    }
  }

  return {
    dashboard,
    materials,
    invitees,
    loading,
    error,
    progressUpdates,
    updateMaterialProgress,
  };
}

export function AgentPortalState({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.04] text-white/70 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
        Loading your portal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-[#F08E43]/20 bg-[#2A1A12]/70 p-6 text-[#FFD3B5] shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5" />
          <div>
            <h2 className="text-xl text-white">Portal unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-[#FFD3B5]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function DashboardSection({ dashboard }: { dashboard: DashboardResponse }) {
  const primaryInviteCode =
    dashboard.invite_codes.find((code) => code.is_active)?.code ??
    dashboard.invite_codes[0]?.code ??
    null;

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#96FFD5]">
              Workflow
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white">How agent recruiting works</h3>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/56">
            Follow this sequence in the field so invites are attributed correctly and count toward commissions.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.step}
                className="rounded-[1.9rem] border border-[#D7B892]/30 bg-[linear-gradient(180deg,rgba(250,245,236,0.98),rgba(242,232,216,0.94))] text-[#221A12] shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#F2E9DB] text-[#E86E24]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-mono text-2xl font-bold leading-none text-[#6E6E73]">
                      {step.step}
                    </div>
                  </div>
                  <div className="mt-8">
                    <h4 className="text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-tight tracking-[-0.02em] text-[#1F1A15]">
                      {step.title}
                    </h4>
                    {step.step === "02" ? (
                      <div className="mt-4 space-y-3 text-base leading-8 text-[#6A6257]">
                        <p>{step.copy}</p>
                        <p>
                          Use your agent code{" "}
                          <span className="rounded-full bg-[#F2E9DB] px-3 py-1 font-mono text-sm font-semibold tracking-[0.12em] text-[#1F1A15]">
                            {primaryInviteCode ?? "your assigned code"}
                          </span>{" "}
                          as the invitation code so we can track your progress.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-base leading-8 text-[#6A6257]">
                        {step.copy}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-[linear-gradient(135deg,rgba(9,24,37,0.94),rgba(11,30,46,0.86))] text-white shadow-[0_38px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute right-[-3rem] top-[-4rem] h-48 w-48 rounded-full bg-[#96FFD5]/14 blur-3xl" />
            <div className="absolute bottom-[-5rem] right-12 h-52 w-52 rounded-full bg-[#F08E43]/12 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_35%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#96FFD5]">
                Live recruiting pulse
              </div>
              <h2 className="mt-5 max-w-[10ch] text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] text-white">
                Your dashboard.
              </h2>
              <p className="mt-4 max-w-[38ch] text-sm leading-7 text-white/60 md:text-base">
                Track invites, codes, and materials.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Total redemptions
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {dashboard.total_invite_redemptions}
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    Active codes
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {dashboard.active_invite_codes}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = dashboard[card.key];
            return (
              <Card
                key={card.key}
                className="rounded-[1.8rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,24,36,0.94),rgba(7,18,30,0.88))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                <CardContent className="relative overflow-hidden p-5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-white/62">
                        {card.label}
                      </div>
                      <div className="mt-3 text-4xl font-semibold text-white">{value}</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white/90">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function MaterialsSection({
  materials,
  progressUpdates,
  updateMaterialProgress,
}: {
  materials: LearningMaterial[];
  progressUpdates: Record<number, boolean>;
  updateMaterialProgress: (materialId: number, currentProgress: number) => Promise<void>;
}) {
  return (
    <section className="grid gap-4 pb-10 xl:grid-cols-2">
      {materials.length ? (
        materials.map((material) => {
          const Icon = materialIcon(material.material_type);
          return (
            <Card
              key={material.id}
              className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,24,36,0.94),rgba(7,18,30,0.88))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="rounded-full border-0 bg-[#96FFD5]/16 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#96FFD5]">
                      {materialLabel(material.material_type)}
                    </Badge>
                    <CardTitle className="mt-4 text-2xl text-white">{material.title}</CardTitle>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white/88">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-white/60">
                  {material.description || "No description added yet."}
                </p>

                <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/54">Progress</span>
                    <span className="font-semibold text-white">{material.progress_percent}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#96FFD5] to-[#F08E43] transition-all"
                      style={{ width: `${material.progress_percent}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/46">
                    <span>Published {formatDate(material.published_at)}</span>
                    {material.duration_seconds ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {Math.ceil(material.duration_seconds / 60)} min
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={material.asset_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#F08E43] px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(240,142,67,0.34)] transition hover:bg-[#df7f35]"
                  >
                    {material.material_type === "VIDEO" ? (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    )}
                    Open asset
                  </a>
                  <Button
                    variant="outline"
                    disabled={Boolean(progressUpdates[material.id])}
                    className="h-11 rounded-full border-white/12 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
                    onClick={() => updateMaterialProgress(material.id, material.progress_percent)}
                  >
                    {progressUpdates[material.id] ? "Updating..." : "Mark progress"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card className="rounded-[1.9rem] border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(10,24,36,0.84),rgba(7,18,30,0.78))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl xl:col-span-2">
          <CardContent className="p-8">
            <div className="flex max-w-xl flex-col gap-3">
              <Badge className="w-fit rounded-full border-0 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
                No materials yet
              </Badge>
              <h3 className="text-2xl text-white">Training content will show up here.</h3>
              <p className="text-sm leading-7 text-white/58">Published materials will appear here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export function InviteesSection({ invitees, dashboard }: { invitees: Invitee[]; dashboard: DashboardResponse }) {
  return (
    <section className="grid gap-4 pb-10 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,24,36,0.94),rgba(7,18,30,0.88))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Recent invitees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitees.length ? (
            invitees.map((invitee) => (
              <div
                key={invitee.id}
                className="flex flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-lg font-semibold text-white">
                    {[invitee.first_name, invitee.last_name].filter(Boolean).join(" ") || "Unnamed invitee"}
                  </div>
                  <div className="mt-1 text-sm text-white/50">Joined {formatDate(invitee.date_joined)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full border-0 bg-[#96FFD5]/14 px-3 py-1 text-[#96FFD5]">
                    {invitee.user_type || "User"}
                  </Badge>
                  <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-white/70">
                    Redeemed {formatDate(invitee.redeemed_at)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-white/56">No invitees have redeemed your codes yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,24,36,0.94),rgba(7,18,30,0.88))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Recruiting mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/58">Hosts</div>
            <div className="mt-2 text-4xl font-semibold text-white">{dashboard.host_invites}</div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/58">Riders</div>
            <div className="mt-2 text-4xl font-semibold text-white">{dashboard.rider_invites}</div>
          </div>
          <p className="text-sm leading-7 text-white/56">Based on your redeemed invite codes.</p>
        </CardContent>
      </Card>
    </section>
  );
}

export function InviteCodesSection({ inviteCodes }: { inviteCodes: InviteCodeSummary[] }) {
  return (
    <section className="grid gap-4 pb-10 lg:grid-cols-2">
      {inviteCodes.length ? (
        inviteCodes.map((code) => (
          <Card
            key={code.id}
            className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,24,36,0.94),rgba(7,18,30,0.88))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
          >
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/58">Invite code</div>
                  <div className="mt-3 font-mono text-3xl font-semibold tracking-[0.1em] text-white">{code.code}</div>
                </div>
                <Badge
                  className={`rounded-full border-0 px-3 py-1 ${
                    code.is_active ? "bg-[#96FFD5]/16 text-[#96FFD5]" : "bg-white/10 text-white/60"
                  }`}
                >
                  {code.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/58">Used</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{code.redemption_count}</div>
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/58">Remaining</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{code.redemptions_remaining ?? "∞"}</div>
                </div>
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/58">Expires</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {code.expires_at ? formatDate(code.expires_at) : "No expiry"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="rounded-[1.9rem] border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(10,24,36,0.84),rgba(7,18,30,0.78))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl lg:col-span-2">
          <CardContent className="p-8">
            <p className="text-sm leading-7 text-white/58">No invite codes assigned yet.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
