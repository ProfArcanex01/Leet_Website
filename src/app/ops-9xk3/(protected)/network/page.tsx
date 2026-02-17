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
  const graphFrameRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<any>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [graphSearch, setGraphSearch] = useState('');
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [layoutName, setLayoutName] = useState<'breadthfirst' | 'cose' | 'circle'>('breadthfirst');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
            {
              selector: '.is-dim',
              style: {
                opacity: 0.2,
              },
            },
            {
              selector: 'node.is-match',
              style: {
                'border-color': '#2563eb',
                'border-width': 4,
              },
            },
            {
              selector: 'node.is-selected-match',
              style: {
                'overlay-color': '#93c5fd',
                'overlay-opacity': 0.25,
              },
            },
          ],
          layout:
            layoutName === 'breadthfirst'
              ? {
                  name: 'breadthfirst',
                  directed: true,
                  padding: 30,
                  spacingFactor: 1.25,
                  roots: [String(selectedUserId)],
                }
              : layoutName === 'cose'
                ? { name: 'cose', animate: false, padding: 30, fit: true }
                : { name: 'circle', animate: false, padding: 35, fit: true },
        });
        cyRef.current = cyInstance;

        cyInstance.on('tap', 'node', (event: any) => {
          const nextId = Number(event.target.id());
          if (!Number.isNaN(nextId)) {
            setSelectedUserId(nextId);
            router.replace(`/ops-9xk3/network?user=${nextId}`);
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
      cyRef.current = null;
    };
  }, [graphElements, selectedUserId, router, layoutName]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === graphFrameRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const normalized = graphSearch.trim().toLowerCase();
    cy.elements().removeClass('is-dim is-match is-selected-match');

    if (!normalized) {
      setMatchIds([]);
      setActiveMatchIndex(0);
      return;
    }

    const matches = cy
      .nodes()
      .filter((node: any) => {
        const label = String(node.data('label') || '').toLowerCase();
        const id = String(node.id()).toLowerCase();
        return label.includes(normalized) || id.includes(normalized);
      })
      .toArray();

    const ids = matches.map((node: any) => String(node.id()));
    setMatchIds(ids);
    setActiveMatchIndex(0);

    if (ids.length === 0) {
      return;
    }

    cy.elements().addClass('is-dim');
    matches.forEach((node: any) => {
      node.removeClass('is-dim');
      node.connectedEdges().removeClass('is-dim');
      node.neighborhood().removeClass('is-dim');
      node.addClass('is-match');
    });

    const first = matches[0];
    first.addClass('is-selected-match');
    cy.animate({ center: { eles: first }, duration: 220 });
  }, [graphSearch, graphElements]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || matchIds.length === 0) return;

    cy.nodes().removeClass('is-selected-match');
    const currentId = matchIds[((activeMatchIndex % matchIds.length) + matchIds.length) % matchIds.length];
    const node = cy.getElementById(currentId);
    if (!node || node.empty()) return;
    node.addClass('is-selected-match');
    cy.animate({ center: { eles: node }, duration: 180 });
  }, [activeMatchIndex, matchIds]);

  const zoomIn = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: Math.min(2.5, cy.zoom() * 1.2), renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const zoomOut = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: Math.max(0.2, cy.zoom() / 1.2), renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const fitGraph = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.fit(cy.elements(), 30);
  };

  const centerOnSelected = () => {
    const cy = cyRef.current;
    if (!cy || !selectedUserId) return;
    const node = cy.getElementById(String(selectedUserId));
    if (!node || node.empty()) return;
    cy.animate({ center: { eles: node }, duration: 200 });
  };

  const rerunLayout = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const layout =
      layoutName === 'breadthfirst'
        ? { name: 'breadthfirst', directed: true, padding: 30, spacingFactor: 1.25, roots: [String(selectedUserId)] }
        : layoutName === 'cose'
          ? { name: 'cose', animate: true, animationDuration: 250, padding: 30, fit: true }
          : { name: 'circle', animate: true, animationDuration: 250, padding: 35, fit: true };
    cy.layout(layout as any).run();
  };

  const toggleFullscreen = async () => {
    if (!graphFrameRef.current || typeof document === 'undefined') return;
    if (document.fullscreenElement === graphFrameRef.current) {
      await document.exitFullscreen();
      return;
    }
    await graphFrameRef.current.requestFullscreen();
  };

  const goToPrevMatch = () => {
    setActiveMatchIndex((prev) => (prev - 1 + Math.max(matchIds.length, 1)) % Math.max(matchIds.length, 1));
  };

  const goToNextMatch = () => {
    setActiveMatchIndex((prev) => (prev + 1) % Math.max(matchIds.length, 1));
  };

  const stepDepth = (direction: 'up' | 'down') => {
    const current = Number(depth);
    const safeCurrent = Number.isNaN(current) ? 2 : current;
    const next = direction === 'up' ? Math.min(4, safeCurrent + 1) : Math.max(1, safeCurrent - 1);
    setDepth(String(next));
  };

  const cycleLayout = () => {
    setLayoutName((current) => {
      if (current === 'breadthfirst') return 'cose';
      if (current === 'cose') return 'circle';
      return 'breadthfirst';
    });
  };

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
                  router.replace(`/ops-9xk3/network?user=${nextId}`);
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
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select value={layoutName} onValueChange={(value) => setLayoutName(value as 'breadthfirst' | 'cose' | 'circle')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breadthfirst">Tree</SelectItem>
                <SelectItem value="cose">Force</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="network-node-search">Search in graph</Label>
            <div className="flex gap-2">
              <Input
                id="network-node-search"
                value={graphSearch}
                onChange={(event) => setGraphSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && matchIds.length > 0) {
                    setActiveMatchIndex((prev) => (prev + 1) % matchIds.length);
                  }
                }}
                placeholder="Highlight nodes by name or ID"
              />
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevMatch}
                disabled={matchIds.length === 0}
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextMatch}
                disabled={matchIds.length === 0}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Nodes: {graphElements.nodes.length}</Badge>
            <Badge variant="outline">Edges: {graphElements.edges.length}</Badge>
            <Badge variant="outline">
              Matches: {matchIds.length === 0 ? '0' : `${activeMatchIndex + 1}/${matchIds.length}`}
            </Badge>
            {selectedUser ? (
              <Badge variant="outline">
                Focus: {displayName(selectedUser)} (#{selectedUser.id})
              </Badge>
            ) : null}
            <Button variant="outline" onClick={zoomOut} disabled={graphLoading}>
              Zoom out
            </Button>
            <Button variant="outline" onClick={zoomIn} disabled={graphLoading}>
              Zoom in
            </Button>
            <Button variant="outline" onClick={fitGraph} disabled={graphLoading}>
              Fit
            </Button>
            <Button variant="outline" onClick={centerOnSelected} disabled={graphLoading}>
              Center selected
            </Button>
            <Button variant="outline" onClick={rerunLayout} disabled={graphLoading}>
              Re-layout
            </Button>
            <Button variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/ops-9xk3/users')}>
              Back to users
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div
            ref={graphFrameRef}
            className={`relative w-full bg-white ${isFullscreen ? 'h-screen rounded-none' : 'h-[70vh] rounded-b-2xl'}`}
          >
            <div ref={graphContainerRef} className="h-full w-full" />
            <div className="pointer-events-none absolute left-3 top-3 z-20 w-[min(640px,calc(100%-1.5rem))]">
              <div className="pointer-events-auto rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Nodes: {graphElements.nodes.length}</Badge>
                  <Badge variant="outline">Edges: {graphElements.edges.length}</Badge>
                  <Badge variant="outline">
                    Matches: {matchIds.length === 0 ? '0' : `${activeMatchIndex + 1}/${matchIds.length}`}
                  </Badge>
                  {selectedUser ? <Badge variant="outline">Focus #{selectedUser.id}</Badge> : null}
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Input
                    value={graphSearch}
                    onChange={(event) => setGraphSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && matchIds.length > 0) {
                        goToNextMatch();
                      }
                    }}
                    placeholder="Search nodes..."
                    className="max-w-xs bg-white"
                  />
                  <Button type="button" variant="outline" onClick={goToPrevMatch} disabled={matchIds.length === 0}>
                    Prev
                  </Button>
                  <Button type="button" variant="outline" onClick={goToNextMatch} disabled={matchIds.length === 0}>
                    Next
                  </Button>
                  <Button type="button" variant="outline" onClick={centerOnSelected} disabled={graphLoading}>
                    Center
                  </Button>
                  <Button type="button" variant="outline" onClick={toggleFullscreen}>
                    {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={zoomOut} disabled={graphLoading}>
                    -
                  </Button>
                  <Button type="button" variant="outline" onClick={zoomIn} disabled={graphLoading}>
                    +
                  </Button>
                  <Button type="button" variant="outline" onClick={fitGraph} disabled={graphLoading}>
                    Fit
                  </Button>
                  <Button type="button" variant="outline" onClick={rerunLayout} disabled={graphLoading}>
                    Re-layout
                  </Button>
                  <Button type="button" variant="outline" onClick={cycleLayout} disabled={graphLoading}>
                    Layout: {layoutName === 'breadthfirst' ? 'Tree' : layoutName === 'cose' ? 'Force' : 'Circle'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => stepDepth('down')} disabled={graphLoading}>
                    Depth -
                  </Button>
                  <Button type="button" variant="outline" onClick={() => stepDepth('up')} disabled={graphLoading}>
                    Depth + ({depth})
                  </Button>
                </div>
              </div>
            </div>
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
