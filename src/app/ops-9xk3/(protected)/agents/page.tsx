"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AgentApplication = {
  id: number;
  campaign_name: string;
  campaign_slug: string;
  full_name: string;
  phone_number: string;
  location: string;
  recruitment_channels: string[];
  weekly_recruitment_estimate: string;
  has_smartphone: boolean;
  notes: string;
  status: string;
  status_display: string;
  admin_notes: string;
  created_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function badgeTone(status: string) {
  switch (status) {
    case 'NEW':
      return 'bg-sky-100 text-sky-700 border-sky-200';
    case 'REVIEWED':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CONTACTED':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function formatChannel(channel: string) {
  return channel
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatWeeklyEstimate(value: string) {
  switch (value) {
    case '1_10':
      return '1-10';
    case '10_20':
      return '10-20';
    case '20_50':
      return '20-50';
    case '50_PLUS':
      return '50+';
    default:
      return value;
  }
}

export default function AgentsOpsPage() {
  const [entries, setEntries] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const pageSize = 20;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const stats = useMemo(
    () => ({
      newCount: entries.filter((entry) => entry.status === 'NEW').length,
      contactedCount: entries.filter((entry) => entry.status === 'CONTACTED').length,
      approvedCount: entries.filter((entry) => entry.status === 'APPROVED').length,
    }),
    [entries],
  );

  const loadEntries = useCallback(
    async (overrides?: { page?: number; query?: string; status?: string }) => {
      setLoading(true);
      setError(null);

      const nextPage = overrides?.page ?? page;
      const nextQuery = overrides?.query ?? query;
      const nextStatus = overrides?.status ?? filterStatus;

      const params = new URLSearchParams();
      params.set('campaign', 'agent-recruitment');
      params.set('page', String(nextPage));
      params.set('page_size', String(pageSize));
      if (nextQuery.trim()) params.set('search', nextQuery.trim());
      if (nextStatus) params.set('status', nextStatus);

      try {
        const response = await authFetch(`/campaigns/admin/submissions/?${params.toString()}`);
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.detail || 'Unable to load agent applications.');
        }
        const payload = (await response.json()) as Paginated<AgentApplication>;
        setEntries(payload.results || []);
        setCount(payload.count || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    },
    [page, query, filterStatus],
  );

  useEffect(() => {
    loadEntries();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    loadEntries({ page: 1 });
  }

  function handleReset() {
    setQuery('');
    setFilterStatus('');
    setPage(1);
    loadEntries({ page: 1, query: '', status: '' });
  }

  function handleFilterChange(value: string) {
    const normalizedValue = value === 'ALL' ? '' : value;
    setFilterStatus(normalizedValue);
    setPage(1);
    loadEntries({ page: 1, status: normalizedValue });
  }

  function handleExpand(entry: AgentApplication) {
    if (expandedId === entry.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(entry.id);
    setEditStatus(entry.status);
    setEditNotes(entry.admin_notes || '');
  }

  async function handleSave(entryId: number) {
    setSaving(true);
    try {
      const response = await authFetch(`/campaigns/admin/submissions/${entryId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editStatus, admin_notes: editNotes }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to update application.');
      }
      const payload = (await response.json()) as AgentApplication;
      setEntries((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, ...payload } : entry)));
      setExpandedId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? '—' : count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">New on this page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-sky-600">{loading ? '—' : stats.newCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Contacted on this page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-indigo-600">{loading ? '—' : stats.contactedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved on this page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{loading ? '—' : stats.approvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, phone, or location"
              />
            </div>
            <div className="w-full md:w-56">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filterStatus || 'ALL'} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.label} value={option.value || 'ALL'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Search</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card className="rounded-3xl border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between p-6">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={() => loadEntries()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Applicant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No agent applications found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <React.Fragment key={entry.id}>
                    <TableRow className="cursor-pointer hover:bg-[color:var(--soft)]/20" onClick={() => handleExpand(entry)}>
                      <TableCell className="pl-6">
                        <div className="font-medium">{entry.full_name}</div>
                        <div className="text-xs text-muted-foreground">{entry.phone_number}</div>
                      </TableCell>
                      <TableCell>{entry.location}</TableCell>
                      <TableCell>{formatWeeklyEstimate(entry.weekly_recruitment_estimate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgeTone(entry.status)}>
                          {entry.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                    {expandedId === entry.id ? (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-[color:var(--paper)]/50 px-6 py-6">
                          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recruitment spots</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {entry.recruitment_channels.map((channel) => (
                                    <Badge key={channel} variant="secondary" className="rounded-full bg-white">
                                      {formatChannel(channel)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Smartphone</p>
                                <p className="mt-2 text-sm">{entry.has_smartphone ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Applicant notes</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                  {entry.notes || 'No extra notes submitted.'}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4 rounded-3xl border border-[color:var(--stroke)] bg-white p-5">
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Update status
                                </label>
                                <Select value={editStatus} onValueChange={setEditStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Admin notes
                                </label>
                                <Textarea
                                  rows={5}
                                  maxLength={2000}
                                  value={editNotes}
                                  onChange={(event) => setEditNotes(event.target.value)}
                                  placeholder="Record call outcomes, screening notes, or next steps."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleSave(entry.id)} disabled={saving}>
                                  {saving ? 'Saving...' : 'Save changes'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setExpandedId(null)}>
                                  Close
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {pageCount} ({count} total)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
