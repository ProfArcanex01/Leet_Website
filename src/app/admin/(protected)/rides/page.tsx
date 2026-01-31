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

type Ride = {
  id: number;
  status: string;
  fare_amount?: string | number | null;
  created_at: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  host?: { id: number; first_name?: string; last_name?: string; phone_number?: string };
  rider?: { id: number; first_name?: string; last_name?: string; phone_number?: string };
  paid?: boolean;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [hostId, setHostId] = useState('');
  const [riderId, setRiderId] = useState('');
  const [selected, setSelected] = useState<Ride | null>(null);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / 20)), [count]);

  const loadRides = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (status !== 'all') params.set('status', status);
    if (hostId) params.set('host_id', hostId);
    if (riderId) params.set('rider_id', riderId);

    try {
      const response = await authFetch(`/rides/admin/rides/?${params.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as Paginated<Ride>;
      if (!response.ok) {
        throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load rides.');
      }
      setRides(payload.results || []);
      setCount(payload.count || 0);
      setLastRefreshed(new Date().toLocaleString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load rides.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, [page]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Audit ride history and status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Host ID</Label>
            <Input value={hostId} onChange={(e) => setHostId(e.target.value)} />
          </div>
          <div>
            <Label>Rider ID</Label>
            <Input value={riderId} onChange={(e) => setRiderId(e.target.value)} />
          </div>
          <div className="flex items-end gap-3">
            <Button onClick={() => { setPage(1); loadRides(); }} disabled={loading}>
              {loading ? 'Loading...' : 'Apply filters'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStatus('all');
                setHostId('');
                setRiderId('');
                setPage(1);
                loadRides();
              }}
            >
              Reset
            </Button>
          </div>
          {error ? (
            <div className="flex items-center gap-3 text-sm text-red-500">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadRides} disabled={loading}>
                Retry
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Ride history</CardTitle>
          <CardDescription>
            {count} total rides
            {lastRefreshed ? ` • Refreshed ${lastRefreshed}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rides.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
                      <span>No rides found.</span>
                      <Button variant="outline" size="sm" onClick={loadRides}>
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rides.map((ride) => (
                  <TableRow key={ride.id} onClick={() => setSelected(ride)} className="cursor-pointer">
                    <TableCell className="font-semibold">{ride.id}</TableCell>
                    <TableCell>
                      {[ride.host?.first_name, ride.host?.last_name].filter(Boolean).join(' ') ||
                        ride.host?.phone_number || '—'}
                    </TableCell>
                    <TableCell>
                      {[ride.rider?.first_name, ride.rider?.last_name].filter(Boolean).join(' ') ||
                        ride.rider?.phone_number || '—'}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge>{ride.status}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Ride status: {ride.status}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{ride.fare_amount ?? '—'}</TableCell>
                    <TableCell>{ride.paid ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{new Date(ride.created_at).toLocaleString()}</TableCell>
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
            <SheetTitle>Ride details</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ride ID</div>
                <div className="mt-2 text-lg font-semibold">{selected.id}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</div>
                  <div className="mt-2">{selected.status}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fare</div>
                  <div className="mt-2 text-lg font-semibold">{selected.fare_amount ?? '—'}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Paid</div>
                  <div className="mt-2">{selected.paid ? 'Yes' : 'No'}</div>
                </div>
                <div className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</div>
                  <div className="mt-2">{new Date(selected.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Host</div>
                <div className="mt-2">
                  {[selected.host?.first_name, selected.host?.last_name].filter(Boolean).join(' ') ||
                    selected.host?.phone_number || '—'}
                </div>
              </div>
              <div className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rider</div>
                <div className="mt-2">
                  {[selected.rider?.first_name, selected.rider?.last_name].filter(Boolean).join(' ') ||
                    selected.rider?.phone_number || '—'}
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
