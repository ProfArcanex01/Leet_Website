"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/lib/api';

type OutreachSummary = {
  total_hosts_without_templates: number;
  total_hosts_with_templates: number;
  not_contacted: number;
  contacted_any: number;
  route_setup_in_progress: number;
  published_trip_created: number;
  follow_up_due: number;
};

type OutreachRecord = {
  host_id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone_number: string;
  email: string | null;
  is_verified: boolean;
  is_invite_activated: boolean;
  is_agent: boolean;
  date_joined: string;
  route_template_count: number;
  active_template_count: number;
  auto_publish_template_count: number;
  published_trip_count: number;
  active_published_trip_count: number;
  last_published_trip_at: string | null;
  has_route_template: boolean;
  has_auto_publish_template: boolean;
  has_published_trip: boolean;
  usual_route_known: boolean;
  contact_status: string;
  response_status: string;
  interest_level: string;
  follow_up_date: string | null;
  notes: string;
  updated_at: string | null;
  updated_by_name: string | null;
};

type PaginatedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: OutreachRecord[];
  summary: OutreachSummary;
  template_state: 'without' | 'with';
};

type DraftRecord = {
  usual_route_known: boolean;
  contact_status: string;
  response_status: string;
  interest_level: string;
  follow_up_date: string;
  notes: string;
};

const CONTACT_STATUS_OPTIONS = [
  { value: 'all', label: 'All contact states' },
  { value: 'not_contacted', label: 'Not contacted' },
  { value: 'called_no_answer', label: 'Called - no answer' },
  { value: 'called_spoke_to', label: 'Called - spoke to' },
  { value: 'whatsapp_sent', label: 'WhatsApp sent' },
  { value: 'follow_up_scheduled', label: 'Follow-up scheduled' },
  { value: 'completed', label: 'Completed' },
];

const RESPONSE_STATUS_OPTIONS = [
  { value: 'all', label: 'All responses' },
  { value: 'no_response', label: 'No response' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not interested' },
  { value: 'callback_requested', label: 'Callback requested' },
  { value: 'route_setup_in_progress', label: 'Route setup in progress' },
];

const INTEREST_LEVEL_OPTIONS = [
  { value: 'all', label: 'All interest levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
];

const YES_NO_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const TEMPLATE_ACTIVITY_OPTIONS = [
  { value: 'all', label: 'All template states' },
  { value: 'active', label: 'Has active template' },
  { value: 'inactive', label: 'No active template' },
];

function extractApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0) return `${field}: ${String(value[0])}`;
    if (typeof value === 'string') return `${field}: ${value}`;
  }
  return fallback;
}

function createDraft(record: OutreachRecord): DraftRecord {
  return {
    usual_route_known: record.usual_route_known,
    contact_status: record.contact_status,
    response_status: record.response_status,
    interest_level: record.interest_level,
    follow_up_date: record.follow_up_date || '',
    notes: record.notes || '',
  };
}

function getRouteSetupLabel(record: OutreachRecord) {
  if (!record.has_route_template) return 'No template';
  if (record.has_auto_publish_template) return 'Auto-publish on';
  return 'Auto-publish off';
}

