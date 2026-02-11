"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');

  const pageSize = 20;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  const loadEntries = useCallback(async (overrides?: { page?: number; query?: string }) => {
    setLoading(true);
    setError(null);

    const p = overrides?.page ?? page;
    const q = overrides?.query ?? query;

    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('page_size', String(pageSize));
    if (q.trim()) params.set('search', q.trim());

    try {
      const res = await authFetch(`/waitlist/admin/?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Unable to load waitlist entries.');
      }
      const payload = (await res.json()) as Paginated<WaitlistEntry>;
      setEntries(payload.results || []);
      setCount(payload.count || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    loadEntries();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadEntries({ page: 1 });
  }

  function handleReset() {
    setQuery('');
    setPage(1);
    loadEntries({ page: 1, query: '' });
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this email from the waitlist?')) return;

    try {
      const res = await authFetch(`/waitlist/admin/${id}/`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete entry.');
      }
      loadEntries();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function handleExport() {
    try {
      const res = await authFetch('/waitlist/admin/export/');
      if (!res.ok) throw new Error('Export failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waitlist.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total signups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? '—' : count}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExport} disabled={count === 0}>
              Export CSV
            </Button>
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
            <Button variant="outline" onClick={() => loadEntries()}>
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
                <TableHead>Signed up</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                    No waitlist entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="pl-6 font-medium">{entry.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('en-GB', {
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
                        onClick={() => handleDelete(entry.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
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
