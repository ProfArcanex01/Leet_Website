"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { authFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';

type LearningMaterial = {
  id: number;
  title: string;
  slug: string;
  description: string;
  material_type: 'PDF' | 'IMAGE' | 'VIDEO';
  asset_url: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  material_type: 'PDF' | 'IMAGE' | 'VIDEO';
  asset_url: string;
  thumbnail_url: string;
  duration_seconds: string;
  is_published: boolean;
  sort_order: string;
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  description: '',
  material_type: 'PDF',
  asset_url: '',
  thumbnail_url: '',
  duration_seconds: '',
  is_published: false,
  sort_order: '0',
};

function toFormState(material: LearningMaterial): FormState {
  return {
    title: material.title,
    slug: material.slug,
    description: material.description,
    material_type: material.material_type,
    asset_url: material.asset_url,
    thumbnail_url: material.thumbnail_url || '',
    duration_seconds: material.duration_seconds ? String(material.duration_seconds) : '',
    is_published: material.is_published,
    sort_order: String(material.sort_order),
  };
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminTrainingPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [selectedId, setSelectedId] = useState<number | 'new'>('new');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedId) || null,
    [materials, selectedId],
  );

  const publishedCount = useMemo(
    () => materials.filter((material) => material.is_published).length,
    [materials],
  );

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page_size', '100');
      if (query.trim()) params.set('q', query.trim());
      if (publishedFilter !== 'all') params.set('is_published', publishedFilter);

      const response = await authFetch(`/agents/admin/materials/?${params.toString()}`);
      const payload = (await response.json().catch(() => null)) as Paginated<LearningMaterial> | null;
      if (!response.ok) {
        throw new Error((payload as { detail?: string } | null)?.detail || 'Unable to load training materials.');
      }

      const results = payload?.results || [];
      setMaterials(results);
      if (selectedId !== 'new' && !results.find((material) => material.id === selectedId)) {
        setSelectedId('new');
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load training materials.');
    } finally {
      setLoading(false);
    }
  }, [publishedFilter, query, selectedId]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  function startNewMaterial() {
    setSelectedId('new');
    setForm(emptyForm);
    setError(null);
    setSuccessMessage(null);
  }

  function selectMaterial(material: LearningMaterial) {
    setSelectedId(material.id);
    setForm(toFormState(material));
    setError(null);
    setSuccessMessage(null);
  }

  async function saveMaterial() {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      material_type: form.material_type,
      asset_url: form.asset_url.trim(),
      thumbnail_url: form.thumbnail_url.trim(),
      duration_seconds: form.duration_seconds.trim() ? Number(form.duration_seconds) : null,
      is_published: form.is_published,
      sort_order: Number(form.sort_order || '0'),
    };

    try {
      const isNew = selectedId === 'new';
      const response = await authFetch(
        isNew ? '/agents/admin/materials/' : `/agents/admin/materials/${selectedId}/`,
        {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          (body as { detail?: string } | null)?.detail ||
            (body as Record<string, string[]> | null)?.slug?.[0] ||
            'Unable to save training material.',
        );
      }

      const saved = body as LearningMaterial;
      setSuccessMessage(isNew ? 'Training material created.' : 'Training material updated.');
      setSelectedId(saved.id);
      setForm(toFormState(saved));
      await loadMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save training material.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Loaded materials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{loading ? '—' : materials.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{loading ? '—' : publishedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">{loading ? '—' : materials.length - publishedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Training library</CardTitle>
              <Button onClick={startNewMaterial}>New material</Button>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title"
              />
              <Select value={publishedFilter} onValueChange={(value) => setPublishedFilter(value as 'all' | 'true' | 'false')}>
                <SelectTrigger className="md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Drafts</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => loadMaterials()} disabled={loading}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-[color:var(--stroke)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Loading materials...
                      </TableCell>
                    </TableRow>
                  ) : materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No training materials found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((material) => (
                      <TableRow
                        key={material.id}
                        className={`cursor-pointer ${selectedId === material.id ? 'bg-[color:var(--soft)]/30' : 'hover:bg-[color:var(--soft)]/20'}`}
                        onClick={() => selectMaterial(material)}
                      >
                        <TableCell>
                          <div className="font-medium">{material.title}</div>
                          <div className="text-xs text-muted-foreground">{material.slug}</div>
                        </TableCell>
                        <TableCell>{material.material_type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={material.is_published ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                            {material.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(material.updated_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardHeader>
            <CardTitle>{selectedId === 'new' ? 'Create training material' : 'Edit training material'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => {
                    const nextTitle = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title: nextTitle,
                      slug: current.slug === '' || current.slug === slugify(current.title) ? slugify(nextTitle) : current.slug,
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Material type</Label>
                <Select
                  value={form.material_type}
                  onValueChange={(value) => setForm((current) => ({ ...current, material_type: value as FormState['material_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  value={form.sort_order}
                  inputMode="numeric"
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value.replace(/[^\d]/g, '') || '0' }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assetUrl">Asset URL</Label>
              <Input
                id="assetUrl"
                value={form.asset_url}
                onChange={(event) => setForm((current) => ({ ...current, asset_url: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={form.thumbnail_url}
                  onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="durationSeconds">Duration (seconds)</Label>
                <Input
                  id="durationSeconds"
                  value={form.duration_seconds}
                  inputMode="numeric"
                  onChange={(event) => setForm((current) => ({ ...current, duration_seconds: event.target.value.replace(/[^\d]/g, '') }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
              />
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
              />
              Publish this material
            </label>

            {selectedMaterial ? (
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-white p-4 text-sm text-muted-foreground">
                <p>Published: {formatDate(selectedMaterial.published_at)}</p>
                <p>Updated: {formatDate(selectedMaterial.updated_at)}</p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

            <div className="flex gap-2">
              <Button onClick={saveMaterial} disabled={saving}>
                {saving ? 'Saving...' : selectedId === 'new' ? 'Create material' : 'Save changes'}
              </Button>
              <Button variant="outline" onClick={startNewMaterial}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
