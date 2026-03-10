/**
 * Playwright Screenshot Capture Script
 * Captures all pages for each role for UI review.
 * Run: node capture_screenshots.js
 */

const { chromium } = require('playwright');
const { mkdirSync } = require('fs');
const { join } = require('path');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = join(__dirname, 'web_react', 'screenshots');

const USERS = [
  { role: 'admin',    email: 'smoke_admin@example.com',    password: 'StrongPass123!' },
  { role: 'donor',    email: 'smoke_donor@example.com',    password: 'StrongPass123!' },
  { role: 'hospital', email: 'smoke_hospital@example.com', password: 'StrongPass123!' },
  { role: 'acceptor', email: 'smoke_acceptor@example.com', password: 'StrongPass123!' },
];

const ROLE_PAGES = {
  admin: [
    { name: '01_dashboard',  path: '/admin/dashboard' },
    { name: '02_users',      path: '/admin/users' },
    { name: '03_hospitals',  path: '/admin/hospitals' },
    { name: '04_audit',      path: '/admin/audit' },
    { name: '05_analytics',  path: '/admin/analytics' },
    { name: '06_inventory',  path: '/admin/inventory' },
    { name: '07_ai',         path: '/admin/ai-assistant' },
  ],
  donor: [
    { name: '01_dashboard',     path: '/donor/dashboard' },
    { name: '02_profile',       path: '/donor/profile' },
    { name: '03_matches',       path: '/donor/matches' },
    { name: '04_donations',     path: '/donor/donations' },
    { name: '05_notifications', path: '/donor/notifications' },
    { name: '06_ai',            path: '/donor/ai-assistant' },
  ],
  hospital: [
    { name: '01_dashboard',      path: '/hospital/dashboard' },
    { name: '02_verify_donors',  path: '/hospital/verify-donors' },
    { name: '03_requests',       path: '/hospital/requests' },
    { name: '04_ai',             path: '/hospital/ai-assistant' },
  ],
  acceptor: [
    { name: '01_dashboard',       path: '/acceptor/dashboard' },
    { name: '02_create_request',  path: '/acceptor/create-request' },
    { name: '03_track_requests',  path: '/acceptor/track-requests' },
    { name: '04_search_donors',   path: '/acceptor/search-donors' },
    { name: '05_notifications',   path: '/acceptor/notifications' },
    { name: '06_ai',              path: '/acceptor/ai-assistant' },
  ],
};

// Extra captures: dialogs / special states per role
const DIALOG_CAPTURES = {
  hospital: [
    {
      name: '03b_requests_first_row_expanded',
      path: '/hospital/requests',
      trigger: async (page) => {
        const firstRow = page.locator('table tbody tr').first();
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click();
          await page.waitForTimeout(700);
        }
      },
    },
  ],
  acceptor: [
    {
      name: '03b_track_requests_detail',
      path: '/acceptor/track-requests',
      trigger: async (page) => {
        const firstRow = page.locator('table tbody tr').first();
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click();
          await page.waitForTimeout(700);
        }
      },
    },
  ],
};

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const emailField = page.locator('input[type="email"], input[name="identifier"]').first();
  const passwordField = page.locator('input[type="password"]').first();

  await emailField.fill(email);
  await passwordField.fill(password);
  await page.keyboard.press('Enter');

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 12000 })
    .catch(() => console.warn(`  ⚠  Login may have failed for ${email}`));
  await page.waitForTimeout(1200);
}

async function screenshot(page, filePath) {
  await page.waitForTimeout(700); // let animations settle
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  ✓ ${filePath.replace(__dirname, '.').replace(/\\/g, '/')}`);
}

async function captureRole(browser, user) {
  const { role, email, password } = user;
  const roleDir = join(OUT_DIR, role);
  mkdirSync(roleDir, { recursive: true });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log(`\n── ${role.toUpperCase()} (${email}) ──`);

  try {
    await login(page, email, password);

    for (const { name, path } of ROLE_PAGES[role] || []) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await screenshot(page, join(roleDir, `${name}.png`));
    }

    for (const { name, path, trigger } of DIALOG_CAPTURES[role] || []) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await trigger(page);
      await screenshot(page, join(roleDir, `${name}.png`));
    }

  } catch (err) {
    console.error(`  ✗ Error for ${role}: ${err.message}`);
    await page.screenshot({ path: join(roleDir, '_error.png'), fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

async function capturePublicPages(browser) {
  const pubDir = join(OUT_DIR, 'public');
  mkdirSync(pubDir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('\n── PUBLIC pages ──');
  const pages = [
    { name: 'login',             path: '/login' },
    { name: 'register',          path: '/register' },
    { name: 'register_hospital', path: '/register/hospital' },
    { name: 'unauthorized',      path: '/unauthorized' },
    { name: 'not_found',         path: '/this-page-does-not-exist' },
  ];

  for (const { name, path } of pages) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await screenshot(page, join(pubDir, `${name}.png`));
  }

  await context.close();
}

(async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  await capturePublicPages(browser);

  for (const user of USERS) {
    await captureRole(browser, user);
  }

  await browser.close();
  console.log(`\n✅ Done! Screenshots saved to: ${OUT_DIR}`);
})();
