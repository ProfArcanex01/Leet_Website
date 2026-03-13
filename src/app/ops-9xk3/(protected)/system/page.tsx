"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Info } from 'lucide-react';
import { authFetch } from '@/lib/api';

type Region = {
  id: number;
  name: string;
  center_latitude: string;
  center_longitude: string;
  radius: string;
};

type PricingParameters = {
  id: number;
  region: number;
  region_name: string;
  base_fare: string;
  distance_rate: string;
  time_rate: string;
  booking_fee: string;
  minimum_fare: string;
  currency: string;
  min_multiplier: string;
  max_multiplier: string;
  min_absolute: string;
  max_absolute: string;
  round_to: string;
  floor_min_price: string;
  effective_from: string;
  effective_to: string | null;
};

type DemandMultiplier = {
  id: number;
  region: number;
  region_name: string;
  day_of_week: number;
  day_name: string;
  time_start: string;
  time_end: string;
  multiplier: string;
  description: string;
};

type VehicleRate = {
  id: number;
  vehicle_type: string;
  vehicle_type_display: string;
  multiplier: string;
  description: string;
};

type AppVersionPolicy = {
  id: number;
  platform: 'IOS' | 'ANDROID';
  channel: 'production' | 'preview';
  latest_version: string;
  minimum_supported_version: string;
  latest_build_number: number | null;
  minimum_supported_build_number: number | null;
  update_mode_default: 'NONE' | 'SOFT' | 'HARD';
  soft_title: string;
  soft_message: string;
  hard_title: string;
  hard_message: string;
  store_url: string;
  ota_enabled: boolean;
  maintenance_enabled: boolean;
  maintenance_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const days = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const vehicleTypes = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'ECONOMY', label: 'Economy' },
];

const appPlatforms = [
  { value: 'IOS', label: 'iOS' },
  { value: 'ANDROID', label: 'Android' },
];

const releaseChannels = [
  { value: 'production', label: 'Production' },
  { value: 'preview', label: 'Preview' },
];

const updateModes = [
  { value: 'NONE', label: 'None' },
  { value: 'SOFT', label: 'Soft' },
  { value: 'HARD', label: 'Hard' },
];

const pricingGuide = {
  region: 'Pricing region this rule applies to.',
  base_fare: 'Flat starting fee added to every ride.',
  distance_rate: 'Per-kilometer charge added based on trip distance.',
  time_rate: 'Per-minute charge based on estimated duration.',
  booking_fee: 'Additional platform fee added to the fare.',
  minimum_fare: 'Minimum fare enforced after all calculations.',
  min_multiplier: 'Lowest multiplier used when calculating the allowed price range.',
  max_multiplier: 'Highest multiplier used when calculating the allowed price range.',
  min_absolute: 'Minimum width of the allowed price range.',
  max_absolute: 'Maximum width of the allowed price range.',
  round_to: 'Round the range bounds to this increment (e.g., 1.00).',
  floor_min_price: 'Absolute minimum price floor. If 0, minimum fare is used.',
  currency: 'Currency code used for display and storage (e.g., GHS).',
  effective_from: 'When these pricing rules become active.',
  effective_to: 'Optional end time for these pricing rules.',
};