export default function AdminTemplateOutreachPage() {
  const [records, setRecords] = useState<OutreachRecord[]>([]);
  const [summary, setSummary] = useState<OutreachSummary | null>(null);
  const [drafts, setDrafts] = useState<Record<number, DraftRecord>>({});
  const [templateState, setTemplateState] = useState<'without' | 'with'>('without');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingHostId, setSavingHostId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
    tone: 'success' | 'error';
  } | null>(null);
  const [query, setQuery] = useState('');
  const [contactStatus, setContactStatus] = useState('all');
  const [responseStatus, setResponseStatus] = useState('all');
  const [interestLevel, setInterestLevel] = useState('all');
  const [autoPublish, setAutoPublish] = useState('all');
  const [templateActivity, setTemplateActivity] = useState('all');
  const [hasPublishedTrip, setHasPublishedTrip] = useState('all');
  const [hasActiveTrip, setHasActiveTrip] = useState('all');
  const [inviteActivated, setInviteActivated] = useState('all');
  const [verifiedStatus, setVerifiedStatus] = useState('all');

  const loadQueue = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('page', String(nextPage));
    params.set('page_size', '20');
    params.set('template_state', templateState);
    if (query.trim()) params.set('q', query.trim());
    if (templateState === 'without') {
      if (contactStatus !== 'all') params.set('contact_status', contactStatus);
      if (responseStatus !== 'all') params.set('response_status', responseStatus);
      if (interestLevel !== 'all') params.set('interest_level', interestLevel);
    } else {
      if (autoPublish !== 'all') params.set('auto_publish', autoPublish);
      if (templateActivity !== 'all') params.set('template_activity', templateActivity);
      if (hasPublishedTrip !== 'all') params.set('has_published_trip', hasPublishedTrip);
      if (hasActiveTrip !== 'all') params.set('has_active_trip', hasActiveTrip);
      if (inviteActivated !== 'all') params.set('invite_activated', inviteActivated);
      if (verifiedStatus !== 'all') params.set('is_verified', verifiedStatus);
    }

    try {
      const response = await authFetch(`/rides/admin/host-template-outreach/?${params.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as PaginatedResponse;
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to load host template outreach queue.'));
      }
      setRecords(payload.results || []);
      setSummary(payload.summary || null);
      setCount(payload.count || 0);
      setDrafts(Object.fromEntries((payload.results || []).map((record) => [record.host_id, createDraft(record)])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load host template outreach queue.');
    } finally {
      setLoading(false);
    }
  }, [
    autoPublish,
    contactStatus,
    hasActiveTrip,
    hasPublishedTrip,
    interestLevel,
    inviteActivated,
    page,
    query,
    responseStatus,
    templateActivity,
    templateState,
    verifiedStatus,
  ]);

  useEffect(() => {
    loadQueue(page);
  }, [loadQueue, page]);

  const pageCount = Math.max(1, Math.ceil(count / 20));

  function updateDraft(hostId: number, patch: Partial<DraftRecord>) {
    setDrafts((current) => ({
      ...current,
      [hostId]: {
        ...current[hostId],
        ...patch,
      },
    }));
  }

  async function saveHost(hostId: number) {
    const draft = drafts[hostId];
    if (!draft) return;

    setSavingHostId(hostId);
    setError(null);
    try {
      const response = await authFetch(`/rides/admin/host-template-outreach/${hostId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          usual_route_known: draft.usual_route_known,
          contact_status: draft.contact_status,
          response_status: draft.response_status,
          interest_level: draft.interest_level,
          follow_up_date: draft.follow_up_date || null,
          notes: draft.notes,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to save outreach update.'));
      }
      setFeedbackModal({
        title: 'Outreach update saved',
        message: `Host #${hostId} was updated successfully.`,
        tone: 'success',
      });
      await loadQueue(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save outreach update.';
      setError(message);
      setFeedbackModal({
        title: 'Save failed',
        message,
        tone: 'error',
      });
    } finally {
      setSavingHostId(null);
    }
  }

  function resetFilters() {
    setQuery('');
    setContactStatus('all');
    setResponseStatus('all');
    setInterestLevel('all');
    setAutoPublish('all');
    setTemplateActivity('all');
    setHasPublishedTrip('all');
    setHasActiveTrip('all');
    setInviteActivated('all');
    setVerifiedStatus('all');
    setPage(1);
  }

  function switchTemplateState(nextState: 'without' | 'with') {
    setTemplateState(nextState);
    setPage(1);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Host template outreach</CardTitle>
          <CardDescription>
            Track hosts without route templates, call them, and record follow-up without relying on Excel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <Button
              type="button"
              variant={templateState === 'without' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => switchTemplateState('without')}
              disabled={loading}
            >
              Without template
            </Button>
            <Button
              type="button"
              variant={templateState === 'with' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => switchTemplateState('with')}
              disabled={loading}
            >
              With template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="host-search">Search hosts</Label>
              <Input
                id="host-search"
                placeholder="Name, phone, or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {templateState === 'without' ? (
              <>
                <div className="space-y-2">
                  <Label>Contact status</Label>
                  <Select value={contactStatus} onValueChange={setContactStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Response status</Label>
                  <Select value={responseStatus} onValueChange={setResponseStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interest level</Label>
                  <Select value={interestLevel} onValueChange={setInterestLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEREST_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Auto-publish</Label>
                  <Select value={autoPublish} onValueChange={setAutoPublish}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template activity</Label>
                  <Select value={templateActivity} onValueChange={setTemplateActivity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_ACTIVITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Published trip</Label>
                  <Select value={hasPublishedTrip} onValueChange={setHasPublishedTrip}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {templateState === 'with' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label>Active trip</Label>
                <Select value={hasActiveTrip} onValueChange={setHasActiveTrip}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invite activated</Label>
                <Select value={inviteActivated} onValueChange={setInviteActivated}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Verified</Label>
                <Select value={verifiedStatus} onValueChange={setVerifiedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <div className="text-sm text-muted-foreground">
            {templateState === 'without'
              ? 'Use outreach filters to manage setup calls and follow-ups.'
              : 'Use route-health filters to find hosts with templates that still need activation help.'}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => { setPage(1); void loadQueue(1); }} disabled={loading}>
              {loading ? 'Refreshing...' : 'Apply filters'}
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={loading}>
              Reset
            </Button>
            {error ? <div className="text-sm text-red-500">{error}</div> : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ['Without templates', summary?.total_hosts_without_templates ?? 0],
          ['With templates', summary?.total_hosts_with_templates ?? 0],
          ['Not contacted', summary?.not_contacted ?? 0],
          ['Contacted', summary?.contacted_any ?? 0],
          ['Setup in progress', summary?.route_setup_in_progress ?? 0],
          ['Published trip exists', summary?.published_trip_created ?? 0],
          ['Follow-up due', summary?.follow_up_due ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          {records.map((record) => {
            const draft = drafts[record.host_id] || createDraft(record);
            const isSaving = savingHostId === record.host_id;
            return (
              <AccordionItem
                key={record.host_id}
                value={`host-${record.host_id}`}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <AccordionTrigger className="px-4 py-4 text-left hover:no-underline sm:px-6">
                  <div className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{record.full_name}</div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <a href={`tel:${record.phone_number}`} className="underline underline-offset-2">
                          {record.phone_number}
                        </a>
                        {record.email ? (
                          <a href={`mailto:${record.email}`} className="break-all underline underline-offset-2">
                            {record.email}
                          </a>
                        ) : (
                          <span>No email</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pr-2">
                      <Badge variant={record.has_auto_publish_template ? 'default' : 'outline'}>
                        {getRouteSetupLabel(record)}
                      </Badge>
                      <Badge variant={record.is_verified ? 'default' : 'outline'}>
                        {record.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant={record.is_invite_activated ? 'default' : 'outline'}>
                        {record.is_invite_activated ? 'Invite activated' : 'Invite pending'}
                      </Badge>
                      {record.is_agent ? <Badge variant="secondary">Agent</Badge> : null}
                      <Badge variant={record.has_published_trip ? 'default' : 'outline'}>
                        {record.has_published_trip ? `${record.published_trip_count} published trips` : 'No published trip'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t">
                  <div className="space-y-5 p-4 sm:p-6">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <div className="font-medium text-foreground">Joined</div>
                    <div>{new Date(record.date_joined).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Templates</div>
                    <div>
                      {record.route_template_count} total • {record.auto_publish_template_count} auto-publish
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Active trips</div>
                    <div>{record.active_published_trip_count}</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Last published trip</div>
                    <div>{record.last_published_trip_at ? new Date(record.last_published_trip_at).toLocaleString() : 'Never'}</div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Contact status</Label>
                    <Select
                      value={draft.contact_status}
                      onValueChange={(value) => updateDraft(record.host_id, { contact_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Response status</Label>
                    <Select
                      value={draft.response_status}
                      onValueChange={(value) => updateDraft(record.host_id, { response_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESPONSE_STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interest level</Label>
                    <Select
                      value={draft.interest_level}
                      onValueChange={(value) => updateDraft(record.host_id, { interest_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEREST_LEVEL_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`follow-up-${record.host_id}`}>Follow-up date</Label>
                    <Input
                      id={`follow-up-${record.host_id}`}
                      type="date"
                      value={draft.follow_up_date}
                      onChange={(event) => updateDraft(record.host_id, { follow_up_date: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <Label>Usual route known</Label>
                    <Select
                      value={draft.usual_route_known ? 'yes' : 'no'}
                      onValueChange={(value) => updateDraft(record.host_id, { usual_route_known: value === 'yes' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${record.host_id}`}>Notes</Label>
                    <Textarea
                      id={`notes-${record.host_id}`}
                      placeholder="Add call notes, route clues, or follow-up context."
                      value={draft.notes}
                      onChange={(event) => updateDraft(record.host_id, { notes: event.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {record.updated_at ? `Last updated ${new Date(record.updated_at).toLocaleString()}` : 'No outreach updates yet'}
                    {record.updated_by_name ? ` by ${record.updated_by_name}` : ''}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                      <a href={`tel:${record.phone_number}`}>Call host</a>
                    </Button>
                    {record.email ? (
                      <Button variant="outline" asChild>
                        <a href={`mailto:${record.email}`}>Email</a>
                      </Button>
                    ) : null}
                    <Button onClick={() => void saveHost(record.host_id)} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save outreach update'}
                    </Button>
                  </div>
                </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {!loading && records.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No hosts matched the current queue filters.
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {pageCount} • {count} hosts in the {templateState === 'with' ? 'with template' : 'without template'} queue
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(feedbackModal)} onOpenChange={(open) => { if (!open) setFeedbackModal(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackModal?.title}</DialogTitle>
            <DialogDescription
              className={feedbackModal?.tone === 'success' ? 'text-emerald-700' : 'text-red-600'}
            >
              {feedbackModal?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setFeedbackModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
