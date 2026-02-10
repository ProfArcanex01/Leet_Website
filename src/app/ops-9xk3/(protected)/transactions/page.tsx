"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { authFetch } from '@/lib/api';

type Transaction = {
  id: number;
  amount: string | number;
  transaction_type: string;
  status: string;
  transaction_id: string | null;
  created_at: string;
  user?: { id: number; first_name?: string; last_name?: string; phone_number?: string };
  ride?: number | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [userId, setUserId] = useState('');
  const [rideId, setRideId] = useState('');
  const [hostId, setHostId] = useState('');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [matrix, setMatrix] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
  });

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count]);

  const loadTransactions = async (overrides?: {
    page?: number;
    status?: string;
    type?: string;
    userId?: string;
    rideId?: string;
    hostId?: string;
  }) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    const nextPage = overrides?.page ?? page;
    const nextStatus = overrides?.status ?? status;
    const nextType = overrides?.type ?? type;
    const nextUserId = overrides?.userId ?? userId;
    const nextRideId = overrides?.rideId ?? rideId;
    const nextHostId = overrides?.hostId ?? hostId;
    params.set('page', String(nextPage));
    if (nextStatus !== 'all') params.set('status', nextStatus);
    if (nextType !== 'all') params.set('type', nextType);
    if (nextUserId) params.set('user_id', nextUserId);
    if (nextRideId) params.set('ride_id', nextRideId);
    if (nextHostId) params.set('host_id', nextHostId);

    try {
      const [listResponse, pendingResponse, completedResponse, failedResponse] = await Promise.all([
        authFetch(`/payments/admin/transactions/?${params.toString()}`),
        authFetch('/payments/admin/transactions/?page_size=1&status=PENDING'),
        authFetch('/payments/admin/transactions/?page_size=1&status=COMPLETED'),
        authFetch('/payments/admin/transactions/?page_size=1&status=FAILED'),
      ]);
      const payload = (await listResponse.json().catch(() => ({}))) as Paginated<Transaction>;
      const pendingPayload = await pendingResponse.json().catch(() => ({}));
      const completedPayload = await completedResponse.json().catch(() => ({}));
      const failedPayload = await failedResponse.json().catch(() => ({}));

      if (!listResponse.ok) {
        throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load transactions.');
      }
      setTransactions(payload.results || []);
      setCount(payload.count || 0);
      setMatrix({
        total: (pendingPayload?.count ?? 0) + (completedPayload?.count ?? 0) + (failedPayload?.count ?? 0),
        pending: pendingPayload?.count ?? 0,
        completed: completedPayload?.count ?? 0,
        failed: failedPayload?.count ?? 0,
      });
      setLastRefreshed(new Date().toLocaleString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load transactions.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Monitor payments across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="RIDE_PAYMENT">Ride payment</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div>
            <Label>Ride ID</Label>
            <Input value={rideId} onChange={(e) => setRideId(e.target.value)} />
          </div>
          <div>
            <Label>Host ID</Label>
            <Input value={hostId} onChange={(e) => setHostId(e.target.value)} />
          </div>
          <div className="md:col-span-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setPage(1);
                loadTransactions({ page: 1 });
              }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply filters'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const resetStatus = 'all';
                const resetType = 'all';
                const resetUserId = '';
                const resetRideId = '';
                const resetHostId = '';
                setStatus(resetStatus);
                setType(resetType);
                setUserId(resetUserId);
                setRideId(resetRideId);
                setHostId(resetHostId);
                setPage(1);
                loadTransactions({
                  page: 1,
                  status: resetStatus,
                  type: resetType,
                  userId: resetUserId,
                  rideId: resetRideId,
                  hostId: resetHostId,
                });
              }}
            >
              Reset
            </Button>
            {error ? (
              <div className="flex items-center gap-3 text-sm text-red-500">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => loadTransactions()} disabled={loading}>
                  Retry
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Transactions matrix</CardTitle>
          <CardDescription>Counts by status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Total', value: matrix.total },
            { label: 'Pending', value: matrix.pending },
            { label: 'Completed', value: matrix.completed },
            { label: 'Failed', value: matrix.failed },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-input bg-background px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold">{item.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {count} total records
            {lastRefreshed ? ` • Refreshed ${lastRefreshed}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                      <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
                      <span>No transactions found.</span>
                      <Button variant="outline" size="sm" onClick={() => loadTransactions()}>
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id} onClick={() => setSelected(txn)} className="cursor-pointer">
                    <TableCell className="font-semibold">{txn.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {txn.user?.first_name || txn.user?.last_name
                          ? [txn.user?.first_name, txn.user?.last_name].filter(Boolean).join(' ')
                          : txn.user?.phone_number || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">Ride {txn.ride ?? '—'}</div>
                    </TableCell>
                    <TableCell>{txn.transaction_type}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary">{txn.status}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Transaction status: {txn.status}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{txn.amount}</TableCell>
                    <TableCell>{new Date(txn.created_at).toLocaleString()}</TableCell>
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
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Transaction details</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Transaction ID</div>
                <div className="mt-2 text-lg font-semibold">{selected.id}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Type</div>
                  <div className="mt-2">{selected.transaction_type}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</div>
                  <div className="mt-2">{selected.status}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</div>
                  <div className="mt-2 text-lg font-semibold">{selected.amount}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ride ID</div>
                  <div className="mt-2">{selected.ride ?? '—'}</div>
                </div>
              </div>
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User</div>
                <div className="mt-2 text-sm font-semibold">
                  {selected.user?.first_name || selected.user?.last_name
                    ? [selected.user?.first_name, selected.user?.last_name].filter(Boolean).join(' ')
                    : selected.user?.phone_number || 'Unknown'}
                </div>
              </div>
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</div>
                <div className="mt-2">{new Date(selected.created_at).toLocaleString()}</div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
