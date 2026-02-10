"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/api';

type AdminUser = {
  id: number;
  phone_number: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: 'HOST' | 'RIDER' | null;
  is_verified: boolean;
  is_active: boolean;
  is_invite_activated?: boolean;
  invited_by?: number | null;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type CytoscapeNode = {
  data: {
    id: string;
    label: string;
    role: string;
    inviteActivated: string;
    root: string;
  };
};

type CytoscapeEdge = {
  data: {
    id: string;
    source: string;
    target: string;
  };
};

declare global {
  interface Window {
    cytoscape?: any;
  }
}

const CYTOSCAPE_CDN_URL = 'https://unpkg.com/cytoscape@3.29.2/dist/cytoscape.min.js';

let cytoscapeLoadPromise: Promise<any> | null = null;

function loadCytoscape(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is unavailable.'));
  }
  if (window.cytoscape) {
    return Promise.resolve(window.cytoscape);
  }
  if (cytoscapeLoadPromise) {
    return cytoscapeLoadPromise;
  }

  cytoscapeLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${CYTOSCAPE_CDN_URL}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.cytoscape));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Cytoscape script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = CYTOSCAPE_CDN_URL;
    script.async = true;
    script.onload = () => resolve(window.cytoscape);
    script.onerror = () => reject(new Error('Failed to load Cytoscape script.'));
    document.head.appendChild(script);
  });

  return cytoscapeLoadPromise;
}

function displayName(user: AdminUser) {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.phone_number || `User ${user.id}`;
}

