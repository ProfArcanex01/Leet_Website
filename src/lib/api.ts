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


function portalFetch(portal: string, path: string, options: RequestInit = {}) {
  return fetch('/api/portal/' + portal + path, { ...options, credentials: 'same-origin', cache: 'no-store' });
}
export async function clearAdminToken() { await portalFetch('admin', '/logout', { method: 'POST' }); }
export async function clearAgentToken() { await portalFetch('agent', '/logout', { method: 'POST' }); }
export function authFetch(path: string, options: RequestInit = {}) {
  return portalFetch('admin', '/proxy' + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
}
export function agentAuthFetch(path: string, options: RequestInit = {}) {
  return portalFetch('agent', '/proxy' + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
}
function login(portal: string, action: string, body: object) {
  return portalFetch(portal, '/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
export function adminLogin(identifier: string, password: string) { return login('admin', 'login', { identifier, password }); }
export function adminVerifyLoginOtp(challengeToken: string, verificationCode: string) {
  return login('admin', 'verify', { challenge_token: challengeToken, verification_code: verificationCode });
}
export function fetchAdminSession() { return portalFetch('admin', '/session'); }
export function fetchAgentSession() { return portalFetch('agent', '/session'); }
export function initAgentLogin(email: string) { return login('agent', 'login', { email }); }
export function verifyAgentLogin(email: string, verificationCode: string, loginChallenge?: string) {
  return login('agent', 'verify', { email, verification_code: verificationCode, login_challenge: loginChallenge });
}
