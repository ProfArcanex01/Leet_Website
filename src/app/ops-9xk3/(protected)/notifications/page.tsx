"use client";

import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AdminUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone_number: string;
  email: string | null;
  user_type: "HOST" | "RIDER" | null;
  is_active: boolean;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type AudienceType = "all_users" | "hosts" | "riders" | "ios_users" | "android_users" | "agents" | "user_ids";
type NotificationType = "SYSTEM" | "PAYMENT" | "RIDE_REQUEST" | "RIDE_ACCEPTED" | "RIDE_REJECTED" | "RIDE_STARTED" | "RIDE_COMPLETED" | "RIDE_CANCELLED" | "RIDE_CANCELLED_CONFIRMATION" | "RIDE_APPROACHING" | "RIDE_REMINDER";

type Counts = {
  allUsers: number;
  hosts: number;
  riders: number;
  agents: number;
  iosUsers: number;
  androidUsers: number;
};

const notificationTypes: { value: NotificationType; label: string; tone: string }[] = [
  { value: "SYSTEM", label: "System", tone: "bg-stone-100 text-stone-700 border-stone-200" },
  { value: "PAYMENT", label: "Payment", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "RIDE_REQUEST", label: "Ride request", tone: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "RIDE_ACCEPTED", label: "Ride accepted", tone: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "RIDE_REJECTED", label: "Ride rejected", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "RIDE_STARTED", label: "Ride started", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "RIDE_COMPLETED", label: "Ride completed", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "RIDE_CANCELLED", label: "Ride cancelled", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "RIDE_CANCELLED_CONFIRMATION", label: "Cancellation confirmation", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "RIDE_APPROACHING", label: "Ride approaching", tone: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "RIDE_REMINDER", label: "Ride reminder", tone: "bg-amber-100 text-amber-700 border-amber-200" },
];

function extractApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`;
    }
    if (typeof value === "string") {
      return `${field}: ${value}`;
    }
  }
  return fallback;
}

function resolveUserLabel(user: AdminUser) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return fullName || user.email || user.phone_number;
}

function toneForNotification(type: NotificationType) {
  return notificationTypes.find((item) => item.value === type)?.tone || "bg-stone-100 text-stone-700 border-stone-200";
}

function humanizeAudience(audience: AudienceType) {
  switch (audience) {
    case "all_users":
      return "All active users";
    case "hosts":
      return "All active hosts";
    case "riders":
      return "All active riders";
    case "ios_users":
      return "Active iOS users";
    case "android_users":
      return "Active Android users";
    case "agents":
      return "Active agents";
    case "user_ids":
      return "Selected users";
    default:
      return "Audience";
  }
}

function formatDateTimeLocalInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminNotificationsPage() {
  const [pageTab, setPageTab] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("send");
  const [counts, setCounts] = useState<Counts>({ allUsers: 0, hosts: 0, riders: 0, agents: 0, iosUsers: 0, androidUsers: 0 });
  const [countsLoading, setCountsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);

  const [audienceType, setAudienceType] = useState<AudienceType>("all_users");
  const [notificationType, setNotificationType] = useState<NotificationType>("SYSTEM");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [metadataText, setMetadataText] = useState('{\n  "screen": "Inbox"\n}');
  const [sendAt, setSendAt] = useState("");

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const minScheduleTime = useMemo(
    () => formatDateTimeLocalInput(new Date(Date.now() + 5 * 60 * 1000)),
    [],
  );

  const selectedCount = useMemo(() => {
    if (audienceType === "all_users") return counts.allUsers;
    if (audienceType === "hosts") return counts.hosts;
    if (audienceType === "riders") return counts.riders;
    if (audienceType === "agents") return counts.agents;
    if (audienceType === "ios_users") return counts.iosUsers;
    if (audienceType === "android_users") return counts.androidUsers;
    return selectedUsers.length;
  }, [audienceType, counts, selectedUsers]);

  const metadataParse = useMemo(() => {
    const trimmed = metadataText.trim();
    if (!trimmed) return { value: {}, error: null as string | null };
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { value: null, error: "Metadata must be a JSON object." };
      }
      return { value: parsed, error: null as string | null };
    } catch {
      return { value: null, error: "Metadata must be valid JSON." };
    }
  }, [metadataText]);

  const canSubmit = Boolean(title.trim() && message.trim() && selectedCount > 0 && !metadataParse.error);
  const scheduledReady = Boolean(canSubmit && sendAt);
  const disabledReason = useMemo(() => {
    if (sending) return activeTab === "send" ? "Sending in progress." : "Scheduling in progress.";
    if (!title.trim()) return "Add a title.";
    if (!message.trim()) return "Add a message.";
    if (selectedCount <= 0) return "Choose an audience with at least one recipient.";
    if (metadataParse.error) return metadataParse.error;
    if (activeTab === "schedule" && !sendAt) return "Pick a future send time.";
    return null;
  }, [activeTab, message, metadataParse.error, selectedCount, sendAt, sending, title]);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      setCountsLoading(true);
      try {
        const response = await authFetch('/notifications/admin/audience-stats/');
        const payload = (await response.json().catch(() => null)) as Record<string, number> | null;
        if (!response.ok || !payload) {
          throw new Error(extractApiError(payload, "Unable to load audience stats."));
        }
        if (cancelled) return;
        setCounts({
          allUsers: payload.all_users || 0,
          hosts: payload.hosts || 0,
          riders: payload.riders || 0,
          agents: payload.agents || 0,
          iosUsers: payload.ios_users || 0,
          androidUsers: payload.android_users || 0,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load audience stats.");
        }
      } finally {
        if (!cancelled) setCountsLoading(false);
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function searchUsers() {
      if (!search.trim() || audienceType !== "user_ids") {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const query = new URLSearchParams({
          q: search.trim(),
          page_size: "12",
          is_active: "true",
        });
        const response = await authFetch(`/accounts/admin/users/?${query.toString()}`);
        const payload = (await response.json().catch(() => null)) as Paginated<AdminUser> | null;
        if (!response.ok) {
          throw new Error(extractApiError(payload, "Unable to search users."));
        }
        if (!cancelled) {
          const selectedIds = new Set(selectedUsers.map((user) => user.id));
          setSearchResults((payload?.results || []).filter((user) => !selectedIds.has(user.id)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to search users.");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }

    const timeout = window.setTimeout(searchUsers, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [audienceType, search, selectedUsers]);

  function addSelectedUser(user: AdminUser) {
    setSelectedUsers((current) => {
      if (current.some((item) => item.id === user.id)) return current;
      return [...current, user];
    });
    setSearch("");
    setSearchResults([]);
  }

  function removeSelectedUser(userId: number) {
    setSelectedUsers((current) => current.filter((user) => user.id !== userId));
  }

  function resetComposer() {
    setTitle("");
    setMessage("");
    setMetadataText('{\n  "screen": "Inbox"\n}');
    setSendAt("");
    setSearch("");
    setSearchResults([]);
    setSelectedUsers([]);
    setAudienceType("all_users");
    setNotificationType("SYSTEM");
  }

  async function submit(mode: "send" | "schedule") {
    if (mode === "send" && !canSubmit) return;
    if (mode === "schedule" && !scheduledReady) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    const payload = {
      audience:
        audienceType === "user_ids"
          ? { type: audienceType, user_ids: selectedUsers.map((user) => user.id) }
          : { type: audienceType },
      title: title.trim(),
      message: message.trim(),
      notification_type: notificationType,
      metadata: metadataParse.value || {},
      ...(mode === "schedule" ? { send_at: new Date(sendAt).toISOString() } : {}),
    };

    try {
      const response = await authFetch(
        mode === "send" ? "/notifications/admin/custom/" : "/notifications/admin/custom/schedule/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(extractApiError(data, "Unable to submit notification."));
      }

      const recipientCount = typeof data?.recipient_count === "number" ? data.recipient_count : selectedCount;
      setSuccess(
        mode === "send"
          ? `Notification queued for ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`
          : `Scheduled notification created for ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`,
      );
      resetComposer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit notification.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={pageTab} onValueChange={setPageTab} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Custom notifications</h2>
            <p className="text-sm text-muted-foreground">
              Review channel reach on the dashboard, then switch to composer when you are ready to send.
            </p>
          </div>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="composer">Composer</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <section className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
            <Card className="border-[color:var(--stroke)] bg-[linear-gradient(140deg,#f8f4ec_0%,#fffdf9_52%,#eef5ef_100%)] shadow-[var(--shadow)]">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">Delivery overview</CardTitle>
                    <CardDescription className="max-w-2xl text-sm leading-6">
                      Keep overview separate from composition. Use this tab to understand audience size and payload state before moving into the send flow.
                    </CardDescription>
                  </div>
                  <Badge className={`${toneForNotification(notificationType)} border px-3 py-1 text-xs font-semibold`}>
                    {notificationTypes.find((item) => item.value === notificationType)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Active users</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.allUsers}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Reachable hosts</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.hosts}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Reachable riders</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.riders}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Active agents</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.agents}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Reachable iOS devices</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.iosUsers}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-[color:var(--stroke)] bg-white/85 shadow-none">
                  <CardHeader className="pb-2">
                    <CardDescription>Reachable Android devices</CardDescription>
                    <CardTitle className="text-3xl">{countsLoading ? "..." : counts.androidUsers}</CardTitle>
                  </CardHeader>
                </Card>
              </CardContent>
            </Card>

            <Card className="border-[color:var(--stroke)] bg-white shadow-[var(--shadow)]">
              <CardHeader>
                <CardTitle>Current draft</CardTitle>
                <CardDescription>See who will receive the next draft and whether the payload is ready.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audience</p>
                  <p className="mt-2 text-lg font-semibold">{humanizeAudience(audienceType)}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} recipient{selectedCount === 1 ? "" : "s"}{audienceType === "user_ids" && selectedUsers.length > 0 ? ` selected manually.` : " estimated from active accounts."}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Message</p>
                  <p className="mt-2 line-clamp-2 text-base font-semibold text-foreground">
                    {title.trim() || "Title preview"}
                  </p>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {message.trim() || "Body preview will appear here once you start writing."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payload health</p>
                    <p className="mt-2 text-sm text-muted-foreground">Title: {title.trim().length}/100</p>
                    <p className="text-sm text-muted-foreground">Message: {message.trim().length}/2000</p>
                    <p className={`text-sm ${metadataParse.error ? "text-rose-600" : "text-muted-foreground"}`}>
                      Metadata: {metadataParse.error || "Valid JSON object"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Timing</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeTab === "send"
                        ? "Immediate send after confirmation."
                        : sendAt
                          ? `Scheduled for ${new Date(sendAt).toLocaleString()}`
                          : "Pick a future time to queue this send."}
                    </p>
                  </div>
                </div>
                <Button type="button" className="w-full" onClick={() => setPageTab("composer")}>
                  Open composer
                </Button>
              </CardContent>
            </Card>
          </section>

          <Card className="border-[color:var(--stroke)] shadow-[var(--shadow)]">
            <CardHeader>
              <CardTitle>Playbook</CardTitle>
              <CardDescription>Use short, action-oriented copy and route users with metadata instead of stuffing context into the body.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                <p className="font-medium text-foreground">Incident update</p>
                <p className="mt-1">Send to affected users only, use `SYSTEM`, and include metadata like `{`"screen":"Inbox"`}` or an incident id.</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                <p className="font-medium text-foreground">Payment nudge</p>
                <p className="mt-1">Use `PAYMENT` for billing or payout prompts so mobile clients can style the alert appropriately.</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                <p className="font-medium text-foreground">Scheduled outreach</p>
                <p className="mt-1">Queue reminders ahead of launches or maintenance windows instead of relying on someone to send them live.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composer" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <Card className="border-[color:var(--stroke)] shadow-[var(--shadow)]">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Compose notification</CardTitle>
                    <CardDescription>Choose the audience first, then tailor the payload and delivery timing.</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-3 lg:min-w-[280px]">
                    <p className="text-sm text-muted-foreground">
                      {selectedCount > 0
                        ? `${selectedCount} recipient${selectedCount === 1 ? "" : "s"} ready.`
                        : "Choose an audience before sending."}
                    </p>
                    {disabledReason ? <p className="text-xs text-amber-700">{disabledReason}</p> : null}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={resetComposer} disabled={sending} className="flex-1">
                        Reset
                      </Button>
                      {activeTab === "send" ? (
                        <Button type="button" onClick={() => submit("send")} disabled={!canSubmit || sending} className="flex-1">
                          {sending ? "Sending..." : "Send now"}
                        </Button>
                      ) : (
                        <Button type="button" onClick={() => submit("schedule")} disabled={!scheduledReady || sending} className="flex-1">
                          {sending ? "Scheduling..." : "Schedule"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="send">Send now</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label>Audience</Label>
                        <Select value={audienceType} onValueChange={(value: AudienceType) => setAudienceType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_users">All active users</SelectItem>
                            <SelectItem value="hosts">All active hosts</SelectItem>
                            <SelectItem value="riders">All active riders</SelectItem>
                            <SelectItem value="agents">Active agents</SelectItem>
                            <SelectItem value="ios_users">Active iOS users</SelectItem>
                            <SelectItem value="android_users">Active Android users</SelectItem>
                            <SelectItem value="user_ids">Selected users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {audienceType === "user_ids" ? (
                        <div className="space-y-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-4">
                          <div className="space-y-2">
                            <Label htmlFor="user-search">Find recipients</Label>
                            <Input
                              id="user-search"
                              value={search}
                              onChange={(event) => setSearch(event.target.value)}
                              placeholder="Search by name, phone, or email"
                            />
                            <p className="text-xs text-muted-foreground">
                              Search active users, then add only the people you want in this send.
                            </p>
                          </div>

                          <div className="rounded-xl border border-dashed border-[color:var(--stroke)] bg-white">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {searchLoading ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                      Searching users...
                                    </TableCell>
                                  </TableRow>
                                ) : searchResults.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                      {search.trim() ? "No matching active users." : "Start typing to search recipients."}
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  searchResults.map((user) => (
                                    <TableRow key={user.id}>
                                      <TableCell>
                                        <div className="font-medium">{resolveUserLabel(user)}</div>
                                        <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                                      </TableCell>
                                      <TableCell>{user.user_type || "—"}</TableCell>
                                      <TableCell className="text-right">
                                        <Button type="button" variant="outline" size="sm" onClick={() => addSelectedUser(user)}>
                                          Add
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-4 text-sm text-muted-foreground">
                          {audienceType === "all_users" && "Everyone with an active account will receive this notification."}
                          {audienceType === "hosts" && "Only active host accounts will receive this notification."}
                          {audienceType === "riders" && "Only active rider accounts will receive this notification."}
                          {audienceType === "agents" && "Only users with an active agent profile will receive this notification."}
                          {audienceType === "ios_users" && "Only users with an active iOS device token will receive this notification."}
                          {audienceType === "android_users" && "Only users with an active Android device token will receive this notification."}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Notification type</Label>
                        <Select value={notificationType} onValueChange={(value: NotificationType) => setNotificationType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notification type" />
                          </SelectTrigger>
                          <SelectContent>
                            {notificationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          maxLength={100}
                          placeholder="Headline shown in the push notification"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          maxLength={2000}
                          rows={6}
                          placeholder="Explain what changed and where the user should go next."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metadata">Metadata JSON</Label>
                        <Textarea
                          id="metadata"
                          value={metadataText}
                          onChange={(event) => setMetadataText(event.target.value)}
                          rows={7}
                          placeholder='{"screen":"Inbox"}'
                          className={metadataParse.error ? "border-rose-300 focus-visible:ring-rose-300" : ""}
                        />
                        <p className={`text-xs ${metadataParse.error ? "text-rose-600" : "text-muted-foreground"}`}>
                          {metadataParse.error || "Use this to pass app routing or campaign context."}
                        </p>
                      </div>

                      <TabsContent value="send" className="mt-0">
                        <div className="rounded-2xl border border-[color:var(--stroke)] bg-[linear-gradient(140deg,#fff9ef_0%,#fff 100%)] p-4">
                          <p className="text-sm font-semibold">Immediate send</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            The backend creates notification records and hands delivery to the normal push/email/app pipeline right away.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="schedule" className="mt-0 space-y-2">
                        <Label htmlFor="send-at">Send at</Label>
                        <Input
                          id="send-at"
                          type="datetime-local"
                          value={sendAt}
                          onChange={(event) => setSendAt(event.target.value)}
                          min={minScheduleTime}
                        />
                        <p className="text-xs text-muted-foreground">
                          Pick a future time. The backend will queue per-user scheduled sends with dedupe protection.
                        </p>
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>

                {success ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-[color:var(--stroke)] bg-white shadow-[var(--shadow)]">
                <CardHeader>
                  <CardTitle>Where it will send</CardTitle>
                  <CardDescription>Keep delivery target and preview beside the composer, not below it.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audience</p>
                    <p className="mt-2 text-lg font-semibold">{humanizeAudience(audienceType)}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCount} recipient{selectedCount === 1 ? "" : "s"}{audienceType === "user_ids" && selectedUsers.length > 0 ? ` selected manually.` : " estimated from active accounts."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Message preview</p>
                    <p className="mt-2 line-clamp-2 text-base font-semibold text-foreground">{title.trim() || "Title preview"}</p>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {message.trim() || "Body preview will appear here once you start writing."}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payload health</p>
                      <p className="mt-2 text-sm text-muted-foreground">Title: {title.trim().length}/100</p>
                      <p className="text-sm text-muted-foreground">Message: {message.trim().length}/2000</p>
                      <p className={`text-sm ${metadataParse.error ? "text-rose-600" : "text-muted-foreground"}`}>
                        Metadata: {metadataParse.error || "Valid JSON object"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Timing</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {activeTab === "send"
                          ? "Immediate send after confirmation."
                          : sendAt
                            ? `Scheduled for ${new Date(sendAt).toLocaleString()}`
                            : "Pick a future time to queue this send."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[color:var(--stroke)] shadow-[var(--shadow)]">
                <CardHeader>
                  <CardTitle>Selected recipients</CardTitle>
                  <CardDescription>Manual targeting is best for VIP riders, staff, or incident-specific updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-sm text-muted-foreground">
                      No individual recipients selected.
                    </div>
                  ) : (
                    selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{resolveUserLabel(user)}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.phone_number} {user.user_type ? `• ${user.user_type}` : ""}
                          </p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => removeSelectedUser(user.id)}>
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
