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
type NotificationType = "SYSTEM" | "PAYMENT" | "PROMOTION" | "RIDE_REQUEST" | "RIDE_ACCEPTED" | "RIDE_REJECTED" | "RIDE_STARTED" | "RIDE_COMPLETED" | "RIDE_CANCELLED" | "RIDE_CANCELLED_CONFIRMATION" | "RIDE_APPROACHING" | "RIDE_REMINDER";
type PresentationMode = "standard" | "modal";
type ModalActionType = "none" | "destination" | "external_url";
type DestinationType =
  | "none"
  | "rider_home"
  | "rider_explore"
  | "rider_notifications"
  | "rider_profile"
  | "rider_rides"
  | "rider_ride_detail"
  | "rider_tracking"
  | "rider_help"
  | "rider_account_settings"
  | "rider_preferences"
  | "host_home"
  | "host_active"
  | "host_rides"
  | "host_requests"
  | "host_request_detail"
  | "host_notifications"
  | "host_profile"
  | "host_plan"
  | "host_earnings"
  | "host_history"
  | "host_help"
  | "host_account_settings"
  | "host_preferences"
  | "host_vehicle_settings"
  | "safety_share";

type Counts = {
  allUsers: number;
  hosts: number;
  riders: number;
  agents: number;
  iosUsers: number;
  androidUsers: number;
};

type CampaignDestination = { type: Exclude<DestinationType, "none">; params?: Record<string, number | string> };

type AdminNotificationCampaign = {
  id: number;
  delivery_mode: "IMMEDIATE" | "SCHEDULED";
  notification_type: string;
  title: string;
  message: string;
  audience: {
    type: AudienceType;
    user_ids?: number[];
  };
  metadata: StructuredMetadata & Record<string, unknown>;
  recipient_count: number;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  created_by: number | null;
  created_by_name: string | null;
};

type StructuredMetadata = {
  presentation?: "modal";
  campaign_id?: string;
  version?: number;
  eyebrow?: string;
  title?: string;
  body?: string;
  cta_label?: string;
  secondary_cta_label?: string;
  dismissible?: boolean;
  show_once?: boolean;
  action_url?: string;
  destination?: CampaignDestination;
};

