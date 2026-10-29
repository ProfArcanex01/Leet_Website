const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(this, name.startsWith('@/') ? path.join(__dirname, '../src', name.slice(2)) : name, ...args);
};
require.extensions['.ts'] = (mod, filename) => {
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
process.env.API_URL = 'https://backend.example/api';
process.env.NODE_ENV = 'production';
const { NextRequest } = require('next/server');
const routes = require('../src/app/api/portal/[portal]/[...path]/route.ts');
const { proxy } = require('../src/proxy.ts');
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
function request(action, options = {}) {
  return new NextRequest('https://leet.example/api/portal/admin/' + action, options);
}
const context = (...segments) => ({ params: Promise.resolve({ portal: 'admin', path: segments }) });
test('login strips both tokens and sets secure HttpOnly session', async () => {
  global.fetch = async url => new Response(JSON.stringify(url.endsWith('/session/') ? { id: 1 } : { access: 'secret-access', refresh: 'secret-refresh' }), { status: 200 });
  const response = await routes.POST(request('login', { method: 'POST', headers: { origin: 'https://leet.example' }, body: '{}' }), context('login'));
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(!body.includes('secret'));
  const cookie = response.cookies.get('leet_admin_session');
  assert.equal(cookie.value, 'secret-access');
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
});
test('cross-origin writes are rejected without backend calls', async () => {
  global.fetch = () => { throw new Error('must not call'); };
  const response = await routes.POST(request('login', { method: 'POST', headers: { origin: 'https://attacker.example' } }), context('login'));
  assert.equal(response.status, 403);
});
test('proxy forwards cookie token, ignoring caller Authorization', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://backend.example/api/accounts/admin/users/');
    assert.equal(options.headers.Authorization, 'Bearer server-token');
    return new Response('{}');
  };
  const response = await routes.GET(request('proxy/accounts/admin/users', { headers: { cookie: 'leet_admin_session=server-token', authorization: 'Bearer attacker' } }), context('proxy', 'accounts', 'admin', 'users'));
  assert.equal(response.status, 200);
});
test('token issuing endpoint cannot be reached through API proxy', async () => {
  const response = await routes.GET(request('proxy/accounts/admin/login', { headers: { cookie: 'leet_admin_session=server-token' } }), context('proxy', 'accounts', 'admin', 'login'));
  assert.equal(response.status, 404);
});
test('forged session cannot pass protected page gate', async () => {
  global.fetch = async () => new Response('{}', { status: 401 });
  const response = await proxy(new NextRequest('https://leet.example/ops-9xk3', { headers: { cookie: 'leet_admin_session=forged' } }));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://leet.example/ops-9xk3/login');
});
test('logout expires session cookie', async () => {
  const response = await routes.POST(request('logout', { method: 'POST', headers: { origin: 'https://leet.example' } }), context('logout'));
  assert.equal(response.cookies.get('leet_admin_session').maxAge, 0);
});