function collectConnectedUserIds(
  rootUserId: number,
  maxDepth: number,
  usersById: Map<number, AdminUser>,
  inviteesByInviter: Map<number, number[]>
) {
  const visited = new Set<number>();
  const queue: Array<{ id: number; depth: number }> = [{ id: rootUserId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (visited.has(current.id)) continue;
    if (current.depth > maxDepth) continue;

    visited.add(current.id);
    const user = usersById.get(current.id);
    if (!user) continue;

    if (user.invited_by && !visited.has(user.invited_by)) {
      queue.push({ id: user.invited_by, depth: current.depth + 1 });
    }

    const invitees = inviteesByInviter.get(current.id) || [];
    for (const inviteeId of invitees) {
      if (!visited.has(inviteeId)) {
        queue.push({ id: inviteeId, depth: current.depth + 1 });
      }
    }
  }

  return visited;
}

export default function AdminNetworkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const graphContainerRef = useRef<HTMLDivElement | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [depth, setDepth] = useState('2');

  useEffect(() => {
    let cancelled = false;

    const initialUser = searchParams.get('user');
    if (initialUser) {
      const parsed = Number(initialUser);
      if (!Number.isNaN(parsed)) {
        setSelectedUserId(parsed);
      }
    }

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const aggregated: AdminUser[] = [];
        let page = 1;
        while (true) {
          const response = await authFetch(`/accounts/admin/users/?page=${page}&page_size=100`);
          const payload = (await response.json().catch(() => ({}))) as Paginated<AdminUser>;
          if (!response.ok) {
            throw new Error((payload as any)?.detail || (payload as any)?.error || 'Unable to load users.');
          }

          aggregated.push(...(payload.results || []));
          if (!payload.next) break;
          page += 1;
        }

        if (cancelled) return;
        setUsers(aggregated);
        if (!selectedUserId && aggregated.length > 0) {
          setSelectedUserId(aggregated[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unable to load users.';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        (user.email || '').toLowerCase().includes(normalized) ||
        user.phone_number.toLowerCase().includes(normalized) ||
        String(user.id).includes(normalized)
      );
    });
  }, [users, query]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const graphElements = useMemo(() => {
    if (!selectedUserId) return { nodes: [] as CytoscapeNode[], edges: [] as CytoscapeEdge[] };

    const usersById = new Map<number, AdminUser>(users.map((user) => [user.id, user]));
    const inviteesByInviter = new Map<number, number[]>();
    for (const user of users) {
      if (!user.invited_by) continue;
      const current = inviteesByInviter.get(user.invited_by) || [];
      current.push(user.id);
      inviteesByInviter.set(user.invited_by, current);
    }

    const parsedDepth = Number(depth);
    const maxDepth = Number.isNaN(parsedDepth) ? 2 : parsedDepth;
    const userIds = collectConnectedUserIds(selectedUserId, maxDepth, usersById, inviteesByInviter);

    const nodes: CytoscapeNode[] = [];
    const edges: CytoscapeEdge[] = [];

    for (const userId of userIds) {
      const user = usersById.get(userId);
      if (!user) continue;
      nodes.push({
        data: {
          id: String(user.id),
          label: `${displayName(user)}\n#${user.id}`,
          role: user.user_type || 'UNKNOWN',
          inviteActivated: user.is_invite_activated ? 'yes' : 'no',
          root: user.id === selectedUserId ? 'yes' : 'no',
        },
      });
    }

    for (const userId of userIds) {
      const user = usersById.get(userId);
      if (!user?.invited_by) continue;
      if (!userIds.has(user.invited_by)) continue;
      edges.push({
        data: {
          id: `${user.invited_by}-${user.id}`,
          source: String(user.invited_by),
          target: String(user.id),
        },
      });
    }

    return { nodes, edges };
  }, [users, selectedUserId, depth]);

  useEffect(() => {
    if (!graphContainerRef.current) return;
    if (!selectedUserId) return;
    if (graphElements.nodes.length === 0) return;

    let disposed = false;
    let cyInstance: any = null;
    setGraphLoading(true);

    loadCytoscape()
      .then((cytoscape) => {
        if (disposed || !graphContainerRef.current) return;

        cyInstance = cytoscape({
          container: graphContainerRef.current,
          elements: [...graphElements.nodes, ...graphElements.edges],
          style: [
            {
              selector: 'node',
              style: {
                label: 'data(label)',
                'text-wrap': 'wrap',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': 11,
                color: '#111827',
                width: 72,
                height: 72,
                'background-color': '#dbe4dc',
                'border-width': 2,
                'border-color': '#7e8d83',
              },
            },
            {
              selector: 'node[role = "HOST"]',
              style: { 'background-color': '#f4c7a1', 'border-color': '#d77f45' },
            },
            {
              selector: 'node[role = "RIDER"]',
              style: { 'background-color': '#c9d9cc', 'border-color': '#5f7867' },
            },
            {
              selector: 'node[root = "yes"]',
              style: { 'border-width': 4, 'border-color': '#111827', width: 86, height: 86 },
            },
            {
              selector: 'node[inviteActivated = "no"]',
              style: { 'background-color': '#fde68a', 'border-color': '#d97706' },
            },
            {
              selector: 'edge',
              style: {
                width: 2.5,
                'line-color': '#6b7280',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#6b7280',
                'curve-style': 'bezier',
              },
            },
          ],
          layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 30,
            spacingFactor: 1.25,
            roots: [String(selectedUserId)],
          },
        });

        cyInstance.on('tap', 'node', (event: any) => {
          const nextId = Number(event.target.id());
          if (!Number.isNaN(nextId)) {
            setSelectedUserId(nextId);
            router.replace(`/admin/network?user=${nextId}`);
          }
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load graph renderer.');
      })
      .finally(() => {
        if (!disposed) setGraphLoading(false);
      });

    return () => {
      disposed = true;
      if (cyInstance) {
        cyInstance.destroy();
      }
    };
  }, [graphElements, selectedUserId, router]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Invite Network</CardTitle>
          <CardDescription>
            Visualize inviter to invitee relationships. Click a node to center graph on that user.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="network-user-search">Find user</Label>
            <Input
              id="network-user-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, phone, email, or ID"
            />
          </div>
          <div className="space-y-2">
            <Label>Selected user</Label>
            <Select
              value={selectedUserId ? String(selectedUserId) : ''}
              onValueChange={(value) => {
                const nextId = Number(value);
                if (!Number.isNaN(nextId)) {
                  setSelectedUserId(nextId);
                  router.replace(`/admin/network?user=${nextId}`);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading users...' : 'Select user'} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {displayName(user)} ({user.phone_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hop</SelectItem>
                <SelectItem value="2">2 hops</SelectItem>
                <SelectItem value="3">3 hops</SelectItem>
                <SelectItem value="4">4 hops</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Nodes: {graphElements.nodes.length}</Badge>
            <Badge variant="outline">Edges: {graphElements.edges.length}</Badge>
            {selectedUser ? (
              <Badge variant="outline">
                Focus: {displayName(selectedUser)} (#{selectedUser.id})
              </Badge>
            ) : null}
            <Button variant="outline" onClick={() => router.push('/admin/users')}>
              Back to users
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="relative h-[70vh] w-full rounded-b-2xl bg-white">
            <div ref={graphContainerRef} className="h-full w-full" />
            {loading || graphLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-muted-foreground">
                Rendering network...
              </div>
            ) : null}
            {!loading && graphElements.nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No connected invite relationships found for this selection.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-red-500">{error}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
