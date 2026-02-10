const DEFAULT_API_BASE = 'http://localhost:8000/api';

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;
}

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('leet_admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('leet_admin_token', token);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('leet_admin_token');
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });
  return response;
}

export async function adminLogin(identifier: string, password: string) {
  const response = await fetch(`${getApiBase()}/accounts/admin/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return response;
}

export async function adminVerifyLoginOtp(challengeToken: string, verificationCode: string) {
  const response = await fetch(`${getApiBase()}/accounts/admin/login/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challenge_token: challengeToken,
      verification_code: verificationCode,
    }),
  });
  return response;
}
