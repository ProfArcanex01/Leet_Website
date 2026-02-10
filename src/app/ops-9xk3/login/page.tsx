"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearAdminToken, setAdminToken, adminLogin, adminVerifyLoginOtp, authFetch } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOtpStep = Boolean(challengeToken);

  const handlePasswordLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Email or phone number and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await adminLogin(identifier.trim(), password.trim());
      const payload = await loginResponse.json().catch(() => ({}));
      if (!loginResponse.ok) {
        throw new Error(payload?.detail || payload?.error || 'Access denied.');
      }
      if (payload?.requires_2fa && payload?.challenge_token) {
        setChallengeToken(String(payload.challenge_token));
        setChallengeEmail(typeof payload?.email === 'string' ? payload.email : null);
        setOtpCode('');
        return;
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
      router.replace('/ops-9xk3');
    } catch (err) {
      clearAdminToken();
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!challengeToken || otpCode.trim().length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const verifyResponse = await adminVerifyLoginOtp(challengeToken, otpCode.trim());
      const payload = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) {
        throw new Error(payload?.detail || payload?.error || 'Verification failed.');
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
      router.replace('/ops-9xk3');
    } catch (err) {
      clearAdminToken();
      const message = err instanceof Error ? err.message : 'Unable to verify code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Big access</CardTitle>
          <CardDescription>
            {isOtpStep
              ? `Enter the one-time code sent to ${challengeEmail ?? 'your email'}.`
              : 'Sign in with your Big credentials.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOtpStep ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or phone number</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="you@example.com or +233XXXXXXXXX"
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
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
          )}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex items-center gap-3">
            <Button
              onClick={isOtpStep ? handleVerifyOtp : handlePasswordLogin}
              disabled={loading}
            >
              {loading ? 'Checking...' : isOtpStep ? 'Verify code' : 'Enter admin'}
            </Button>
            {isOtpStep ? (
              <Button
                variant="outline"
                onClick={() => {
                  setChallengeToken(null);
                  setChallengeEmail(null);
                  setOtpCode('');
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
