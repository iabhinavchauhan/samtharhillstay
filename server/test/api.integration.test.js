import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

// Keep this suite isolated from both the developer's .env and any real database.
process.env.MONGODB_URI = '';
process.env.ALLOW_EPHEMERAL_DB = 'true';
process.env.ADMIN_PASSWORD = 'Test-Only-Admin-Password-2026!';
process.env.JWT_SECRET = 'test-only-jwt-secret-for-local-integration-tests';
process.env.NODE_ENV = 'test';

const { connectDb, getAdminPasswordDiagnostics } = await import('../db.js');
const { app, assertJwtSecret } = await import('../index.js');
let server;
let origin;
let adminToken;

before(async () => {
  await connectDb();
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  origin = `http://127.0.0.1:${server.address().port}`;

  const response = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: process.env.ADMIN_PASSWORD })
  });
  assert.equal(response.status, 200);
  adminToken = (await response.json()).token;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

function adminHeaders() {
  return { Authorization: `Bearer ${adminToken}` };
}

test('health endpoint reports the explicitly isolated test store', async () => {
  const response = await fetch(`${origin}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', persistence: 'ephemeral' });
});

test('production refuses missing or weak JWT secrets', () => {
  assert.throws(() => assertJwtSecret('', 'production'), /at least 32 characters/);
  assert.throws(() => assertJwtSecret('too-short', 'production'), /at least 32 characters/);
  assert.doesNotThrow(() => assertJwtSecret('random-secret-with-at-least-32-characters', 'production'));
});

test('admin password diagnostics reveal presence and character count only', () => {
  assert.deepEqual(getAdminPasswordDiagnostics(null), { configured: false, characterLength: 0 });
  assert.deepEqual(getAdminPasswordDiagnostics(''), { configured: true, characterLength: 0 });
  assert.deepEqual(getAdminPasswordDiagnostics('short'), { configured: true, characterLength: 5 });
  assert.deepEqual(getAdminPasswordDiagnostics('🔐'.repeat(12)), { configured: true, characterLength: 12 });
});

test('backend refuses to start without MongoDB unless temporary storage is explicitly allowed', async () => {
  const priorSetting = process.env.ALLOW_EPHEMERAL_DB;
  try {
    process.env.ALLOW_EPHEMERAL_DB = 'false';
    await assert.rejects(connectDb(), /MONGODB_URI is required/);
  } finally {
    process.env.ALLOW_EPHEMERAL_DB = priorSetting;
  }
});

test('production cannot enable temporary database storage', async () => {
  const priorEnvironment = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    await assert.rejects(connectDb(), /MONGODB_URI is required/);
  } finally {
    process.env.NODE_ENV = priorEnvironment;
  }
});

test('published content is initialized and returned without cache', async () => {
  const response = await fetch(`${origin}/api/content/published`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, no-cache, must-revalidate, proxy-revalidate');
  assert.ok(data.homepage);
  assert.ok(data.homestays.length > 0);
});

test('draft updates publish to the public content endpoint', async () => {
  const contentResponse = await fetch(`${origin}/api/content/published`);
  const data = await contentResponse.json();
  data.seo.siteTitle = 'Integration Test Published Title';

  const draftResponse = await fetch(`${origin}/api/admin/content/draft`, {
    method: 'POST',
    headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  assert.equal(draftResponse.status, 200);

  const publishResponse = await fetch(`${origin}/api/admin/content/publish`, {
    method: 'POST',
    headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, note: 'integration test' })
  });
  assert.equal(publishResponse.status, 200);

  const publicResponse = await fetch(`${origin}/api/content/published`);
  assert.equal((await publicResponse.json()).seo.siteTitle, 'Integration Test Published Title');
});

test('public reviews are saved, shown in admin, and deletable', async () => {
  const submitted = await fetch(`${origin}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author: 'Integration Guest', rating: 5, text: 'Review from integration test' })
  });
  assert.equal(submitted.status, 201);
  const review = await submitted.json();

  const publicList = await fetch(`${origin}/api/reviews`);
  assert.ok((await publicList.json()).some((item) => item.id === review.id));

  const adminList = await fetch(`${origin}/api/admin/reviews`, { headers: adminHeaders() });
  assert.ok((await adminList.json()).some((item) => item.id === review.id));

  const deleted = await fetch(`${origin}/api/admin/reviews/${encodeURIComponent(review.id)}`, {
    method: 'DELETE',
    headers: adminHeaders()
  });
  assert.equal(deleted.status, 200);
  const afterDelete = await (await fetch(`${origin}/api/reviews`)).json();
  assert.ok(!afterDelete.some((item) => item.id === review.id));
});

