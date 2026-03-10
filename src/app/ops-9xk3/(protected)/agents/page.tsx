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

type AgentInviteCode = {
  id: number;
  agent: number;
  agent_name: string;
  agent_phone_number: string;
  code: string;
  is_active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  redemptions_remaining: number | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

type AdminUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone_number: string;
  email: string | null;
  is_staff: boolean;
  is_invite_activated?: boolean;
  user_type: 'HOST' | 'RIDER' | null;
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

function codeBadgeTone(isActive: boolean) {
  return isActive
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';
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

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveUserLabel(user: AdminUser) {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.phone_number;
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

  const [agentCodes, setAgentCodes] = useState<AgentInviteCode[]>([]);
  const [agentCodesCount, setAgentCodesCount] = useState(0);
  const [agentCodesLoading, setAgentCodesLoading] = useState(true);
  const [agentCodesError, setAgentCodesError] = useState<string | null>(null);
  const [agentCodeQuery, setAgentCodeQuery] = useState('');
  const [agentCodeActiveFilter, setAgentCodeActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
  const [codeSaving, setCodeSaving] = useState(false);

  const [agentSearch, setAgentSearch] = useState('');
  const [agentOptions, setAgentOptions] = useState<AdminUser[]>([]);
  const [agentSearchLoading, setAgentSearchLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AdminUser | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newMaxRedemptions, setNewMaxRedemptions] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

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

  const activeCodeCount = useMemo(
    () => agentCodes.filter((code) => code.is_active && !code.revoked_at).length,
    [agentCodes],
  );

  const selectedCode = useMemo(
    () => agentCodes.find((code) => code.id === selectedCodeId) || null,
    [agentCodes, selectedCodeId],
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

  const loadAgentCodes = useCallback(
    async (overrides?: { query?: string; isActive?: 'all' | 'true' | 'false' }) => {
      setAgentCodesLoading(true);
      setAgentCodesError(null);

      const nextQuery = overrides?.query ?? agentCodeQuery;
      const nextIsActive = overrides?.isActive ?? agentCodeActiveFilter;
      const params = new URLSearchParams();
      params.set('page_size', '50');
      if (nextQuery.trim()) params.set('q', nextQuery.trim());
      if (nextIsActive !== 'all') params.set('is_active', nextIsActive);

      try {
        const response = await authFetch(`/invites/admin/agent-codes/?${params.toString()}`);
        const payload = (await response.json().catch(() => null)) as Paginated<AgentInviteCode> | null;
        if (!response.ok) {
          throw new Error((payload as { detail?: string } | null)?.detail || 'Unable to load agent codes.');
        }
        const results = payload?.results || [];
        setAgentCodes(results);
        setAgentCodesCount(payload?.count || 0);
        if (results.length > 0 && !results.find((code) => code.id === selectedCodeId)) {
          setSelectedCodeId(results[0].id);
        }
        if (results.length === 0) {
          setSelectedCodeId(null);
        }
      } catch (err) {
        setAgentCodesError(err instanceof Error ? err.message : 'Unable to load agent codes.');
      } finally {
        setAgentCodesLoading(false);
      }
    },
    [agentCodeActiveFilter, agentCodeQuery, selectedCodeId],
  );

  const searchAgents = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setAgentOptions([]);
      return;
    }
    setAgentSearchLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchTerm.trim());
      params.set('page_size', '20');
      const response = await authFetch(`/accounts/admin/users/?${params.toString()}`);
      const payload = (await response.json().catch(() => null)) as Paginated<AdminUser> | null;
      if (!response.ok) {
        throw new Error((payload as { detail?: string } | null)?.detail || 'Unable to search users.');
      }
      setAgentOptions((payload?.results || []).filter((user) => user.is_staff));
    } catch {
      setAgentOptions([]);
    } finally {
      setAgentSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [page, loadEntries]);

  useEffect(() => {
    loadAgentCodes();
  }, [loadAgentCodes]);

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

  async function handleCreateCode(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAgent || !newCode.trim()) {
      setAgentCodesError('Select an agent and enter a code.');
      return;
    }

    setCreatingCode(true);
    setAgentCodesError(null);
    setCreateMessage(null);
    try {
      const response = await authFetch('/invites/admin/agent-codes/', {
        method: 'POST',
        body: JSON.stringify({
          agent_id: selectedAgent.id,
          code: newCode.trim().toUpperCase(),
          is_active: true,
          max_redemptions: newMaxRedemptions.trim() ? Number(newMaxRedemptions) : null,
          expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
        }),
      });
      const payload = (await response.json().catch(() => null)) as AgentInviteCode | { detail?: string; code?: string[] } | null;
      if (!response.ok) {
        const data = payload as { detail?: string; code?: string[] } | null;
        throw new Error(data?.detail || data?.code?.[0] || 'Unable to create agent code.');
      }

      const created = payload as AgentInviteCode;
      setCreateMessage(`Created reusable code ${created.code} for ${created.agent_name}.`);
      setNewCode('');
      setNewMaxRedemptions('');
      setNewExpiresAt('');
      setSelectedAgent(null);
      setAgentSearch('');
      setAgentOptions([]);
      await loadAgentCodes();
      setSelectedCodeId(created.id);
    } catch (err) {
      setAgentCodesError(err instanceof Error ? err.message : 'Unable to create agent code.');
    } finally {
      setCreatingCode(false);
    }
  }

  async function handleAgentSearch(event: React.FormEvent) {
    event.preventDefault();
    await searchAgents(agentSearch);
  }

  async function handleCodeUpdate(updates: Partial<Pick<AgentInviteCode, 'is_active'>> & { revoked_at?: string | null }) {
    if (!selectedCode) return;
    setCodeSaving(true);
    setAgentCodesError(null);
    try {
      const response = await authFetch(`/invites/admin/agent-codes/${selectedCode.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const payload = (await response.json().catch(() => null)) as AgentInviteCode | { error?: string; detail?: string } | null;
      if (!response.ok) {
        const data = payload as { error?: string; detail?: string } | null;
        throw new Error(data?.detail || data?.error || 'Unable to update agent code.');
      }
      const updated = payload as AgentInviteCode;
      setAgentCodes((current) => current.map((code) => (code.id === updated.id ? updated : code)));
      setSelectedCodeId(updated.id);
    } catch (err) {
      setAgentCodesError(err instanceof Error ? err.message : 'Unable to update agent code.');
    } finally {
      setCodeSaving(false);
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved on this page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{loading ? '—' : stats.approvedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active agent codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-indigo-600">{agentCodesLoading ? '—' : activeCodeCount}</p>
            <p className="mt-2 text-xs text-muted-foreground">{agentCodesCount} codes loaded in admin</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle>Create agent code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAgentSearch} className="flex gap-2">
              <Input
                value={agentSearch}
                onChange={(event) => setAgentSearch(event.target.value)}
                placeholder="Search approved agent by name, phone, or email"
              />
              <Button type="submit" variant="outline" disabled={agentSearchLoading}>
                {agentSearchLoading ? 'Finding...' : 'Find'}
              </Button>
            </form>

            {agentOptions.length > 0 ? (
              <div className="rounded-2xl border border-[color:var(--stroke)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Select</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentOptions.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{resolveUserLabel(user)}</div>
                          <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                        </TableCell>
                        <TableCell>{user.user_type || '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button type="button" size="sm" variant="outline" onClick={() => setSelectedAgent(user)}>
                            Use
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}

            <form onSubmit={handleCreateCode} className="space-y-4 rounded-3xl border border-[color:var(--stroke)] bg-white p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected agent</p>
                <p className="mt-2 text-sm">
                  {selectedAgent ? `${resolveUserLabel(selectedAgent)} • ${selectedAgent.phone_number}` : 'No agent selected yet.'}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Reusable code</label>
                  <Input
                    value={newCode}
                    onChange={(event) => setNewCode(event.target.value.toUpperCase())}
                    placeholder="AGENT-PHIL-01"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Max redemptions</label>
                  <Input
                    value={newMaxRedemptions}
                    onChange={(event) => setNewMaxRedemptions(event.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Leave blank for unlimited"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Expires at</label>
                <Input
                  type="datetime-local"
                  value={newExpiresAt}
                  onChange={(event) => setNewExpiresAt(event.target.value)}
                />
              </div>
              {createMessage ? <p className="text-sm text-emerald-600">{createMessage}</p> : null}
              <div className="flex gap-2">
                <Button type="submit" disabled={creatingCode}>
                  {creatingCode ? 'Creating...' : 'Create agent code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedAgent(null);
                    setNewCode('');
                    setNewMaxRedemptions('');
                    setNewExpiresAt('');
                    setCreateMessage(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle>Manage agent codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadAgentCodes();
              }}
              className="flex flex-col gap-3 md:flex-row"
            >
              <Input
                value={agentCodeQuery}
                onChange={(event) => setAgentCodeQuery(event.target.value)}
                placeholder="Search by code, phone, or email"
              />
              <Select value={agentCodeActiveFilter} onValueChange={(value) => setAgentCodeActiveFilter(value as 'all' | 'true' | 'false')}>
                <SelectTrigger className="md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All codes</SelectItem>
                  <SelectItem value="true">Active only</SelectItem>
                  <SelectItem value="false">Inactive only</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline">Refresh</Button>
            </form>

            <div className="rounded-2xl border border-[color:var(--stroke)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Uses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentCodesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Loading codes...
                      </TableCell>
                    </TableRow>
                  ) : agentCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No agent codes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agentCodes.map((code) => (
                      <TableRow
                        key={code.id}
                        className={`cursor-pointer ${selectedCodeId === code.id ? 'bg-[color:var(--soft)]/30' : 'hover:bg-[color:var(--soft)]/20'}`}
                        onClick={() => setSelectedCodeId(code.id)}
                      >
                        <TableCell className="font-medium">{code.code}</TableCell>
                        <TableCell>
                          <div>{code.agent_name}</div>
                          <div className="text-xs text-muted-foreground">{code.agent_phone_number}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={codeBadgeTone(code.is_active && !code.revoked_at)}>
                            {code.revoked_at ? 'Revoked' : code.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {code.redemption_count}
                          {code.max_redemptions !== null ? ` / ${code.max_redemptions}` : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {selectedCode ? (
              <div className="space-y-4 rounded-3xl border border-[color:var(--stroke)] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected code</p>
                    <h3 className="mt-2 text-xl font-semibold">{selectedCode.code}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCode.agent_name} • {selectedCode.agent_phone_number}
                    </p>
                  </div>
                  <Badge variant="outline" className={codeBadgeTone(selectedCode.is_active && !selectedCode.revoked_at)}>
                    {selectedCode.revoked_at ? 'Revoked' : selectedCode.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Created</p>
                    <p className="mt-2 text-sm">{formatDate(selectedCode.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expires</p>
                    <p className="mt-2 text-sm">{formatDate(selectedCode.expires_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Redemptions</p>
                    <p className="mt-2 text-sm">
                      {selectedCode.redemption_count}
                      {selectedCode.max_redemptions !== null ? ` used of ${selectedCode.max_redemptions}` : ' used'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Remaining</p>
                    <p className="mt-2 text-sm">{selectedCode.redemptions_remaining ?? 'Unlimited'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={codeSaving || selectedCode.revoked_at !== null || selectedCode.is_active}
                    onClick={() => handleCodeUpdate({ is_active: true })}
                  >
                    Activate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={codeSaving || selectedCode.revoked_at !== null || !selectedCode.is_active}
                    onClick={() => handleCodeUpdate({ is_active: false })}
                  >
                    Deactivate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={codeSaving || selectedCode.revoked_at !== null}
                    onClick={() => handleCodeUpdate({ is_active: false, revoked_at: new Date().toISOString() })}
                  >
                    Revoke permanently
                  </Button>
                </div>
              </div>
            ) : null}

            {agentCodesError ? <p className="text-sm text-red-600">{agentCodesError}</p> : null}
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
                        {formatDate(entry.created_at)}
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
