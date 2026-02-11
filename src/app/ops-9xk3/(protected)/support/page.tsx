"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

/* ── Types ─────────────────────────────────────────────────────── */

type SupportTicket = {
  id: number;
  email: string;
  topic: string;
  topic_display: string;
  message: string;
  status: string;
  status_display: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const TOPIC_OPTIONS = [
  { value: '', label: 'All topics' },
  { value: 'ACCOUNT', label: 'Account issue' },
  { value: 'RIDE', label: 'Ride issue' },
  { value: 'PAYMENT', label: 'Payment or refund' },
  { value: 'SAFETY', label: 'Safety concern' },
  { value: 'GENERAL', label: 'General question' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'RESOLVED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return '';
  }
}

function topicBadgeColor(topic: string) {
  switch (topic) {
    case 'SAFETY':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'PAYMENT':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'ACCOUNT':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'RIDE':
      return 'bg-teal-100 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  // expanded ticket detail
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const pageSize = 20;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const openCount = useMemo(() => tickets.filter((t) => t.status === 'OPEN').length, [tickets]);

  const loadTickets = useCallback(
    async (overrides?: { page?: number; query?: string; status?: string; topic?: string }) => {
      setLoading(true);
      setError(null);

      const p = overrides?.page ?? page;
      const q = overrides?.query ?? query;
      const s = overrides?.status ?? filterStatus;
      const t = overrides?.topic ?? filterTopic;

      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('page_size', String(pageSize));
      if (q.trim()) params.set('search', q.trim());
      if (s) params.set('status', s);
      if (t) params.set('topic', t);

      try {
        const res = await authFetch(`/waitlist/admin/support/?${params.toString()}`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.detail || 'Unable to load support tickets.');
        }
        const payload = (await res.json()) as Paginated<SupportTicket>;
        setTickets(payload.results || []);
        setCount(payload.count || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    },
    [page, query, filterStatus, filterTopic],
  );

  useEffect(() => {
    loadTickets();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadTickets({ page: 1 });
  }

  function handleReset() {
    setQuery('');
    setFilterStatus('');
    setFilterTopic('');
    setPage(1);
    loadTickets({ page: 1, query: '', status: '', topic: '' });
  }

  function handleFilterChange(type: 'status' | 'topic', value: string) {
    const actualValue = value === 'ALL' ? '' : value;
    if (type === 'status') {
      setFilterStatus(actualValue);
      setPage(1);
      loadTickets({ page: 1, status: actualValue });
    } else {
      setFilterTopic(actualValue);
      setPage(1);
      loadTickets({ page: 1, topic: actualValue });
    }
  }

  function handleExpand(ticket: SupportTicket) {
    if (expandedId === ticket.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(ticket.id);
    setEditStatus(ticket.status);
    setEditNotes(ticket.admin_notes || '');
  }

  async function handleSave(ticketId: number) {
    setSaving(true);
    try {
      const res = await authFetch(`/waitlist/admin/support/${ticketId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editStatus, admin_notes: editNotes }),
      });
      if (!res.ok) throw new Error('Failed to update ticket.');
      // Update local state
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: editStatus,
                status_display: STATUS_OPTIONS.find((s) => s.value === editStatus)?.label || editStatus,
                admin_notes: editNotes,
              }
            : t,
        ),
      );
      setExpandedId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ticketId: number) {
    if (!confirm('Permanently delete this support ticket?')) return;
    try {
      const res = await authFetch(`/waitlist/admin/support/${ticketId}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket.');
      loadTickets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? '—' : count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Open on this page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600">{loading ? '—' : openCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click a row to expand details, update status, or add admin notes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by email..."
              />
            </div>
            <div className="w-full md:w-44">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filterStatus || 'ALL'} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Topic</label>
              <Select value={filterTopic || 'ALL'} onValueChange={(v) => handleFilterChange('topic', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All topics</SelectItem>
                  <SelectItem value="ACCOUNT">Account issue</SelectItem>
                  <SelectItem value="RIDE">Ride issue</SelectItem>
                  <SelectItem value="PAYMENT">Payment or refund</SelectItem>
                  <SelectItem value="SAFETY">Safety concern</SelectItem>
                  <SelectItem value="GENERAL">General question</SelectItem>
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

      {/* Error */}
      {error && (
        <Card className="rounded-3xl border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between p-6">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={() => loadTickets()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Email</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleExpand(ticket)}
                    >
                      <TableCell className="pl-6 font-medium">{ticket.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={topicBadgeColor(ticket.topic)}>
                          {ticket.topic_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeVariant(ticket.status)}>
                          {ticket.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ticket.id);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail */}
                    {expandedId === ticket.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 px-6 py-5">
                          <div className="space-y-4">
                            {/* Message */}
                            <div>
                              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Message
                              </p>
                              <p className="whitespace-pre-wrap rounded-xl border border-[color:var(--stroke)] bg-white p-4 text-sm">
                                {ticket.message}
                              </p>
                            </div>

                            {/* Update form */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                  Update status
                                </label>
                                <Select value={editStatus} onValueChange={setEditStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                  Admin notes
                                </label>
                                <Textarea
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  placeholder="Add internal notes..."
                                  rows={3}
                                />
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span>
                                Updated:{' '}
                                {new Date(ticket.updated_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span>Ticket #{ticket.id}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSave(ticket.id)}
                                disabled={saving}
                              >
                                {saving ? 'Saving...' : 'Save changes'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExpandedId(null)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {pageCount} ({count} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
