"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearAdminToken, setAdminToken, adminLogin, authFetch } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      setError('Phone number and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await adminLogin(phoneNumber.trim(), password.trim());
      const payload = await loginResponse.json().catch(() => ({}));
      if (!loginResponse.ok) {
        throw new Error(payload?.detail || payload?.error || 'Access denied.');
      }
      if (!payload?.access) {
        throw new Error('No access token returned.');
      }
      setAdminToken(payload.access);
      const checkResponse = await authFetch('/accounts/admin/users/?page_size=1');
      if (!checkResponse.ok) {
        const checkPayload = await checkResponse.json().catch(() => ({}));
        throw new Error(checkPayload?.detail || checkPayload?.error || 'Access denied.');
      }
      router.replace('/admin');
    } catch (err) {
      clearAdminToken();
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Superadmin access</CardTitle>
          <CardDescription>Sign in with your superadmin credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+233XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? 'Checking...' : 'Enter admin'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
