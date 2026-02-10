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
import { authFetch } from '@/lib/api';

type AdminUser = {
  id: number;
  phone_number: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  invited_by?: number | null;
  user_type: 'HOST' | 'RIDER' | null;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  suspended_until?: string | null;
  date_joined: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [userType, setUserType] = useState('all');
  const [verified, setVerified] = useState('all');
  const [active, setActive] = useState('all');
  const [staff, setStaff] = useState('all');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const [suspensionPeriod, setSuspensionPeriod] = useState<'none' | 'clear' | 'day' | 'week' | 'month' | 'custom'>('none');
  const [customSuspension, setCustomSuspension] = useState('');

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count]);

  const loadUsers = async (overrides?: {
    page?: number;
    query?: string;
    userType?: string;
    verified?: string;
    active?: string;
    staff?: string;
  }) => {
    setLoading(true);
    setError(null);
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
    if (!selected) return;
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
      const response = await authFetch(`/accounts/admin/users/${selected.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          user_type: selected.user_type,
          is_verified: selected.is_verified,
          is_active: selected.is_active,
          is_staff: selected.is_staff,
          is_superuser: selected.is_superuser,
          ...suspensionPayload,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || 'Unable to update user.');
      }
      setUsers((current) => current.map((user) => (user.id === selected.id ? payload : user)));
      setSelected(payload);
      setSuspensionPeriod('none');
      setCustomSuspension('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update user.';
      setError(message);
    } finally {
      setUpdating(false);
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
                      onClick={() => setSelected(user)}
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
                    onClick={() => router.push(`/admin/network?user=${selected.id}`)}
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
                    { key: 'is_staff', label: 'Staff access' },
                    { key: 'is_superuser', label: 'Superadmin' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean((selected as any)[item.key])}
                        onChange={(event) =>
                          setSelected((prev) =>
                            prev ? { ...prev, [item.key]: event.target.checked } : prev
                          )
                        }
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
                <Button onClick={updateUser} disabled={updating}>
                  {updating ? 'Saving...' : 'Save changes'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
