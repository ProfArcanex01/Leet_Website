"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';

type DemandSummary = {
  searches: number;
  zero_result_searches: number;
  requests: number;
  zero_result_rate: number;
  search_to_request_rate: number;
  avg_results_per_search: number;
};

type DemandBucket = {
  label: string;
  searches: number;
  zero_result_searches: number;
  requests: number;
};

type DemandCorridor = {
  origin_label: string;
  destination_label: string;
  searches: number;
  zero_result_searches: number;
  requests: number;
};

type DemandHourly = {
  hour: number;
  searches: number;
  zero_result_searches: number;
  requests: number;
};

type DemandRecentEvent = {
  id: number;
  event_type: 'ROUTE_SEARCH' | 'RIDE_REQUEST';
  origin_name: string | null;
  destination_name: string | null;
  origin_label: string;
  destination_label: string;
  requested_seats: number;
  result_count: number;
  created_at: string;
  rider_id: number;
  planned_route_id: number | null;
};

type DemandResponse = {
  period: {
    days: number;
    start_at: string;
    end_at: string;
  };
  summary: DemandSummary;
  top_pickups: DemandBucket[];
  top_destinations: DemandBucket[];
  top_corridors: DemandCorridor[];
  hourly: DemandHourly[];
  daily: Array<{
    day: string;
    searches: number;
    zero_result_searches: number;
    requests: number;
  }>;
  recent_events: DemandRecentEvent[];
};

const PERIOD_OPTIONS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 14 days', value: '14' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 60 days', value: '60' },
];

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export default function AdminDemandPage() {
  const [days, setDays] = useState('14');
  const [data, setData] = useState<DemandResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const maxHourlySearches = useMemo(
    () => Math.max(...(data?.hourly.map((item) => item.searches) || [0])),
    [data?.hourly],
  );

  const maxDailySearches = useMemo(
    () => Math.max(...(data?.daily.map((item) => item.searches) || [0])),
    [data?.daily],
  );

  const loadDemand = useCallback(async (nextDays = days) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/rides/admin/demand/?days=${nextDays}&limit=8`);
      const payload = (await response.json().catch(() => ({}))) as DemandResponse;
      if (!response.ok) {
        throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load demand analytics.');
      }
      setData(payload);
      setLastRefreshed(new Date().toLocaleString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load demand analytics.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadDemand();
  }, [loadDemand]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Demand filters</CardTitle>
          <CardDescription>Track where riders are searching, failing to find routes, and converting into requests.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <Label>Time window</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => loadDemand()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh analytics'}
          </Button>
          {lastRefreshed ? <div className="text-sm text-muted-foreground">Updated {lastRefreshed}</div> : null}
          {error ? <div className="text-sm text-red-500">{error}</div> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Searches', value: data?.summary.searches ?? 0, tone: 'text-primary' },
          { label: 'No-result searches', value: data?.summary.zero_result_searches ?? 0, tone: 'text-amber-600' },
          { label: 'Requests', value: data?.summary.requests ?? 0, tone: 'text-emerald-600' },
          { label: 'No-result rate', value: formatPercent(data?.summary.zero_result_rate ?? 0), tone: 'text-amber-700' },
          { label: 'Search → request', value: formatPercent(data?.summary.search_to_request_rate ?? 0), tone: 'text-emerald-700' },
          { label: 'Avg matches', value: (data?.summary.avg_results_per_search ?? 0).toFixed(2), tone: 'text-slate-700' },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-semibold ${item.tone}`}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Top corridors</CardTitle>
            <CardDescription>Origin-destination pairs with the strongest rider demand.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Corridor</TableHead>
                  <TableHead>Searches</TableHead>
                  <TableHead>No result</TableHead>
                  <TableHead>Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.top_corridors || []).map((corridor) => (
                  <TableRow key={`${corridor.origin_label}-${corridor.destination_label}`}>
                    <TableCell className="font-medium">
                      {corridor.origin_label} → {corridor.destination_label}
                    </TableCell>
                    <TableCell>{corridor.searches}</TableCell>
                    <TableCell>{corridor.zero_result_searches}</TableCell>
                    <TableCell>{corridor.requests}</TableCell>
                  </TableRow>
                ))}
                {!data?.top_corridors?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No demand corridors recorded for this period.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Latest demand events</CardTitle>
            <CardDescription>Recent searches and booking requests reaching the backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recent_events || []).map((event) => (
              <div key={event.id} className="rounded-xl border border-input bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline">{event.event_type === 'ROUTE_SEARCH' ? 'Search' : 'Request'}</Badge>
                  <div className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-3 text-sm font-medium">
                  {event.origin_label} → {event.destination_label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Rider #{event.rider_id} • Seats {event.requested_seats} • Results {event.result_count}
                  {event.planned_route_id ? ` • Route #${event.planned_route_id}` : ''}
                </div>
              </div>
            ))}
            {!data?.recent_events?.length ? (
              <div className="text-sm text-muted-foreground">No recent demand events found.</div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Top pickup hotspots</CardTitle>
            <CardDescription>Where riders most often start searching or requesting seats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.top_pickups || []).map((item) => {
              const zeroResultRate = item.searches ? (item.zero_result_searches / item.searches) * 100 : 0;
              return (
                <div key={item.label} className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{item.label}</div>
                    <Badge variant="outline">{item.searches} searches</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.requests} requests • {item.zero_result_searches} no-result • {formatPercent(zeroResultRate)} unmet
                  </div>
                </div>
              );
            })}
            {!data?.top_pickups?.length ? (
              <div className="text-sm text-muted-foreground">No pickup hotspots recorded yet.</div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Top destination hotspots</CardTitle>
            <CardDescription>Where riders most often want to end up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.top_destinations || []).map((item) => {
              const requestRate = item.searches ? (item.requests / item.searches) * 100 : 0;
              return (
                <div key={item.label} className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{item.label}</div>
                    <Badge variant="outline">{item.searches} searches</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.requests} requests • {item.zero_result_searches} no-result • {formatPercent(requestRate)} converted
                  </div>
                </div>
              );
            })}
            {!data?.top_destinations?.length ? (
              <div className="text-sm text-muted-foreground">No destination hotspots recorded yet.</div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Hourly demand pattern</CardTitle>
            <CardDescription>When riders are actively searching for routes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.hourly || []).map((item) => {
              const width = maxHourlySearches > 0 ? Math.max((item.searches / maxHourlySearches) * 100, item.searches > 0 ? 6 : 0) : 0;
              return (
                <div key={item.hour} className="grid grid-cols-[62px_1fr_auto] items-center gap-3">
                  <div className="text-xs text-muted-foreground">{formatHour(item.hour)}</div>
                  <div className="h-3 rounded-full bg-muted">
                    <div className="h-3 rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.searches} searches / {item.requests} requests
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Daily trend</CardTitle>
            <CardDescription>Search and request volume across the selected time window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.daily || []).map((item) => {
              const width = maxDailySearches > 0 ? Math.max((item.searches / maxDailySearches) * 100, item.searches > 0 ? 8 : 0) : 0;
              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(item.day).toLocaleDateString()}</span>
                    <span>
                      {item.searches} searches • {item.requests} requests • {item.zero_result_searches} no-result
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                    <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
            {!data?.daily?.length ? (
              <div className="text-sm text-muted-foreground">No daily demand trend available yet.</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
