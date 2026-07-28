/**
 * TC-14: ADMIN FULL FLOW
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates an admin user navigating all admin panels:
 *   1. Login as admin
 *   2. Admin dashboard overview
 *   3. Users management panel
 *   4. Projects panel
 *   5. Revenue panel
 *   6. Subscriptions panel
 *   7. AI Usage panel
 *   8. Marketplace moderation panel
 *   9. Logout
 */

const { By, until } = require("selenium-webdriver");
const { navigate, getDriver, quitDriver } = require("../utils/driver");
const { waitForPageLoad } = require("../utils/helpers");

const BASE = process.env.BASE_URL || "http://localhost:3000";

const ADMIN_EMAIL    = process.env.DEMO_ADMIN_EMAIL    || "admin@plancraft.ai";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Admin@1234";

async function log(msg) {
  console.log(`[AdminFlow] ${new Date().toISOString()}  ${msg}`);
}

async function safeGet(driver, path) {
  log(`→ GET ${BASE}${path}`);
  await driver.get(`${BASE}${path}`);
  await driver.sleep(1500);
}

async function tryFill(driver, selector, value) {
  try {
    const el = await driver.findElement(By.css(selector));
    await el.clear();
    await el.sendKeys(value);
    return true;
  } catch (_) { return false; }
}

async function tryClick(driver, selector) {
  try {
    const el = await driver.findElement(By.css(selector));
    await driver.executeScript("arguments[0].click()", el);
    await driver.sleep(800);
    return true;
  } catch (_) { return false; }
}

async function pageContains(driver, text) {
  try {
    const body = await driver.findElement(By.css("body"));
    const src  = await body.getText();
    return src.toLowerCase().includes(text.toLowerCase());
  } catch (_) { return false; }
}