test('public contact inquiries are saved and visible in the admin inbox', async () => {
  const submitted = await fetch(`${origin}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Inquiry Integration Guest',
      phone: '9800000000',
      dates: '2027-02-01 to 2027-02-03',
      homestay: 'Test Homestay',
      guests: 2,
      message: 'Integration test inquiry'
    })
  });
  assert.equal(submitted.status, 200);
  const inquiry = await submitted.json();

  const inbox = await fetch(`${origin}/api/admin/inquiries`, { headers: adminHeaders() });
  assert.ok((await inbox.json()).some((item) => item.id === inquiry.id));
});

test('guest signup, profile refresh, and recent-view data survive API round trips', async () => {
  const published = await (await fetch(`${origin}/api/content/published`)).json();
  const staySlug = published.homestays[0].slug;
  const email = `integration-${Date.now()}@example.test`;
  const signup = await fetch(`${origin}/api/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Integration Guest', email, password: 'Test-Only-Guest-Password-2026!', phone: '9800000000' })
  });
  assert.equal(signup.status, 200);
  const { token } = await signup.json();
  const userHeaders = { Authorization: `Bearer ${token}` };

  const profile = await fetch(`${origin}/api/user/me`, { headers: userHeaders });
  assert.equal((await profile.json()).user.email, email);

  const updated = await fetch(`${origin}/api/user/profile`, {
    method: 'PUT',
    headers: { ...userHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated Integration Guest', phone: '9811111111' })
  });
  assert.equal((await updated.json()).user.name, 'Updated Integration Guest');

  const recorded = await fetch(`${origin}/api/user/recent-views`, {
    method: 'POST',
    headers: { ...userHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ staySlug })
  });
  assert.equal(recorded.status, 200);
  const recent = await fetch(`${origin}/api/user/recent-views`, { headers: userHeaders });
  assert.ok((await recent.json()).stays.some((stay) => stay.slug === staySlug));
});

test('admin can create and remove an additional admin account', async () => {
  const created = await fetch(`${origin}/api/admin/users`, {
    method: 'POST',
    headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'integration-editor', password: 'Test-Only-Editor-Password-2026!', role: 'editor' })
  });
  assert.equal(created.status, 200);
  const user = await created.json();

  const users = await (await fetch(`${origin}/api/admin/users`, { headers: adminHeaders() })).json();
  assert.ok(users.some((item) => item.id === user.id));

  const deleted = await fetch(`${origin}/api/admin/users/${encodeURIComponent(user.id)}`, {
    method: 'DELETE',
    headers: adminHeaders()
  });
  assert.equal(deleted.status, 200);
});

test('password changes revoke prior admin tokens and issue a replacement', async () => {
  const changed = await fetch(`${origin}/api/admin/account/password`, {
    method: 'POST',
    headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword: process.env.ADMIN_PASSWORD,
      newPassword: 'Test-Only-New-Admin-Password-2026!'
    })
  });
  assert.equal(changed.status, 200);
  const { token: replacementToken } = await changed.json();

  const oldSession = await fetch(`${origin}/api/admin/users`, { headers: adminHeaders() });
  assert.equal(oldSession.status, 401);

  adminToken = replacementToken;
  const newSession = await fetch(`${origin}/api/admin/users`, { headers: adminHeaders() });
  assert.equal(newSession.status, 200);

  const newLogin = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Test-Only-New-Admin-Password-2026!' })
  });
  assert.equal(newLogin.status, 200);
});
