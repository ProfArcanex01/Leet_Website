"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';

type CountState = {
  total: number;
  hosts: number;
  riders: number;
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<CountState>({ total: 0, hosts: 0, riders: 0 });
  const [onlineHosts, setOnlineHosts] = useState(0);
  const [transactionCounts, setTransactionCounts] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
  });
  const [transactionPeriods, setTransactionPeriods] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, hosts, riders, pending, completed, failed, stats, cadence] = await Promise.all([
        authFetch('/accounts/admin/users/?page_size=1'),
        authFetch('/accounts/admin/users/?page_size=1&user_type=HOST'),
        authFetch('/accounts/admin/users/?page_size=1&user_type=RIDER'),
        authFetch('/payments/admin/transactions/?page_size=1&status=PENDING'),
        authFetch('/payments/admin/transactions/?page_size=1&status=COMPLETED'),
        authFetch('/payments/admin/transactions/?page_size=1&status=FAILED'),
        authFetch('/accounts/admin/stats/'),
        authFetch('/payments/admin/transactions/stats/'),
      ]);
      const allPayload = await all.json().catch(() => ({}));
      const hostPayload = await hosts.json().catch(() => ({}));
      const riderPayload = await riders.json().catch(() => ({}));
      const pendingPayload = await pending.json().catch(() => ({}));
      const completedPayload = await completed.json().catch(() => ({}));
      const failedPayload = await failed.json().catch(() => ({}));
      const statsPayload = await stats.json().catch(() => ({}));
      const cadencePayload = await cadence.json().catch(() => ({}));
      if (!all.ok) {
        throw new Error(allPayload?.detail || allPayload?.error || 'Unable to load admin stats.');
      }
      setCounts({
        total: allPayload?.count ?? 0,
        hosts: hostPayload?.count ?? 0,
        riders: riderPayload?.count ?? 0,
      });
      setTransactionCounts({
        total: (pendingPayload?.count ?? 0) + (completedPayload?.count ?? 0) + (failedPayload?.count ?? 0),
        pending: pendingPayload?.count ?? 0,
        completed: completedPayload?.count ?? 0,
        failed: failedPayload?.count ?? 0,
      });
      setOnlineHosts(statsPayload?.online_hosts ?? 0);
      setTransactionPeriods({
        daily: cadencePayload?.daily ?? 0,
        weekly: cadencePayload?.weekly ?? 0,
        monthly: cadencePayload?.monthly ?? 0,
      });
      setLastRefreshed(new Date().toLocaleString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load admin stats.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Total users', value: counts.total, tone: 'text-primary' },
          { label: 'Hosts', value: counts.hosts, tone: 'text-emerald-600' },
          { label: 'Riders', value: counts.riders, tone: 'text-slate-600' },
          { label: 'Online hosts', value: onlineHosts, tone: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-semibold ${stat.tone}`}>{stat.value}</div>
              {lastRefreshed ? (
                <div className="mt-2 text-xs text-muted-foreground">Updated {lastRefreshed}</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Transactions matrix</CardTitle>
            <CardDescription>Live counts by status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: 'Total', value: transactionCounts.total },
                { label: 'Pending', value: transactionCounts.pending },
                { label: 'Completed', value: transactionCounts.completed },
                { label: 'Failed', value: transactionCounts.failed },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-input bg-background px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={loadCounts} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh metrics'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Transaction cadence</CardTitle>
            <CardDescription>Completed ride payments over time.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              { label: 'Daily', value: transactionPeriods.daily },
              { label: 'Weekly', value: transactionPeriods.weekly },
              { label: 'Monthly', value: transactionPeriods.monthly },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-input bg-background px-4 py-4 text-center">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>System health</CardTitle>
          <CardDescription>Quick checks for configuration status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge>Pricing config available</Badge>
          <Badge>Demand multipliers active</Badge>
          <Badge>Vehicle types seeded</Badge>
          {error ? <span className="text-sm text-red-500">{error}</span> : null}
          <Button variant="outline" onClick={loadCounts} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh stats'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