export default function AdminSystemPage() {
  const didInitialLoadRef = useRef(false);
  const [tab, setTab] = useState('regions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [pricing, setPricing] = useState<PricingParameters[]>([]);
  const [demand, setDemand] = useState<DemandMultiplier[]>([]);
  const [vehicleRates, setVehicleRates] = useState<VehicleRate[]>([]);
  const [appPolicies, setAppPolicies] = useState<AppVersionPolicy[]>([]);

  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionForm, setRegionForm] = useState({ name: '', center_latitude: '', center_longitude: '', radius: '' });

  const [editingPricing, setEditingPricing] = useState<PricingParameters | null>(null);
  const [pricingForm, setPricingForm] = useState({
    region: '',
    base_fare: '',
    distance_rate: '',
    time_rate: '',
    booking_fee: '',
    minimum_fare: '',
    currency: 'GHS',
    min_multiplier: '',
    max_multiplier: '',
    min_absolute: '',
    max_absolute: '',
    round_to: '',
    floor_min_price: '',
    effective_from: '',
    effective_to: '',
  });

  const [editingDemand, setEditingDemand] = useState<DemandMultiplier | null>(null);
  const [demandForm, setDemandForm] = useState({
    region: '',
    day_of_week: '',
    time_start: '',
    time_end: '',
    multiplier: '',
    description: '',
  });

  const [editingVehicle, setEditingVehicle] = useState<VehicleRate | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_type: '',
    multiplier: '',
    description: '',
  });
  const [editingPolicy, setEditingPolicy] = useState<AppVersionPolicy | null>(null);
  const [policyForm, setPolicyForm] = useState({
    platform: 'IOS',
    channel: 'production',
    latest_version: '',
    minimum_supported_version: '',
    latest_build_number: '',
    minimum_supported_build_number: '',
    update_mode_default: 'NONE',
    soft_title: '',
    soft_message: '',
    hard_title: '',
    hard_message: '',
    store_url: '',
    ota_enabled: 'false',
    maintenance_enabled: 'false',
    maintenance_message: '',
    is_active: 'true',
  });

  const regionOptions = useMemo(() => regions.map((region) => ({ value: String(region.id), label: region.name })), [regions]);

  const resetPolicyForm = () => {
    setEditingPolicy(null);
    setPolicyForm({
      platform: 'IOS',
      channel: 'production',
      latest_version: '',
      minimum_supported_version: '',
      latest_build_number: '',
      minimum_supported_build_number: '',
      update_mode_default: 'NONE',
      soft_title: '',
      soft_message: '',
      hard_title: '',
      hard_message: '',
      store_url: '',
      ota_enabled: 'false',
      maintenance_enabled: 'false',
      maintenance_message: '',
      is_active: 'true',
    });
  };

  const renderLabel = (key: keyof typeof pricingGuide, label: string) => (
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${label} info`}
            className="rounded-full border border-input bg-background p-1 transition hover:bg-muted"
          >
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <span>{pricingGuide[key]}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const loadPolicies = async () => {
    const response = await authFetch('/accounts/admin/app-version-policies/');
    const data = await response.json().catch(() => ([]));
    if (!response.ok) {
      throw new Error((data as any)?.detail || (data as any)?.error || 'Unable to load app update policies.');
    }
    setAppPolicies(Array.isArray(data) ? data : []);
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsRes, pricingRes, demandRes, vehicleRes, policiesRes] = await Promise.all([
        authFetch('/fares/admin/regions/'),
        authFetch('/fares/admin/pricing/'),
        authFetch('/fares/admin/demand-multipliers/'),
        authFetch('/fares/admin/vehicle-rates/'),
        authFetch('/accounts/admin/app-version-policies/'),
      ]);
      const regionsData = await regionsRes.json().catch(() => ([]));
      const pricingData = await pricingRes.json().catch(() => ([]));
      const demandData = await demandRes.json().catch(() => ([]));
      const vehicleData = await vehicleRes.json().catch(() => ([]));
      const policiesData = await policiesRes.json().catch(() => ([]));
      if (!regionsRes.ok) throw new Error(regionsData?.detail || regionsData?.error || 'Unable to load regions.');
      if (!policiesRes.ok) throw new Error((policiesData as any)?.detail || (policiesData as any)?.error || 'Unable to load app update policies.');
      setRegions(regionsData);
      setPricing(pricingRes.ok ? pricingData : []);
      setDemand(demandRes.ok ? demandData : []);
      setVehicleRates(vehicleRes.ok ? vehicleData : []);
      setAppPolicies(Array.isArray(policiesData) ? policiesData : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load configuration.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadAll();
  }, []);

  const saveRegion = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...regionForm };
      const response = await authFetch(
        editingRegion ? `/fares/admin/regions/${editingRegion.id}/` : '/fares/admin/regions/',
        {
          method: editingRegion ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.error || 'Unable to save region.');
      setEditingRegion(null);
      setRegionForm({ name: '', center_latitude: '', center_longitude: '', radius: '' });
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save region.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const savePricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...pricingForm,
        region: Number(pricingForm.region),
        effective_to: pricingForm.effective_to || null,
      };
      const response = await authFetch(
        editingPricing ? `/fares/admin/pricing/${editingPricing.id}/` : '/fares/admin/pricing/',
        {
          method: editingPricing ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.error || 'Unable to save pricing parameters.');
      setEditingPricing(null);
      setPricingForm({
        region: '',
        base_fare: '',
        distance_rate: '',
        time_rate: '',
        booking_fee: '',
        minimum_fare: '',
        currency: 'GHS',
        min_multiplier: '',
        max_multiplier: '',
        min_absolute: '',
        max_absolute: '',
        round_to: '',
        floor_min_price: '',
        effective_from: '',
        effective_to: '',
      });
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save pricing parameters.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const saveDemand = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...demandForm,
        region: Number(demandForm.region),
        day_of_week: Number(demandForm.day_of_week),
      };
      const response = await authFetch(
        editingDemand ? `/fares/admin/demand-multipliers/${editingDemand.id}/` : '/fares/admin/demand-multipliers/',
        {
          method: editingDemand ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.error || 'Unable to save demand multiplier.');
      setEditingDemand(null);
      setDemandForm({ region: '', day_of_week: '', time_start: '', time_end: '', multiplier: '', description: '' });
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save demand multiplier.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const saveVehicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...vehicleForm };
      const response = await authFetch(
        editingVehicle ? `/fares/admin/vehicle-rates/${editingVehicle.id}/` : '/fares/admin/vehicle-rates/',
        {
          method: editingVehicle ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.detail || data?.error || 'Unable to save vehicle rate.');
      setEditingVehicle(null);
      setVehicleForm({ vehicle_type: '', multiplier: '', description: '' });
      await loadAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save vehicle rate.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const savePolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...policyForm,
        latest_build_number: policyForm.latest_build_number ? Number(policyForm.latest_build_number) : null,
        minimum_supported_build_number: policyForm.minimum_supported_build_number
          ? Number(policyForm.minimum_supported_build_number)
          : null,
        ota_enabled: policyForm.ota_enabled === 'true',
        maintenance_enabled: policyForm.maintenance_enabled === 'true',
        is_active: policyForm.is_active === 'true',
      };

      const response = await authFetch(
        editingPolicy
          ? `/accounts/admin/app-version-policies/${editingPolicy.id}/`
          : '/accounts/admin/app-version-policies/',
        {
          method: editingPolicy ? 'PATCH' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as any)?.detail || (data as any)?.error || 'Unable to save app update policy.');
      }
      resetPolicyForm();
      await loadPolicies();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save app update policy.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async () => {
    if (!editingPolicy) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/accounts/admin/app-version-policies/${editingPolicy.id}/`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any)?.detail || (data as any)?.error || 'Unable to delete app update policy.');
      }
      resetPolicyForm();
      await loadPolicies();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete app update policy.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>System configuration</CardTitle>
          <CardDescription>Update pricing rules and regional settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh data'}
          </Button>
          {error ? <span className="text-sm text-red-500">{error}</span> : null}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle rates</TabsTrigger>
          <TabsTrigger value="app-updates">App updates</TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Regions</CardTitle>
                <CardDescription>Manage geographic pricing zones.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Radius (km)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region) => (
                      <TableRow
                        key={region.id}
                        onClick={() => {
                          setEditingRegion(region);
                          setRegionForm({
                            name: region.name,
                            center_latitude: region.center_latitude,
                            center_longitude: region.center_longitude,
                            radius: region.radius,
                          });
                        }}
                      >
                        <TableCell className="font-semibold">{region.name}</TableCell>
                        <TableCell>
                          {region.center_latitude}, {region.center_longitude}
                        </TableCell>
                        <TableCell>{region.radius}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>{editingRegion ? 'Edit region' : 'New region'}</CardTitle>
                <CardDescription>Set the map center and radius.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={regionForm.name} onChange={(e) => setRegionForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Center latitude</Label>
                  <Input
                    value={regionForm.center_latitude}
                    onChange={(e) => setRegionForm((p) => ({ ...p, center_latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Center longitude</Label>
                  <Input
                    value={regionForm.center_longitude}
                    onChange={(e) => setRegionForm((p) => ({ ...p, center_longitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Radius (km)</Label>
                  <Input value={regionForm.radius} onChange={(e) => setRegionForm((p) => ({ ...p, radius: e.target.value }))} />
                </div>
                <Button onClick={saveRegion} disabled={loading}>
                  {loading ? 'Saving...' : editingRegion ? 'Save region' : 'Create region'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Pricing parameters</CardTitle>
                <CardDescription>Base fare, multipliers, and price floors.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Base fare</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Min fare</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricing.map((item) => (
                      <TableRow
                        key={item.id}
                        onClick={() => {
                          setEditingPricing(item);
                          setPricingForm({
                            region: String(item.region),
                            base_fare: item.base_fare,
                            distance_rate: item.distance_rate,
                            time_rate: item.time_rate,
                            booking_fee: item.booking_fee,
                            minimum_fare: item.minimum_fare,
                            currency: item.currency,
                            min_multiplier: item.min_multiplier,
                            max_multiplier: item.max_multiplier,
                            min_absolute: item.min_absolute,
                            max_absolute: item.max_absolute,
                            round_to: item.round_to,
                            floor_min_price: item.floor_min_price,
                            effective_from: item.effective_from?.slice(0, 16) || '',
                            effective_to: item.effective_to ? item.effective_to.slice(0, 16) : '',
                          });
                        }}
                      >
                        <TableCell className="font-semibold">{item.region_name}</TableCell>
                        <TableCell>{item.base_fare}</TableCell>
                        <TableCell>{item.distance_rate}</TableCell>
                        <TableCell>{item.minimum_fare}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{editingPricing ? 'Edit pricing' : 'New pricing'}</CardTitle>
                    <CardDescription>Assign a region and effective dates.</CardDescription>
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        Pricing guide
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg">
                      <SheetHeader>
                        <SheetTitle>Pricing guide</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                        <p>
                          Fare estimate formula:
                        </p>
                        <div className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground">
                          base_fare + (distance_rate × distance) + (time_rate × duration) + booking_fee
                        </div>
                        <p>
                          The allowed price range is computed using min/max multipliers and absolute bounds.
                          Use the field tooltips for quick explanations.
                        </p>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {renderLabel('region', 'Region')}
                  <Select
                    value={pricingForm.region || 'none'}
                    onValueChange={(value) =>
                      setPricingForm((p) => ({ ...p, region: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select region</SelectItem>
                      {regionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['base_fare', 'Base fare', 'base_fare'],
                    ['distance_rate', 'Distance rate', 'distance_rate'],
                    ['time_rate', 'Time rate', 'time_rate'],
                    ['booking_fee', 'Booking fee', 'booking_fee'],
                    ['minimum_fare', 'Minimum fare', 'minimum_fare'],
                    ['min_multiplier', 'Min multiplier', 'min_multiplier'],
                    ['max_multiplier', 'Max multiplier', 'max_multiplier'],
                    ['min_absolute', 'Min absolute', 'min_absolute'],
                    ['max_absolute', 'Max absolute', 'max_absolute'],
                    ['round_to', 'Round to', 'round_to'],
                    ['floor_min_price', 'Floor min price', 'floor_min_price'],
                  ].map(([key, label, guideKey]) => (
                    <div key={key}>
                      {renderLabel(guideKey as keyof typeof pricingGuide, label)}
                      <Input
                        value={(pricingForm as any)[key]}
                        onChange={(e) => setPricingForm((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {renderLabel('currency', 'Currency')}
                    <Input
                      value={pricingForm.currency}
                      onChange={(e) => setPricingForm((p) => ({ ...p, currency: e.target.value }))}
                    />
                  </div>
                  <div>
                    {renderLabel('effective_from', 'Effective from')}
                    <Input
                      type="datetime-local"
                      value={pricingForm.effective_from}
                      onChange={(e) => setPricingForm((p) => ({ ...p, effective_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    {renderLabel('effective_to', 'Effective to (optional)')}
                    <Input
                      type="datetime-local"
                      value={pricingForm.effective_to}
                      onChange={(e) => setPricingForm((p) => ({ ...p, effective_to: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={savePricing} disabled={loading}>
                  {loading ? 'Saving...' : editingPricing ? 'Save pricing' : 'Create pricing'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demand">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Demand multipliers</CardTitle>
                <CardDescription>Time-based surge configuration.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Multiplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demand.map((item) => (
                      <TableRow
                        key={item.id}
                        onClick={() => {
                          setEditingDemand(item);
                          setDemandForm({
                            region: String(item.region),
                            day_of_week: String(item.day_of_week),
                            time_start: item.time_start,
                            time_end: item.time_end,
                            multiplier: item.multiplier,
                            description: item.description || '',
                          });
                        }}
                      >
                        <TableCell className="font-semibold">{item.region_name}</TableCell>
                        <TableCell>{item.day_name}</TableCell>
                        <TableCell>
                          {item.time_start} - {item.time_end}
                        </TableCell>
                        <TableCell>{item.multiplier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>{editingDemand ? 'Edit multiplier' : 'New multiplier'}</CardTitle>
                <CardDescription>Choose day, time, and multiplier.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Region</Label>
                  <Select
                    value={demandForm.region || 'none'}
                    onValueChange={(value) =>
                      setDemandForm((p) => ({ ...p, region: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select region</SelectItem>
                      {regionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Day of week</Label>
                  <Select
                    value={demandForm.day_of_week || 'none'}
                    onValueChange={(value) =>
                      setDemandForm((p) => ({ ...p, day_of_week: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select day</SelectItem>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Start time</Label>
                    <Input
                      type="time"
                      value={demandForm.time_start}
                      onChange={(e) => setDemandForm((p) => ({ ...p, time_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>End time</Label>
                    <Input
                      type="time"
                      value={demandForm.time_end}
                      onChange={(e) => setDemandForm((p) => ({ ...p, time_end: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Multiplier</Label>
                  <Input
                    value={demandForm.multiplier}
                    onChange={(e) => setDemandForm((p) => ({ ...p, multiplier: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={demandForm.description}
                    onChange={(e) => setDemandForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <Button onClick={saveDemand} disabled={loading}>
                  {loading ? 'Saving...' : editingDemand ? 'Save multiplier' : 'Create multiplier'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Vehicle rates</CardTitle>
                <CardDescription>Multipliers by vehicle type.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleRates.map((item) => (
                      <TableRow
                        key={item.id}
                        onClick={() => {
                          setEditingVehicle(item);
                          setVehicleForm({
                            vehicle_type: item.vehicle_type,
                            multiplier: item.multiplier,
                            description: item.description || '',
                          });
                        }}
                      >
                        <TableCell className="font-semibold">{item.vehicle_type_display}</TableCell>
                        <TableCell>{item.multiplier}</TableCell>
                        <TableCell>{item.description || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>{editingVehicle ? 'Edit vehicle rate' : 'New vehicle rate'}</CardTitle>
                <CardDescription>Control pricing by vehicle class.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Vehicle type</Label>
                  <Select
                    value={vehicleForm.vehicle_type || 'none'}
                    onValueChange={(value) =>
                      setVehicleForm((p) => ({ ...p, vehicle_type: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select type</SelectItem>
                      {vehicleTypes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Multiplier</Label>
                  <Input
                    value={vehicleForm.multiplier}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, multiplier: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={vehicleForm.description}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <Button onClick={saveVehicle} disabled={loading}>
                  {loading ? 'Saving...' : editingVehicle ? 'Save vehicle rate' : 'Create vehicle rate'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="app-updates">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>App update policies</CardTitle>
                <CardDescription>Control soft and hard updates for iOS and Android.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Latest</TableHead>
                      <TableHead>Minimum</TableHead>
                      <TableHead>Default mode</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appPolicies.map((policy) => (
                      <TableRow
                        key={policy.id}
                        onClick={() => {
                          setEditingPolicy(policy);
                          setPolicyForm({
                            platform: policy.platform,
                            channel: policy.channel,
                            latest_version: policy.latest_version,
                            minimum_supported_version: policy.minimum_supported_version,
                            latest_build_number: policy.latest_build_number?.toString() ?? '',
                            minimum_supported_build_number: policy.minimum_supported_build_number?.toString() ?? '',
                            update_mode_default: policy.update_mode_default,
                            soft_title: policy.soft_title || '',
                            soft_message: policy.soft_message || '',
                            hard_title: policy.hard_title || '',
                            hard_message: policy.hard_message || '',
                            store_url: policy.store_url || '',
                            ota_enabled: String(policy.ota_enabled),
                            maintenance_enabled: String(policy.maintenance_enabled),
                            maintenance_message: policy.maintenance_message || '',
                            is_active: String(policy.is_active),
                          });
                        }}
                      >
                        <TableCell className="font-semibold">{policy.platform}</TableCell>
                        <TableCell>{policy.channel}</TableCell>
                        <TableCell>
                          {policy.latest_version}
                          {policy.latest_build_number ? ` (${policy.latest_build_number})` : ''}
                        </TableCell>
                        <TableCell>
                          {policy.minimum_supported_version}
                          {policy.minimum_supported_build_number ? ` (${policy.minimum_supported_build_number})` : ''}
                        </TableCell>
                        <TableCell>{policy.update_mode_default}</TableCell>
                        <TableCell className="max-w-sm">
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-semibold text-foreground">Soft:</span>{' '}
                              {policy.soft_title || policy.soft_message
                                ? `${policy.soft_title || 'No title'}${policy.soft_message ? ` - ${policy.soft_message}` : ''}`
                                : 'Not configured'}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">Hard:</span>{' '}
                              {policy.hard_title || policy.hard_message
                                ? `${policy.hard_title || 'No title'}${policy.hard_message ? ` - ${policy.hard_message}` : ''}`
                                : 'Not configured'}
                            </div>
                            {policy.maintenance_enabled && policy.maintenance_message ? (
                              <div>
                                <span className="font-semibold text-foreground">Maintenance:</span>{' '}
                                {policy.maintenance_message}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {[policy.ota_enabled ? 'OTA' : null, policy.maintenance_enabled ? 'Maintenance' : null, policy.is_active ? 'Active' : 'Inactive']
                            .filter(Boolean)
                            .join(' • ')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {appPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-sm text-muted-foreground">
                          No app update policies configured yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>{editingPolicy ? 'Edit app policy' : 'New app policy'}</CardTitle>
                <CardDescription>One row per platform and release channel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={policyForm.platform} onValueChange={(value) => setPolicyForm((p) => ({ ...p, platform: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {appPlatforms.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select value={policyForm.channel} onValueChange={(value) => setPolicyForm((p) => ({ ...p, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {releaseChannels.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Latest version</Label>
                  <Input value={policyForm.latest_version} onChange={(e) => setPolicyForm((p) => ({ ...p, latest_version: e.target.value }))} />
                </div>
                <div>
                  <Label>Latest build number</Label>
                  <Input value={policyForm.latest_build_number} onChange={(e) => setPolicyForm((p) => ({ ...p, latest_build_number: e.target.value }))} />
                </div>
                <div>
                  <Label>Minimum supported version</Label>
                  <Input value={policyForm.minimum_supported_version} onChange={(e) => setPolicyForm((p) => ({ ...p, minimum_supported_version: e.target.value }))} />
                </div>
                <div>
                  <Label>Minimum supported build number</Label>
                  <Input value={policyForm.minimum_supported_build_number} onChange={(e) => setPolicyForm((p) => ({ ...p, minimum_supported_build_number: e.target.value }))} />
                </div>
                <div>
                  <Label>Default update mode</Label>
                  <Select value={policyForm.update_mode_default} onValueChange={(value) => setPolicyForm((p) => ({ ...p, update_mode_default: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select update mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {updateModes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Store URL</Label>
                  <Input value={policyForm.store_url} onChange={(e) => setPolicyForm((p) => ({ ...p, store_url: e.target.value }))} />
                </div>
                <div>
                  <Label>Soft update title</Label>
                  <Input value={policyForm.soft_title} onChange={(e) => setPolicyForm((p) => ({ ...p, soft_title: e.target.value }))} />
                </div>
                <div>
                  <Label>Soft update message</Label>
                  <Textarea value={policyForm.soft_message} onChange={(e) => setPolicyForm((p) => ({ ...p, soft_message: e.target.value }))} />
                </div>
                <div>
                  <Label>Hard update title</Label>
                  <Input value={policyForm.hard_title} onChange={(e) => setPolicyForm((p) => ({ ...p, hard_title: e.target.value }))} />
                </div>
                <div>
                  <Label>Hard update message</Label>
                  <Textarea value={policyForm.hard_message} onChange={(e) => setPolicyForm((p) => ({ ...p, hard_message: e.target.value }))} />
                </div>
                <div>
                  <Label>OTA enabled</Label>
                  <Select value={policyForm.ota_enabled} onValueChange={(value) => setPolicyForm((p) => ({ ...p, ota_enabled: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OTA setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Maintenance enabled</Label>
                  <Select value={policyForm.maintenance_enabled} onValueChange={(value) => setPolicyForm((p) => ({ ...p, maintenance_enabled: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Maintenance message</Label>
                  <Textarea value={policyForm.maintenance_message} onChange={(e) => setPolicyForm((p) => ({ ...p, maintenance_message: e.target.value }))} />
                </div>
                <div>
                  <Label>Record state</Label>
                  <Select value={policyForm.is_active} onValueChange={(value) => setPolicyForm((p) => ({ ...p, is_active: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select record state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={savePolicy} disabled={loading}>
                    {loading ? 'Saving...' : editingPolicy ? 'Save app policy' : 'Create app policy'}
                  </Button>
                  {editingPolicy ? (
                    <>
                      <Button variant="outline" onClick={resetPolicyForm} disabled={loading}>
                        Cancel
                      </Button>
                      <Button variant="outline" onClick={deletePolicy} disabled={loading}>
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