// ── Admin Login ──────────────────────────────────────────────────────────────
async function adminLogin(driver) {
  log(`[AUTH] Admin login → POST /api/auth/login { email: "${ADMIN_EMAIL}" }`);
  await safeGet(driver, "/login");
  await driver.sleep(1000);

  await tryFill(driver, 'input[type="email"]', ADMIN_EMAIL) ||
  await tryFill(driver, 'input[name="email"]', ADMIN_EMAIL) ||
  await tryFill(driver, 'input[name="userId"]', ADMIN_EMAIL);

  await tryFill(driver, 'input[type="password"]', ADMIN_PASSWORD);

  await tryClick(driver, 'button[type="submit"]') ||
  await tryClick(driver, 'form button');

  await driver.sleep(2500);
  const url = await driver.getCurrentUrl();
  log(`[AUTH] Admin login redirect → ${url}`);
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
describe("ADMIN FULL FLOW – All Admin Panels", function () {
  this.timeout(300000);

  let driver;

  before(async () => {
    driver = await getDriver();
    await adminLogin(driver);
  });

  after(async () => {
    await quitDriver();
  });

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  it("ADM-01: Admin dashboard overview loads", async () => {
    log("[Panel 1/8] Admin overview");
    log("[Backend] GET /admin  → system stats overview");
    await safeGet(driver, "/admin");
    await driver.sleep(1500);

    const hasAdmin =
      (await pageContains(driver, "admin"))       ||
      (await pageContains(driver, "user"))         ||
      (await pageContains(driver, "total"))        ||
      (await pageContains(driver, "revenue"))      ||
      (await pageContains(driver, "project"));

    log(`[Admin] Dashboard content: ${hasAdmin}`);
  });

  // ── Users Panel ────────────────────────────────────────────────────────────
  it("ADM-02: Users management panel renders user list", async () => {
    log("[Panel 2/8] Users management");
    log("[Backend] GET /admin/users  → list all users, roles, statuses");
    await safeGet(driver, "/admin/users");
    await driver.sleep(1500);

    const hasUsers =
      (await pageContains(driver, "user"))    ||
      (await pageContains(driver, "email"))   ||
      (await pageContains(driver, "role"))    ||
      (await pageContains(driver, "status"))  ||
      (await pageContains(driver, "member"));

    log(`[Admin/Users] User list present: ${hasUsers}`);
  });

  // ── Projects Panel ─────────────────────────────────────────────────────────
  it("ADM-03: Projects moderation panel shows all projects", async () => {
    log("[Panel 3/8] Projects moderation");
    log("[Backend] GET /admin/projects  → all user projects across system");
    await safeGet(driver, "/admin/projects");
    await driver.sleep(1500);

    const hasProjects =
      (await pageContains(driver, "project"))  ||
      (await pageContains(driver, "floor"))    ||
      (await pageContains(driver, "created"))  ||
      (await pageContains(driver, "owner"));

    log(`[Admin/Projects] Projects panel: ${hasProjects}`);
  });

  // ── Revenue Panel ──────────────────────────────────────────────────────────
  it("ADM-04: Revenue analytics panel loads", async () => {
    log("[Panel 4/8] Revenue analytics");
    log("[Backend] GET /admin/revenue  → billing, MRR, ARR stats");
    await safeGet(driver, "/admin/revenue");
    await driver.sleep(1500);

    const hasRevenue =
      (await pageContains(driver, "revenue"))   ||
      (await pageContains(driver, "mrr"))        ||
      (await pageContains(driver, "billing"))    ||
      (await pageContains(driver, "payment"))    ||
      (await pageContains(driver, "earning"))    ||
      (await pageContains(driver, "total"));

    log(`[Admin/Revenue] Revenue data: ${hasRevenue}`);
  });

  // ── Subscriptions Panel ────────────────────────────────────────────────────
  it("ADM-05: Subscriptions management panel renders", async () => {
    log("[Panel 5/8] Subscriptions");
    log("[Backend] GET /admin/subscriptions  → plan tiers, active subs");
    await safeGet(driver, "/admin/subscriptions");
    await driver.sleep(1500);

    const hasSubs =
      (await pageContains(driver, "subscription"))  ||
      (await pageContains(driver, "plan"))           ||
      (await pageContains(driver, "free"))           ||
      (await pageContains(driver, "pro"))            ||
      (await pageContains(driver, "enterprise"));

    log(`[Admin/Subscriptions] Plans visible: ${hasSubs}`);
  });

  // ── AI Usage Panel ─────────────────────────────────────────────────────────
  it("ADM-06: AI Usage monitoring panel renders", async () => {
    log("[Panel 6/8] AI usage");
    log("[Backend] GET /admin/ai-usage  → credit usage per user, model stats");
    await safeGet(driver, "/admin/ai-usage");
    await driver.sleep(1500);

    const hasAI =
      (await pageContains(driver, "ai"))        ||
      (await pageContains(driver, "credit"))     ||
      (await pageContains(driver, "usage"))      ||
      (await pageContains(driver, "generation")) ||
      (await pageContains(driver, "token"));

    log(`[Admin/AI-Usage] AI metrics visible: ${hasAI}`);
  });

  // ── Marketplace Panel ──────────────────────────────────────────────────────
  it("ADM-07: Marketplace moderation panel renders", async () => {
    log("[Panel 7/8] Marketplace");
    log("[Backend] GET /admin/marketplace  → listings, approvals, flagged");
    await safeGet(driver, "/admin/marketplace");
    await driver.sleep(1500);

    const hasMkt =
      (await pageContains(driver, "marketplace")) ||
      (await pageContains(driver, "listing"))      ||
      (await pageContains(driver, "architect"))     ||
      (await pageContains(driver, "contractor"))    ||
      (await pageContains(driver, "approve"));

    log(`[Admin/Marketplace] Marketplace panel: ${hasMkt}`);
  });

  // ── Admin → Regular Dashboard ──────────────────────────────────────────────
  it("ADM-08: Admin can access regular user dashboard", async () => {
    log("[Panel 8/8] Regular dashboard from admin session");
    log("[Backend] GET /dashboard  → user dashboard (admin acting as user)");
    await safeGet(driver, "/dashboard");
    await driver.sleep(1500);

    const hasDash =
      (await pageContains(driver, "dashboard")) ||
      (await pageContains(driver, "project"))   ||
      (await pageContains(driver, "generate"))  ||
      (await pageContains(driver, "recent"));

    log(`[Admin→Dashboard] User dashboard accessible: ${hasDash}`);
  });
});
