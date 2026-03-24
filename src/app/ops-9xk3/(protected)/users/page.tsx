"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authFetch } from '@/lib/api';

type AdminGroupName =
  | 'ops_admin'
  | 'trust_safety_admin'
  | 'finance_admin'
  | 'growth_admin'
  | 'platform_admin';

type AdminUser = {
  id: number;
  phone_number: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  invited_by?: number | null;
  invite_code?: string | null;
  invitation_code?: string | null;
  is_invite_activated?: boolean;
  user_type: 'HOST' | 'RIDER' | null;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_agent: boolean;
  admin_groups?: AdminGroupName[];
  suspended_until?: string | null;
  date_joined: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function extractApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`;
    }
    if (typeof value === 'string') {
      return `${field}: ${value}`;
    }
  }
  return fallback;
}

const ADMIN_ROLE_OPTIONS: Array<{ key: AdminGroupName; label: string }> = [
  { key: 'ops_admin', label: 'Ops admin' },
  { key: 'trust_safety_admin', label: 'Trust & safety admin' },
  { key: 'finance_admin', label: 'Finance admin' },
  { key: 'growth_admin', label: 'Growth admin' },
  { key: 'platform_admin', label: 'Platform admin' },
];

function normalizeAdminGroups(groups?: AdminGroupName[]): AdminGroupName[] {
  return [...new Set(groups || [])].sort() as AdminGroupName[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [userType, setUserType] = useState('all');
  const [verified, setVerified] = useState('all');
  const [active, setActive] = useState('all');
  const [staff, setStaff] = useState('all');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [selectedBase, setSelectedBase] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [suspensionPeriod, setSuspensionPeriod] = useState<'none' | 'clear' | 'day' | 'week' | 'month' | 'custom'>('none');
  const [customSuspension, setCustomSuspension] = useState('');
  const [adminRoleReason, setAdminRoleReason] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [noInviteUsers, setNoInviteUsers] = useState<AdminUser[]>([]);
  const [noInviteLoading, setNoInviteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all-users' | 'no-invite'>('all-users');

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count]);
  const noInvitePreview = useMemo(() => noInviteUsers.slice(0, 20), [noInviteUsers]);

  const handleSelectUser = (user: AdminUser) => {
    const normalizedUser = { ...user, admin_groups: normalizeAdminGroups(user.admin_groups) };
    setSelected(normalizedUser);
    setSelectedBase(normalizedUser);
    setSuspensionPeriod('none');
    setCustomSuspension('');
    setAdminRoleReason('');
    setChangeReason('');
    setError(null);
    setSuccessMessage(null);
  };

  const loadUsers = async (overrides?: {
    page?: number;
    query?: string;
    userType?: string;
    verified?: string;
    active?: string;
    staff?: string;
    preserveMessages?: boolean;
  }) => {
    setLoading(true);
    if (!overrides?.preserveMessages) {
      setError(null);
      setSuccessMessage(null);
    }
    const params = new URLSearchParams();
    const nextPage = overrides?.page ?? page;
    const nextQuery = overrides?.query ?? query;
    const nextUserType = overrides?.userType ?? userType;
    const nextVerified = overrides?.verified ?? verified;
    const nextActive = overrides?.active ?? active;
    const nextStaff = overrides?.staff ?? staff;
    params.set('page', String(nextPage));
    if (nextQuery) params.set('q', nextQuery);
    if (nextUserType !== 'all') params.set('user_type', nextUserType);
    if (nextVerified !== 'all') params.set('is_verified', nextVerified);
    if (nextActive !== 'all') params.set('is_active', nextActive);
    if (nextStaff !== 'all') params.set('is_staff', nextStaff);

    try {
      const response = await authFetch(`/accounts/admin/users/?${params.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as Paginated<AdminUser>;
      if (!response.ok) {
        throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load users.');
      }
      setUsers(payload.results || []);
      setCount(payload.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load users.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    const loadNoInviteUsers = async () => {
      setNoInviteLoading(true);
      try {
        const aggregated: AdminUser[] = [];
        let nextPage = 1;
        while (true) {
          const response = await authFetch(`/accounts/admin/users/?page=${nextPage}&page_size=100`);
          const payload = (await response.json().catch(() => ({}))) as Paginated<AdminUser>;
          if (!response.ok) {
            throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load users.');
          }
          aggregated.push(...(payload.results || []));
          if (!payload.next) break;
          nextPage += 1;
        }
        if (cancelled) return;
        const filtered = aggregated.filter((user) => {
          const hasCodeField = user.invite_code !== undefined || user.invitation_code !== undefined;
          const missingCodeByField = hasCodeField ? !user.invite_code && !user.invitation_code : false;
          const missingByActivation = user.is_invite_activated === false;
          const missingByInviter = user.invited_by == null;
          return missingByInviter || missingByActivation || missingCodeByField;
        });
        setNoInviteUsers(filtered);
      } catch {
        if (!cancelled) setNoInviteUsers([]);
      } finally {
        if (!cancelled) setNoInviteLoading(false);
      }
    };
    loadNoInviteUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q && q !== query) {
      setQuery(q);
      setPage(1);
      loadUsers({ page: 1, query: q });
    }
  }, [searchParams, query]);

  const applyFilters = () => {
    setPage(1);
    loadUsers({ page: 1 });
  };

  const updateUser = async () => {
    if (!selected || !selectedBase) return;
    setUpdating(true);
    setError(null);
    try {
      let suspensionPayload: Record<string, string | null> = {};
      if (suspensionPeriod === 'clear') {
        suspensionPayload = { suspended_until: null };
      } else if (suspensionPeriod === 'custom') {
        suspensionPayload = {
          suspended_until: customSuspension ? new Date(customSuspension).toISOString() : null,
        };
      } else if (suspensionPeriod !== 'none') {
        const days =
          suspensionPeriod === 'day' ? 1 : suspensionPeriod === 'week' ? 7 : 30;
        suspensionPayload = {
          suspended_until: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
      const requestBody: Record<string, string | boolean | string[] | null> = {};
      if (selected.user_type !== selectedBase.user_type) requestBody.user_type = selected.user_type;
      if (selected.is_verified !== selectedBase.is_verified) requestBody.is_verified = selected.is_verified;
      if (selected.is_active !== selectedBase.is_active) requestBody.is_active = selected.is_active;
      if (selected.is_agent !== selectedBase.is_agent) requestBody.is_agent = selected.is_agent;
      const selectedAdminGroups = normalizeAdminGroups(selected.admin_groups);
      const baseAdminGroups = normalizeAdminGroups(selectedBase.admin_groups);
      const adminGroupsChanged = selectedAdminGroups.join(',') !== baseAdminGroups.join(',');
      if (adminGroupsChanged) {
        if (!adminRoleReason.trim()) {
          setError('Provide a reason when changing admin roles.');
          return;
        }
        requestBody.admin_group_names = selectedAdminGroups;
        requestBody.admin_group_change_reason = adminRoleReason.trim();
      }
      Object.assign(requestBody, suspensionPayload);

      if (Object.keys(requestBody).length === 0) {
        setError('No changes to save.');
        return;
      }
      if (!changeReason.trim()) {
        setError('Provide a reason for this admin change.');
        return;
      }
      requestBody.reason = changeReason.trim();
      let response = await authFetch(`/accounts/admin/users/${selected.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      });
      // Some backends only expose PUT for updates.
      if (response.status === 405) {
        response = await authFetch(`/accounts/admin/users/${selected.id}/`, {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        });
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to update user.'));
      }
      const hasUserPayload = payload && typeof payload === 'object' && typeof (payload as AdminUser).id === 'number';
      const updatedUser = hasUserPayload
        ? {
            ...selected,
            ...(payload as Partial<AdminUser>),
            admin_groups: normalizeAdminGroups((payload as Partial<AdminUser>).admin_groups ?? selected.admin_groups),
          }
        : selected;
      setUsers((current) => current.map((user) => (user.id === selected.id ? updatedUser : user)));
      setSelected(updatedUser);
      setSelectedBase(updatedUser);
      setSuspensionPeriod('none');
      setCustomSuspension('');
      setAdminRoleReason('');
      setChangeReason('');
      setSuccessMessage('User updated successfully.');
      await loadUsers({ page, preserveMessages: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update user.';
      setError(message);
      setSuccessMessage(null);
    } finally {
      setUpdating(false);
    }
  };

  const closeDeleteModal = () => {
    setConfirmDeleteOpen(false);
    setDeleteConfirmText('');
  };

  const deleteSelectedUser = async () => {
    if (!selected) return;
    if (deleteConfirmText.trim().toLowerCase() !== 'delete') return;

    setDeleting(true);
    setError(null);
    try {
      if (!changeReason.trim()) {
        throw new Error('Provide a reason for this admin change.');
      }
      const response = await authFetch(`/accounts/admin/users/${selected.id}/`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: changeReason.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail || payload?.error || 'Unable to delete user.');
      }

      setUsers((current) => current.filter((user) => user.id !== selected.id));
      setCount((current) => Math.max(0, current - 1));
      setSelected(null);
      setSelectedBase(null);
      setSuccessMessage('User deleted successfully.');
      closeDeleteModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete user.';
      setError(message);
      setSuccessMessage(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Search & filter</CardTitle>
          <CardDescription>Find users by name, phone, or type.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label htmlFor="query">Search</Label>
            <Input
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search phone, email, name"
            />
          </div>
          <div>
            <Label>User type</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="HOST">Host</SelectItem>
                <SelectItem value="RIDER">Rider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Verified</Label>
            <Select value={verified} onValueChange={setVerified}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Active</Label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Staff</Label>
            <Select value={staff} onValueChange={setStaff}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Staff</SelectItem>
                <SelectItem value="false">Non-staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-5 flex flex-wrap items-center gap-3">
            <Button onClick={applyFilters} disabled={loading}>
              {loading ? 'Loading...' : 'Apply filters'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const resetQuery = '';
                const resetUserType = 'all';
                const resetVerified = 'all';
                const resetActive = 'all';
                const resetStaff = 'all';
                setQuery(resetQuery);
                setUserType(resetUserType);
                setVerified(resetVerified);
                setActive(resetActive);
                setStaff(resetStaff);
                setPage(1);
                loadUsers({
                  page: 1,
                  query: resetQuery,
                  userType: resetUserType,
                  verified: resetVerified,
                  active: resetActive,
                  staff: resetStaff,
                });
              }}
            >
              Reset
            </Button>
            {error ? (
              <div className="flex items-center gap-3 text-sm text-red-500">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => loadUsers()} disabled={loading}>
                  Retry
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-red-700" aria-live="polite">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-emerald-700" aria-live="polite">
              {successMessage}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all-users' | 'no-invite')}>
        <TabsList>
          <TabsTrigger value="all-users">All users</TabsTrigger>
          <TabsTrigger value="no-invite">No invitation code</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Users</CardTitle>
                <CardDescription>{count} total records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
                            <span>No users found.</span>
                            <Button variant="outline" size="sm" onClick={() => loadUsers()}>
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          className={selected?.id === user.id ? 'bg-[color:var(--soft)]' : undefined}
                          onClick={() => handleSelectUser(user)}
                        >
                          <TableCell>
                            <div className="font-semibold">
                              {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                          </TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            <Badge>{user.user_type || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex flex-wrap gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={user.is_verified ? 'bg-emerald-100 text-emerald-700' : ''}>
                                      {user.is_verified ? 'Verified' : 'Unverified'}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>{user.is_verified ? 'Verified account' : 'Not verified'}</span>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={user.is_active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}>
                                      {user.is_active ? 'Active' : 'Disabled'}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>{user.is_active ? 'User can sign in' : 'User is disabled'}</span>
                                  </TooltipContent>
                                </Tooltip>
                                {user.is_agent ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-violet-100 text-violet-700">Agent</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>Has access to the separate agent portal</span>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                                {user.suspended_until ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="bg-amber-100 text-amber-800">Suspended</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>Until {new Date(user.suspended_until).toLocaleString()}</span>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}
                              </div>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pageCount}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                      disabled={page === pageCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>User detail</CardTitle>
                <CardDescription>Update roles, verification, and access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">Select a user to edit their access.</p>
                ) : (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input value={[selected.first_name, selected.last_name].filter(Boolean).join(' ') || 'Unnamed'} readOnly />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/ops-9xk3/network?user=${selected.id}`)}
                      >
                        View invite network
                      </Button>
                    </div>
                    <div>
                      <Label>Suspension status</Label>
                      <div className="text-sm text-muted-foreground">
                        {selected.suspended_until
                          ? `Suspended until ${new Date(selected.suspended_until).toLocaleString()}`
                          : 'Not suspended'}
                      </div>
                    </div>
                    <div>
                      <Label>User type</Label>
                      <Select
                        value={selected.user_type ?? 'unset'}
                        onValueChange={(value) =>
                          setSelected((prev) =>
                            prev ? { ...prev, user_type: value === 'unset' ? null : (value as AdminUser['user_type']) } : prev
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">Unset</SelectItem>
                          <SelectItem value="HOST">Host</SelectItem>
                          <SelectItem value="RIDER">Rider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Suspend user</Label>
                      <Select value={suspensionPeriod} onValueChange={(value) => setSuspensionPeriod(value as typeof suspensionPeriod)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No change</SelectItem>
                          <SelectItem value="clear">Clear suspension</SelectItem>
                          <SelectItem value="day">Suspend 1 day</SelectItem>
                          <SelectItem value="week">Suspend 1 week</SelectItem>
                          <SelectItem value="month">Suspend 1 month</SelectItem>
                          <SelectItem value="custom">Pick date/time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {suspensionPeriod === 'custom' ? (
                      <div>
                        <Label>Suspended until</Label>
                        <Input
                          type="datetime-local"
                          value={customSuspension}
                          onChange={(event) => setCustomSuspension(event.target.value)}
                        />
                      </div>
                    ) : null}
                    <div className="grid gap-2">
                      {[
                        { key: 'is_verified', label: 'Verified account' },
                        { key: 'is_active', label: 'Active user' },
                        { key: 'is_agent', label: 'Agent portal access' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean((selected as any)[item.key])}
                            onChange={(event) =>
                              {
                                setSuccessMessage(null);
                                setSelected((prev) =>
                                  prev ? { ...prev, [item.key]: event.target.checked } : prev
                                );
                              }
                            }
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Admin roles</Label>
                      <div className="grid gap-2">
                        {ADMIN_ROLE_OPTIONS.map((role) => (
                          <label key={role.key} className="flex items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(selected.admin_groups?.includes(role.key))}
                              onChange={(event) => {
                                setSuccessMessage(null);
                                setSelected((prev) => {
                                  if (!prev) return prev;
                                  const currentGroups = new Set(prev.admin_groups || []);
                                  if (event.target.checked) {
                                    currentGroups.add(role.key);
                                  } else {
                                    currentGroups.delete(role.key);
                                  }
                                  return {
                                    ...prev,
                                    admin_groups: normalizeAdminGroups([...currentGroups]),
                                  };
                                });
                              }}
                            />
                            {role.label}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Staff access is derived from admin roles. Platform admin is treated as full admin authority.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="change-reason">Audit reason</Label>
                      <Input
                        id="change-reason"
                        value={changeReason}
                        onChange={(event) => setChangeReason(event.target.value)}
                        placeholder="Required for any admin update or delete"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-role-reason">Role change reason</Label>
                      <Input
                        id="admin-role-reason"
                        value={adminRoleReason}
                        onChange={(event) => setAdminRoleReason(event.target.value)}
                        placeholder="Required when changing admin roles"
                      />
                    </div>
                    <Button onClick={updateUser} disabled={updating}>
                      {updating ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmDeleteOpen(true)}
                      disabled={updating || deleting}
                    >
                      Delete user
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="no-invite">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Users without invitation code</CardTitle>
              <CardDescription>
                Contact list for users with no inviter/code. Showing {noInvitePreview.length} of {noInviteUsers.length}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noInvitePreview.length === 0 && !noInviteLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-muted-foreground">
                        No users without invitation code found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    noInvitePreview.map((user) => (
                      <TableRow
                        key={`no-invite-${user.id}`}
                        onClick={() => {
                          handleSelectUser(user);
                          setActiveTab('all-users');
                        }}
                      >
                        <TableCell>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unnamed'}</TableCell>
                        <TableCell>{user.phone_number || 'No phone'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.user_type || 'Unknown'}</TableCell>
                        <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {noInviteLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading contact list...</p> : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {confirmDeleteOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle>Delete user</CardTitle>
              <CardDescription>
                This action is permanent. Type <span className="font-semibold">delete</span> to confirm deleting{' '}
                {[selected.first_name, selected.last_name].filter(Boolean).join(' ') || selected.email || selected.phone_number}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Confirmation</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="Type delete"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={closeDeleteModal} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteSelectedUser}
                  disabled={deleting || deleteConfirmText.trim().toLowerCase() !== 'delete'}
                >
                  {deleting ? 'Deleting...' : 'Confirm delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
