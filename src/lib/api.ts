export function getApiBase() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
  }
  return url;
}

export function getMcpBase() {
  const url = process.env.NEXT_PUBLIC_MCP_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_MCP_URL environment variable is not set');
  }
  return url;
}

const ADMIN_TOKEN_STORAGE_KEY = 'leet_admin_token';
const AGENT_TOKEN_STORAGE_KEY = 'leet_agent_token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function getAdminToken() {
  return readCookie(ADMIN_TOKEN_STORAGE_KEY);
}

export function setAdminToken(token: string) {
  writeCookie(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function clearAdminToken() {
  clearCookie(ADMIN_TOKEN_STORAGE_KEY);
}

export function getAgentToken() {
  return readCookie(AGENT_TOKEN_STORAGE_KEY);
}

export function setAgentToken(token: string) {
  writeCookie(AGENT_TOKEN_STORAGE_KEY, token);
}

export function clearAgentToken() {
  clearCookie(AGENT_TOKEN_STORAGE_KEY);
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

export async function agentAuthFetch(path: string, options: RequestInit = {}) {
  const token = getAgentToken();
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

export async function fetchAdminSession() {
  return authFetch('/accounts/admin/session/');
}

export async function initAgentLogin(email: string) {
  const response = await fetch(`${getApiBase()}/accounts/auth/init/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response;
}

export async function verifyAgentLogin(email: string, phoneNumber: string, verificationCode: string) {
  const response = await fetch(`${getApiBase()}/accounts/auth/verify-login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      phone_number: phoneNumber,
      verification_code: verificationCode,
    }),
  });
  return response;
}