const notificationTypes: { value: NotificationType; label: string; tone: string }[] = [
  { value: "SYSTEM", label: "System", tone: "bg-stone-100 text-stone-700 border-stone-200" },
  { value: "PAYMENT", label: "Payment", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "PROMOTION", label: "Promotion", tone: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
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

const destinationOptions: { value: DestinationType; label: string; description: string }[] = [
  { value: "none", label: "No in-app destination", description: "Use the app's default notification behavior." },
  { value: "rider_home", label: "Rider home", description: "Open the rider home screen." },
  { value: "rider_explore", label: "Rider explore", description: "Open rider explore." },
  { value: "rider_notifications", label: "Rider notifications", description: "Open the rider notification center." },
  { value: "rider_profile", label: "Rider profile", description: "Open rider profile." },
  { value: "rider_rides", label: "Rider rides", description: "Open the rider rides list." },
  { value: "rider_ride_detail", label: "Rider ride detail", description: "Open a specific rider ride." },
  { value: "rider_tracking", label: "Rider tracking", description: "Open rider live tracking." },
  { value: "rider_help", label: "Rider help", description: "Open rider help." },
  { value: "rider_account_settings", label: "Rider account settings", description: "Open rider account settings." },
  { value: "rider_preferences", label: "Rider preferences", description: "Open rider preferences." },
  { value: "host_home", label: "Host home", description: "Open the host home screen." },
  { value: "host_active", label: "Host active rides", description: "Open the host active route screen." },
  { value: "host_rides", label: "Host rides", description: "Open host rides." },
  { value: "host_requests", label: "Host requests", description: "Open host requests." },
  { value: "host_request_detail", label: "Host request detail", description: "Open a specific host request." },
  { value: "host_notifications", label: "Host notifications", description: "Open the host notification center." },
  { value: "host_profile", label: "Host profile", description: "Open host profile." },
  { value: "host_plan", label: "Host plan", description: "Open route planning." },
  { value: "host_earnings", label: "Host earnings", description: "Open earnings." },
  { value: "host_history", label: "Host history", description: "Open host history." },
  { value: "host_help", label: "Host help", description: "Open host help." },
  { value: "host_account_settings", label: "Host account settings", description: "Open host account settings." },
  { value: "host_preferences", label: "Host preferences", description: "Open host preferences." },
  { value: "host_vehicle_settings", label: "Host vehicle settings", description: "Open host vehicle settings." },
  { value: "safety_share", label: "Safety share", description: "Open a safety-share link." },
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

function isNotificationType(value: string): value is NotificationType {
  return notificationTypes.some((item) => item.value === value);
}

function toneForNotification(type: string) {
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

function destinationLabel(destination: DestinationType) {
  return destinationOptions.find((option) => option.value === destination)?.label || "No in-app destination";
}

function destinationNeedsRideId(destination: DestinationType) {
  return destination === "rider_ride_detail";
}

function destinationNeedsRequestId(destination: DestinationType) {
  return destination === "host_request_detail";
}

function destinationNeedsToken(destination: DestinationType) {
  return destination === "safety_share";
}

function destinationFamily(destination: DestinationType) {
  if (destination === "none" || destination === "safety_share") return "shared";
  if (destination.startsWith("rider_")) return "rider";
  if (destination.startsWith("host_")) return "host";
  return "shared";
}

function notificationLabel(type: string) {
  return notificationTypes.find((item) => item.value === type)?.label || type;
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
  const [manualAudienceUserIds, setManualAudienceUserIds] = useState<number[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<AdminNotificationCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [reusingCampaignId, setReusingCampaignId] = useState<number | null>(null);

  const [audienceType, setAudienceType] = useState<AudienceType>("all_users");
  const [notificationType, setNotificationType] = useState<NotificationType>("SYSTEM");
  const [presentationMode, setPresentationMode] = useState<PresentationMode>("standard");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType>("none");
  const [destinationRideId, setDestinationRideId] = useState("");
  const [destinationRequestId, setDestinationRequestId] = useState("");
  const [destinationToken, setDestinationToken] = useState("");
  const [modalEyebrow, setModalEyebrow] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalPrimaryLabel, setModalPrimaryLabel] = useState("");
  const [modalSecondaryLabel, setModalSecondaryLabel] = useState("Maybe later");
  const [modalDismissible, setModalDismissible] = useState("true");
  const [modalShowOnce, setModalShowOnce] = useState("true");
  const [modalCampaignId, setModalCampaignId] = useState("");
  const [modalVersion, setModalVersion] = useState("1");
  const [modalActionType, setModalActionType] = useState<ModalActionType>("destination");
  const [modalActionUrl, setModalActionUrl] = useState("");
  const [metadataText, setMetadataText] = useState("{}");
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
    return manualAudienceUserIds.length;
  }, [audienceType, counts, manualAudienceUserIds]);

  const audienceDestinationMode = useMemo<"shared" | "host" | "rider" | "all">(() => {
    if (audienceType === "hosts") return "host";
    if (audienceType === "riders") return "rider";
    if (audienceType === "ios_users" || audienceType === "android_users") return "all";
    if (audienceType === "user_ids") {
      if (selectedUsers.length === 0) return "shared";
      const everyHost = selectedUsers.every((user) => user.user_type === "HOST");
      if (everyHost) return "host";
      const everyRider = selectedUsers.every((user) => user.user_type === "RIDER");
      if (everyRider) return "rider";
      return "shared";
    }
    return "shared";
  }, [audienceType, selectedUsers]);

  const compatibleDestinationOptions = useMemo(() => {
    if (audienceDestinationMode === "all") {
      return destinationOptions;
    }
    if (audienceDestinationMode === "host") {
      return destinationOptions.filter((option) => {
        const family = destinationFamily(option.value);
        return family === "host" || family === "shared";
      });
    }
    if (audienceDestinationMode === "rider") {
      return destinationOptions.filter((option) => {
        const family = destinationFamily(option.value);
        return family === "rider" || family === "shared";
      });
    }
    return destinationOptions.filter((option) => destinationFamily(option.value) === "shared");
  }, [audienceDestinationMode]);

  const destinationCompatibleWithAudience = useMemo(() => {
    const family = destinationFamily(destinationType);
    if (family === "shared") return true;
    if (audienceDestinationMode === "all") return true;
    if (audienceDestinationMode === "host") return family === "host";
    if (audienceDestinationMode === "rider") return family === "rider";
    return false;
  }, [audienceDestinationMode, destinationType]);

  const isModalCampaign = presentationMode === "modal";
  const modalDismissibleValue = modalDismissible === "true";
  const modalShowOnceValue = modalShowOnce === "true";
  const usesDestinationCta = !isModalCampaign || modalActionType === "destination";

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

  const destinationParse = useMemo(() => {
    if (!usesDestinationCta) {
      return { value: null as null | { type: Exclude<DestinationType, "none">; params?: Record<string, number | string> }, error: null as string | null };
    }
    if (!destinationCompatibleWithAudience) {
      return { value: null, error: "Selected destination is not compatible with this audience." };
    }
    if (destinationType === "none") {
      return { value: null as null | { type: Exclude<DestinationType, "none">; params?: Record<string, number | string> }, error: null as string | null };
    }

    if (destinationNeedsRideId(destinationType)) {
      const rideId = Number(destinationRideId);
      if (!destinationRideId.trim()) {
        return { value: null, error: "Add a ride id for the selected destination." };
      }
      if (!Number.isInteger(rideId) || rideId <= 0) {
        return { value: null, error: "Ride id must be a positive integer." };
      }
      return { value: { type: destinationType, params: { ride_id: rideId } }, error: null as string | null };
    }

    if (destinationNeedsRequestId(destinationType)) {
      const requestId = Number(destinationRequestId);
      if (!destinationRequestId.trim()) {
        return { value: null, error: "Add a request id for the selected destination." };
      }
      if (!Number.isInteger(requestId) || requestId <= 0) {
        return { value: null, error: "Request id must be a positive integer." };
      }
      return { value: { type: destinationType, params: { request_id: requestId } }, error: null as string | null };
    }

    if (destinationNeedsToken(destinationType)) {
      if (!destinationToken.trim()) {
        return { value: null, error: "Add a token for the selected destination." };
      }
      return { value: { type: destinationType, params: { token: destinationToken.trim() } }, error: null as string | null };
    }

    return { value: { type: destinationType }, error: null as string | null };
  }, [destinationCompatibleWithAudience, destinationRequestId, destinationRideId, destinationToken, destinationType, usesDestinationCta]);

  const modalPayload = useMemo(() => {
    if (!isModalCampaign) {
      return { value: {} as StructuredMetadata, error: null as string | null };
    }

    const versionNumber = Number(modalVersion);
    if (!Number.isInteger(versionNumber) || versionNumber <= 0) {
      return { value: null as StructuredMetadata | null, error: "Modal version must be a positive integer." };
    }

    if (modalShowOnceValue && !modalCampaignId.trim()) {
      return { value: null as StructuredMetadata | null, error: "Campaign id is required when show once is enabled." };
    }

    if (modalActionType === "external_url") {
      const trimmedUrl = modalActionUrl.trim();
      if (!trimmedUrl) {
        return { value: null as StructuredMetadata | null, error: "Add an HTTPS URL for the primary action." };
      }
      if (!/^https:\/\//i.test(trimmedUrl)) {
        return { value: null as StructuredMetadata | null, error: "External URLs must begin with https:// ." };
      }
    }

    const nextValue: StructuredMetadata = {
      presentation: "modal",
      dismissible: modalDismissibleValue,
      show_once: modalShowOnceValue,
      version: versionNumber,
    };

    if (modalCampaignId.trim()) nextValue.campaign_id = modalCampaignId.trim();
    if (modalEyebrow.trim()) nextValue.eyebrow = modalEyebrow.trim();
    if (modalTitle.trim()) nextValue.title = modalTitle.trim();
    if (modalBody.trim()) nextValue.body = modalBody.trim();
    if (modalPrimaryLabel.trim()) nextValue.cta_label = modalPrimaryLabel.trim();
    if (modalSecondaryLabel.trim()) nextValue.secondary_cta_label = modalSecondaryLabel.trim();
    if (modalActionType === "external_url") {
      nextValue.action_url = modalActionUrl.trim();
    }

    return { value: nextValue, error: null as string | null };
  }, [
    isModalCampaign,
    modalActionType,
    modalActionUrl,
    modalBody,
    modalCampaignId,
    modalDismissibleValue,
    modalEyebrow,
    modalPrimaryLabel,
    modalSecondaryLabel,
    modalShowOnceValue,
    modalTitle,
    modalVersion,
  ]);

  const metadataPayload = useMemo(() => {
    if (metadataParse.error || destinationParse.error || modalPayload.error) {
      return {
        value: null as Record<string, unknown> | null,
        error: metadataParse.error || destinationParse.error || modalPayload.error,
      };
    }
    const nextValue = {
      ...(metadataParse.value || {}),
      ...(modalPayload.value || {}),
    } as Record<string, unknown>;
    if (destinationParse.value) {
      nextValue.destination = destinationParse.value;
    }
    return { value: nextValue, error: null as string | null };
  }, [destinationParse, metadataParse, modalPayload]);

  const canSubmit = Boolean(title.trim() && message.trim() && selectedCount > 0 && !metadataPayload.error);
  const scheduledReady = Boolean(canSubmit && sendAt);
  const disabledReason = useMemo(() => {
    if (sending) return activeTab === "send" ? "Sending in progress." : "Scheduling in progress.";
    if (!title.trim()) return "Add a title.";
    if (!message.trim()) return "Add a message.";
    if (selectedCount <= 0) return "Choose an audience with at least one recipient.";
    if (metadataPayload.error) return metadataPayload.error;
    if (activeTab === "schedule" && !sendAt) return "Pick a future send time.";
    return null;
  }, [activeTab, message, metadataPayload.error, selectedCount, sendAt, sending, title]);

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
    if (pageTab !== "history" || historyLoaded) {
      return;
    }

    async function loadCampaignHistory() {
      setHistoryLoading(true);
      try {
        const response = await authFetch('/notifications/admin/campaigns/?limit=40');
        const payload = (await response.json().catch(() => null)) as AdminNotificationCampaign[] | null;
        if (!response.ok || !payload) {
          throw new Error(extractApiError(payload, "Unable to load notification history."));
        }
        if (!cancelled) {
          setCampaignHistory(payload);
          setHistoryLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load notification history.");
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadCampaignHistory();
    return () => {
      cancelled = true;
    };
  }, [historyLoaded, pageTab]);

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
          const selectedIds = new Set(manualAudienceUserIds);
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
  }, [audienceType, manualAudienceUserIds, search]);

  useEffect(() => {
    if (destinationCompatibleWithAudience) return;
    setDestinationType("none");
    setDestinationRideId("");
    setDestinationRequestId("");
    setDestinationToken("");
  }, [destinationCompatibleWithAudience]);

  function addSelectedUser(user: AdminUser) {
    setSelectedUsers((current) => {
      if (current.some((item) => item.id === user.id)) return current;
      return [...current, user];
    });
    setManualAudienceUserIds((current) => (current.includes(user.id) ? current : [...current, user.id]));
    setSearch("");
    setSearchResults([]);
  }

  function removeSelectedUser(userId: number) {
    setSelectedUsers((current) => current.filter((user) => user.id !== userId));
    setManualAudienceUserIds((current) => current.filter((id) => id !== userId));
  }

  function resetComposer() {
    setPresentationMode("standard");
    setTitle("");
    setMessage("");
    setDestinationType("none");
    setDestinationRideId("");
    setDestinationRequestId("");
    setDestinationToken("");
    setModalEyebrow("");
    setModalTitle("");
    setModalBody("");
    setModalPrimaryLabel("");
    setModalSecondaryLabel("Maybe later");
    setModalDismissible("true");
    setModalShowOnce("true");
    setModalCampaignId("");
    setModalVersion("1");
    setModalActionType("destination");
    setModalActionUrl("");
    setMetadataText("{}");
    setSendAt("");
    setSearch("");
    setSearchResults([]);
    setSelectedUsers([]);
    setManualAudienceUserIds([]);
    setAudienceType("all_users");
    setNotificationType("SYSTEM");
  }

  function applyCampaignToComposer(campaign: AdminNotificationCampaign) {
    setReusingCampaignId(campaign.id);
    setError(null);
    setSuccess(null);

    const metadata = campaign.metadata || {};
    const destination = (metadata.destination || null) as CampaignDestination | null;
    const destinationTypeFromCampaign = destination?.type ?? "none";

    setAudienceType(campaign.audience?.type || "all_users");
    setManualAudienceUserIds(campaign.audience?.user_ids || []);
    setTitle(campaign.title || "");
    setMessage(campaign.message || "");
    setNotificationType(isNotificationType(campaign.notification_type) ? campaign.notification_type : "SYSTEM");
    setPresentationMode(metadata.presentation === "modal" ? "modal" : "standard");
    setDestinationType(destinationTypeFromCampaign);
    setDestinationRideId(typeof destination?.params?.ride_id === "number" ? String(destination.params.ride_id) : "");
    setDestinationRequestId(typeof destination?.params?.request_id === "number" ? String(destination.params.request_id) : "");
    setDestinationToken(typeof destination?.params?.token === "string" ? destination.params.token : "");

    setModalEyebrow(typeof metadata.eyebrow === "string" ? metadata.eyebrow : "");
    setModalTitle(typeof metadata.title === "string" ? metadata.title : "");
    setModalBody(typeof metadata.body === "string" ? metadata.body : "");
    setModalPrimaryLabel(typeof metadata.cta_label === "string" ? metadata.cta_label : "");
    setModalSecondaryLabel(typeof metadata.secondary_cta_label === "string" ? metadata.secondary_cta_label : "Maybe later");
    setModalDismissible(metadata.dismissible === false ? "false" : "true");
    setModalShowOnce(metadata.show_once === false ? "false" : "true");
    setModalCampaignId(typeof metadata.campaign_id === "string" ? metadata.campaign_id : "");
    setModalVersion(typeof metadata.version === "number" ? String(metadata.version) : "1");
    setModalActionType(
      typeof metadata.action_url === "string" && metadata.action_url
        ? "external_url"
        : metadata.presentation === "modal" && !destination
          ? "none"
          : "destination"
    );
    setModalActionUrl(typeof metadata.action_url === "string" ? metadata.action_url : "");

    const advancedMetadata = { ...metadata } as Record<string, unknown>;
    delete advancedMetadata.presentation;
    delete advancedMetadata.campaign_id;
    delete advancedMetadata.version;
    delete advancedMetadata.eyebrow;
    delete advancedMetadata.title;
    delete advancedMetadata.body;
    delete advancedMetadata.cta_label;
    delete advancedMetadata.secondary_cta_label;
    delete advancedMetadata.dismissible;
    delete advancedMetadata.show_once;
    delete advancedMetadata.action_url;
    delete advancedMetadata.destination;
    setMetadataText(JSON.stringify(advancedMetadata, null, 2));

    setSelectedUsers([]);
    setSearch("");
    setSearchResults([]);
    setSendAt(campaign.delivery_mode === "SCHEDULED" && campaign.scheduled_for
      ? formatDateTimeLocalInput(new Date(campaign.scheduled_for))
      : "");
    setActiveTab(campaign.delivery_mode === "SCHEDULED" ? "schedule" : "send");
    setPageTab("composer");
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
          ? { type: audienceType, user_ids: manualAudienceUserIds }
          : { type: audienceType },
      title: title.trim(),
      message: message.trim(),
      notification_type: notificationType,
      metadata: metadataPayload.value || {},
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
      setHistoryLoaded(false);
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
          <TabsList className="grid w-full max-w-xl grid-cols-3">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="composer">Composer</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
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
                    <p className={`text-sm ${metadataPayload.error ? "text-rose-600" : "text-muted-foreground"}`}>
                      Metadata: {metadataPayload.error || "Valid destination and metadata payload"}
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
                <CardDescription>Use short, action-oriented copy and choose a structured destination instead of free-form screen names.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                  <p className="font-medium text-foreground">Incident update</p>
                <p className="mt-1">Send to affected users only, use `SYSTEM`, and point them at a verified destination like rider notifications or host help.</p>
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

                      <div className="space-y-2">
                        <Label>Presentation</Label>
                        <Select value={presentationMode} onValueChange={(value: PresentationMode) => setPresentationMode(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose presentation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard notification</SelectItem>
                            <SelectItem value="modal">Modal campaign</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Standard notifications rely on the usual push and inbox flow. Modal campaigns open as an in-app prompt when the mobile client sees `presentation: modal`.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="title">{isModalCampaign ? "Notification title" : "Title"}</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          maxLength={100}
                          placeholder={isModalCampaign ? "Fallback title for inbox and push delivery" : "Headline shown in the push notification"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">{isModalCampaign ? "Notification message" : "Message"}</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          maxLength={2000}
                          rows={6}
                          placeholder={isModalCampaign ? "Fallback message stored in the notification inbox." : "Explain what changed and where the user should go next."}
                        />
                      </div>

                      {isModalCampaign ? (
                        <div className="space-y-5 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] p-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Modal content</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              These fields generate the modal payload automatically so ops does not have to remember metadata keys.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-eyebrow">Eyebrow</Label>
                            <Input
                              id="modal-eyebrow"
                              value={modalEyebrow}
                              onChange={(event) => setModalEyebrow(event.target.value)}
                              placeholder="Opportunity"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-title">Modal title</Label>
                            <Input
                              id="modal-title"
                              value={modalTitle}
                              onChange={(event) => setModalTitle(event.target.value)}
                              placeholder="Leave blank to reuse notification title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="modal-body">Modal body</Label>
                            <Textarea
                              id="modal-body"
                              value={modalBody}
                              onChange={(event) => setModalBody(event.target.value)}
                              rows={4}
                              placeholder="Leave blank to reuse notification message"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="modal-primary-label">Primary button label</Label>
                              <Input
                                id="modal-primary-label"
                                value={modalPrimaryLabel}
                                onChange={(event) => setModalPrimaryLabel(event.target.value)}
                                placeholder="Learn more"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="modal-secondary-label">Secondary button label</Label>
                              <Input
                                id="modal-secondary-label"
                                value={modalSecondaryLabel}
                                onChange={(event) => setModalSecondaryLabel(event.target.value)}
                                placeholder="Maybe later"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Dismissible</Label>
                              <Select value={modalDismissible} onValueChange={setModalDismissible}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose dismissibility" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Show once</Label>
                              <Select value={modalShowOnce} onValueChange={setModalShowOnce}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose repeat behavior" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="modal-campaign-id">Campaign id</Label>
                              <Input
                                id="modal-campaign-id"
                                value={modalCampaignId}
                                onChange={(event) => setModalCampaignId(event.target.value)}
                                placeholder="agent-programme-mar-2026"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="modal-version">Version</Label>
                              <Input
                                id="modal-version"
                                value={modalVersion}
                                onChange={(event) => setModalVersion(event.target.value)}
                                inputMode="numeric"
                                placeholder="1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Primary action target</Label>
                            <Select value={modalActionType} onValueChange={(value: ModalActionType) => setModalActionType(value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose action target" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="destination">Open in-app screen</SelectItem>
                                <SelectItem value="external_url">Open external HTTPS URL</SelectItem>
                                <SelectItem value="none">No navigation action</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {modalActionType === "external_url" ? (
                            <div className="space-y-2">
                              <Label htmlFor="modal-action-url">HTTPS URL</Label>
                              <Input
                                id="modal-action-url"
                                value={modalActionUrl}
                                onChange={(event) => setModalActionUrl(event.target.value)}
                                placeholder="https://leetapp.co/agents"
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {usesDestinationCta ? (
                        <>
                          <div className="space-y-2">
                            <Label>{isModalCampaign ? "In-app action destination" : "Destination"}</Label>
                            <Select value={destinationType} onValueChange={(value: DestinationType) => setDestinationType(value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose destination" />
                              </SelectTrigger>
                              <SelectContent>
                                {compatibleDestinationOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {compatibleDestinationOptions.find((option) => option.value === destinationType)?.description
                                || destinationOptions.find((option) => option.value === destinationType)?.description}
                            </p>
                            {audienceDestinationMode === "shared" ? (
                              <p className="text-xs text-muted-foreground">
                                Mixed or broad audiences can only use shared destinations such as safety share or no in-app destination.
                              </p>
                            ) : null}
                            {audienceDestinationMode === "all" ? (
                              <p className="text-xs text-muted-foreground">
                                Device-platform audiences can browse all destinations here, but the backend will still reject recipients whose role does not match the destination.
                              </p>
                            ) : null}
                          </div>

                          {destinationNeedsRideId(destinationType) ? (
                            <div className="space-y-2">
                              <Label htmlFor="destination-ride-id">Ride id</Label>
                              <Input
                                id="destination-ride-id"
                                value={destinationRideId}
                                onChange={(event) => setDestinationRideId(event.target.value)}
                                inputMode="numeric"
                                placeholder="482"
                              />
                            </div>
                          ) : null}

                          {destinationNeedsRequestId(destinationType) ? (
                            <div className="space-y-2">
                              <Label htmlFor="destination-request-id">Request id</Label>
                              <Input
                                id="destination-request-id"
                                value={destinationRequestId}
                                onChange={(event) => setDestinationRequestId(event.target.value)}
                                inputMode="numeric"
                                placeholder="91"
                              />
                            </div>
                          ) : null}

                          {destinationNeedsToken(destinationType) ? (
                            <div className="space-y-2">
                              <Label htmlFor="destination-token">Safety-share token</Label>
                              <Input
                                id="destination-token"
                                value={destinationToken}
                                onChange={(event) => setDestinationToken(event.target.value)}
                                placeholder="abc123"
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="metadata">Advanced metadata JSON</Label>
                        <Textarea
                          id="metadata"
                          value={metadataText}
                          onChange={(event) => setMetadataText(event.target.value)}
                          rows={5}
                          placeholder='{"campaign_tag":"growth-q2"}'
                          className={metadataPayload.error ? "border-rose-300 focus-visible:ring-rose-300" : ""}
                        />
                        <p className={`text-xs ${metadataPayload.error ? "text-rose-600" : "text-muted-foreground"}`}>
                          {metadataPayload.error || "Optional advanced JSON merged into the structured payload. Structured fields override conflicting keys."}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {isModalCampaign ? "Modal preview" : "Message preview"}
                    </p>
                    {isModalCampaign && modalEyebrow.trim() ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">{modalEyebrow.trim()}</p>
                    ) : null}
                    <p className="mt-2 line-clamp-2 text-base font-semibold text-foreground">
                      {(isModalCampaign ? modalTitle.trim() : "") || title.trim() || "Title preview"}
                    </p>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {(isModalCampaign ? modalBody.trim() : "") || message.trim() || "Body preview will appear here once you start writing."}
                    </p>
                    {isModalCampaign ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className="border-stone-200 bg-stone-100 text-stone-700">
                          {modalPrimaryLabel.trim() || "Open"}
                        </Badge>
                        {modalDismissibleValue ? (
                          <Badge className="border-stone-200 bg-white text-stone-700">
                            {modalSecondaryLabel.trim() || "Maybe later"}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-[color:var(--stroke)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Payload health</p>
                      <p className="mt-2 text-sm text-muted-foreground">Title: {title.trim().length}/100</p>
                      <p className="text-sm text-muted-foreground">Message: {message.trim().length}/2000</p>
                      {isModalCampaign ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Modal mode: {modalActionType === "external_url" ? "External CTA" : modalActionType === "destination" ? "In-app CTA" : "No CTA navigation"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Campaign key: {modalCampaignId.trim() ? `${modalCampaignId.trim()} v${modalVersion || "1"}` : "Not set"}
                          </p>
                        </>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        Destination: {usesDestinationCta ? destinationLabel(destinationType) : "External URL"}
                      </p>
                      <p className={`text-sm ${metadataPayload.error ? "text-rose-600" : "text-muted-foreground"}`}>
                        Metadata: {metadataPayload.error || "Valid destination and metadata payload"}
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
                  {manualAudienceUserIds.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-sm text-muted-foreground">
                      No individual recipients selected.
                    </div>
                  ) : (
                    manualAudienceUserIds.map((userId) => {
                      const user = selectedUsers.find((entry) => entry.id === userId);
                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--soft)] px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">{user ? resolveUserLabel(user) : `User #${userId}`}</p>
                            <p className="text-xs text-muted-foreground">
                              {user ? `${user.phone_number} ${user.user_type ? `• ${user.user_type}` : ""}` : "Loaded from a previous campaign. Search to view full details."}
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeSelectedUser(userId)}>
                            Remove
                          </Button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-[color:var(--stroke)] shadow-[var(--shadow)]">
            <CardHeader>
              <CardTitle>Notification history</CardTitle>
              <CardDescription>Review recent admin sends and load any previous campaign back into the composer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyLoading ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-sm text-muted-foreground">
                  Loading notification history...
                </div>
              ) : campaignHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-sm text-muted-foreground">
                  No admin notification campaigns yet.
                </div>
              ) : (
                <div className="rounded-2xl border border-[color:var(--stroke)] bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignHistory.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{campaign.title}</p>
                                <Badge className={toneForNotification(campaign.notification_type)}>
                                  {notificationLabel(campaign.notification_type)}
                                </Badge>
                                {campaign.metadata?.presentation === "modal" ? (
                                  <Badge className="border-stone-200 bg-stone-100 text-stone-700">Modal</Badge>
                                ) : null}
                              </div>
                              <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {campaign.recipient_count} recipient{campaign.recipient_count === 1 ? "" : "s"}
                                {campaign.created_by_name ? ` • by ${campaign.created_by_name}` : ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {humanizeAudience(campaign.audience?.type || "all_users")}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {campaign.delivery_mode === "SCHEDULED" ? "Scheduled" : "Immediate"}
                          </TableCell>
                          <TableCell className="align-top text-sm text-muted-foreground">
                            {new Date(campaign.scheduled_for || campaign.sent_at || campaign.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right align-top">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => applyCampaignToComposer(campaign)}
                            >
                              {reusingCampaignId === campaign.id ? "Loaded" : "Reuse"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
