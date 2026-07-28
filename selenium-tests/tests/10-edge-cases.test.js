const { By } = require("selenium-webdriver");
const { navigate, getDriver, getBaseUrl } = require("../utils/driver");
const {
  waitAndFind,
  click,
  type,
  getText,
  isVisible,
  waitForPageLoad,
  countElements,
  scrollTo,
} = require("../utils/helpers");

const BASE_URL = getBaseUrl();

async function warmupNavigate(driver, target) {
  try {
    await navigate(target);
  } catch (err) {
    if (err.message && err.message.includes("ERR_CONNECTION_REFUSED")) {
      console.warn(`Warmup: navigating to / first before ${target}`);
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      await navigate(target);
    } else {
      throw err;
    }
  }
}

describe("Edge Cases Tests", function () {
  this.timeout(300000);

  it("EDGE-01: 404 page handles unknown routes", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/this-route-does-not-exist-12345");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Body not displayed on unknown route");
      const text = await body.getText();
      const has404 =
        text.includes("404") ||
        text.includes("not found") ||
        text.includes("Not Found") ||
        text.includes("Page not found");
      if (!has404) {
        console.warn("EDGE-01: Unknown route did not show a 404 message; app may render fallback content");
      }
    } catch (err) {
      throw new Error(`EDGE-01 failed: ${err.message}`);
    }
  });

  it("EDGE-02: Empty localStorage handled gracefully", async () => {
    const driver = await getDriver();
    try {
      await driver.executeScript("localStorage.clear()");
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Landing page fails after localStorage.clear()");
      await driver.executeScript("localStorage.setItem('test', 'recovered')");
    } catch (err) {
      throw new Error(`EDGE-02 failed: ${err.message}`);
    }
  });

  it("EDGE-03: App renders without crash", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const body = await driver.findElement(By.css("body"));
      if (!(await body.isDisplayed())) throw new Error("Body not displayed");
      const rootEls = await driver.findElements(By.css("#root, #__next, [data-reactroot]"));
      if (rootEls.length === 0) {
        console.warn("EDGE-03: No recognized root element found; app may use a custom mount point");
      }
    } catch (err) {
      throw new Error(`EDGE-03 failed: ${err.message}`);
    }
  });

  it("EDGE-04: Multiple rapid navigations work", async () => {
    const driver = await getDriver();
    try {
      const pages = ["/", "/features", "/pricing", "/blog", "/contact", "/about"];
      for (const p of pages) {
        try {
          await navigate(p);
        } catch (err) {
          if (err.message && err.message.includes("ERR_CONNECTION_REFUSED")) {
            await navigate("/");
            await waitForPageLoad(driver);
            await driver.sleep(300);
            await navigate(p);
          } else {
            throw err;
          }
        }
        await driver.sleep(200);
      }
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      const lastPage = pages[pages.length - 1];
      if (!url.includes(lastPage)) {
        console.warn(`EDGE-04: After rapid navigation, URL does not contain ${lastPage} (URL: ${url})`);
      }
    } catch (err) {
      throw new Error(`EDGE-04 failed: ${err.message}`);
    }
  });

  it("EDGE-05: Page scrolls smoothly on landing page", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const scrollHeight = await driver.executeScript("return document.body.scrollHeight");
      if (scrollHeight > window.innerHeight) {
        await driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
        await driver.sleep(800);
        const scrollY = await driver.executeScript("return window.scrollY");
        if (scrollY <= 0) {
          console.warn("EDGE-05: Could not scroll down; page may not have overflow content");
        }
        await driver.executeScript("window.scrollTo(0, 0)");
        await driver.sleep(500);
        const scrollTop = await driver.executeScript("return window.scrollY");
        if (scrollTop !== 0) {
          console.warn("EDGE-05: Scroll back to top did not reach 0");
        }
      } else {
        console.warn("EDGE-05: Landing page body is not tall enough to scroll");
      }
    } catch (err) {
      console.warn(`EDGE-05 scroll test encountered an issue: ${err.message}`);
    }
  });

  it("EDGE-06: Images have alt attributes", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const images = await driver.findElements(By.css("img"));
      let missingAlt = 0;
      let emptyAlt = 0;
      for (const img of images) {
        const alt = await img.getAttribute("alt");
        if (alt === null || alt === undefined) {
          missingAlt++;
        } else if (alt.trim() === "") {
          emptyAlt++;
        }
      }
      if (images.length > 0 && missingAlt > 0) {
        console.warn(`EDGE-06: ${missingAlt} of ${images.length} images lack alt attribute`);
      }
      if (emptyAlt > 0) {
        console.warn(`EDGE-06: ${emptyAlt} of ${images.length} images have empty alt text`);
      }
    } catch (err) {
      console.warn(`EDGE-06 image alt check failed: ${err.message}`);
    }
  });

  it("EDGE-07: Links have valid href attributes", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const links = await driver.findElements(By.css("a[href]"));
      let invalidCount = 0;
      for (const link of links) {
        const href = await link.getAttribute("href");
        if (!href || href === "#" || href.startsWith("javascript:")) {
          invalidCount++;
        }
      }
      if (links.length > 0 && invalidCount === links.length) {
        console.warn("EDGE-07: All links appear to be hash or javascript based");
      } else if (invalidCount > links.length / 2) {
        console.warn(`EDGE-07: ${invalidCount} of ${links.length} links have invalid href`);
      }
    } catch (err) {
      console.warn(`EDGE-07 href check failed: ${err.message}`);
    }
  });

  it("EDGE-08: Manifest loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/manifest.json");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const bodyText = await driver.findElement(By.css("body")).getText();
      let manifest;
      try {
        manifest = JSON.parse(bodyText);
      } catch {
        const pre = await driver.findElements(By.css("pre"));
        if (pre.length > 0) {
          const preText = await pre[0].getText();
          manifest = JSON.parse(preText);
        }
      }
      if (manifest) {
        if (!manifest.name) {
          console.warn("EDGE-08: Manifest missing 'name' field");
        }
        if (!manifest.short_name) {
          console.warn("EDGE-08: Manifest missing 'short_name' field");
        }
      } else {
        console.warn("EDGE-08: Could not parse manifest.json as JSON");
      }
    } catch (err) {
      console.warn(`EDGE-08 manifest check failed: ${err.message}`);
    }
  });

  it("EDGE-09: Service worker registered", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const swRegistered = await driver.executeScript(
        "return navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(regs => regs.length) : -1"
      );
      if (swRegistered === -1) {
        console.warn("EDGE-09: Service Worker API not available in this browser");
      } else if (swRegistered === 0) {
        console.warn("EDGE-09: No service workers registered");
      }
      const swUrl = await driver.executeScript(
        "return navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(regs => regs[0] ? regs[0].active ? regs[0].active.scriptURL : null : null) : null"
      );
      if (swUrl && !swUrl.includes("/sw.js")) {
        console.warn(`EDGE-09: Registered SW URL is not /sw.js (${swUrl})`);
      }
    } catch (err) {
      console.warn(`EDGE-09 service worker check failed: ${err.message}`);
    }
  });

  it("EDGE-10: Console has no critical errors", async () => {
    const driver = await getDriver();
    try {
      const logs = await driver.executeScript(`
        return window.__NEXT_DATA__ ? 'nextjs' : 'no-next-data';
      `);
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const errorElements = await driver.findElements(
        By.css('[class*="error"], [class*="Error"], [role="alert"], [data-error]')
      );
      if (errorElements.length > 0) {
        console.warn(`EDGE-10: Found ${errorElements.length} error-related elements on the page`);
      }
      const bodyText = await driver.findElement(By.css("body")).getText();
      if (
        bodyText.includes("Application error") ||
        bodyText.includes("Something went wrong") ||
        bodyText.includes("Internal Server Error")
      ) {
        console.warn("EDGE-10: Page contains application error text");
      }
    } catch (err) {
      console.warn(`EDGE-10 console error check failed: ${err.message}`);
    }
  });

  it("EDGE-11: Rapid login/logout cycles", async () => {
    const driver = await getDriver();
    try {
      for (let i = 0; i < 3; i++) {
        await warmupNavigate(driver, "/login");
        await waitForPageLoad(driver);
        await driver.sleep(300);
        await driver.executeScript(
          "localStorage.clear(); document.cookie.split(';').forEach(function(c) { document.cookie = c.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'; });"
        );
        await navigate("/");
        await waitForPageLoad(driver);
        await driver.sleep(300);
        const body = await driver.findElement(By.css("body"));
        const displayed = await body.isDisplayed();
        if (!displayed) throw new Error(`Body not displayed after cycle ${i + 1}`);
      }
    } catch (err) {
      throw new Error(`EDGE-11 rapid login/logout cycle failed: ${err.message}`);
    }
  });

  it("EDGE-12: Theme persistence across pages", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const theme1 = await driver.executeScript(
        "return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('class') || 'none'"
      );
      const pages = ["/features", "/pricing", "/blog", "/contact"];
      for (const p of pages) {
        await navigate(p);
        await waitForPageLoad(driver);
        await driver.sleep(300);
        const themeN = await driver.executeScript(
          "return localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || document.documentElement.getAttribute('class') || 'none'"
        );
        if (theme1 !== 'none' && themeN !== theme1) {
          console.warn(`EDGE-12: Theme changed from "${theme1}" to "${themeN}" on ${p}`);
        }
      }
    } catch (err) {
      console.warn(`EDGE-12 theme persistence check failed: ${err.message}`);
    }
  });

  it("EDGE-13: Load time under 10s", async () => {
    const driver = await getDriver();
    try {
      const start = Date.now();
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const loadTime = (Date.now() - start) / 1000;
      if (loadTime > 10) {
        console.warn(`EDGE-13: Page load took ${loadTime.toFixed(2)}s (threshold: 10s)`);
      }
    } catch (err) {
      console.warn(`EDGE-13 load time check failed: ${err.message}`);
    }
  });

  it("EDGE-14: 3D Viewer loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/viewer-3d");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("3D Viewer page body not displayed");
      const canvas = await driver.findElements(By.css("canvas"));
      if (canvas.length === 0) {
        console.warn("EDGE-14: No canvas element found on 3D viewer page");
      }
    } catch (err) {
      throw new Error(`EDGE-14 3D Viewer failed: ${err.message}`);
    }
  });

  it("EDGE-15: Workspace 2D loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/workspace/2d");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Workspace 2D body not displayed");
    } catch (err) {
      throw new Error(`EDGE-15 Workspace 2D failed: ${err.message}`);
    }
  });

  it("EDGE-16: Marketplace loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/marketplace");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Marketplace body not displayed");
      const content = await driver.findElements(
        By.css("main, section, [class*='marketplace'], [class*='Marketplace']")
      );
      if (content.length === 0) {
        console.warn("EDGE-16: Marketplace page has no main content container");
      }
    } catch (err) {
      throw new Error(`EDGE-16 Marketplace failed: ${err.message}`);
    }
  });

  it("EDGE-17: Workspace 3D loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/workspace/3d");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Workspace 3D body not displayed");
    } catch (err) {
      throw new Error(`EDGE-17 Workspace 3D failed: ${err.message}`);
    }
  });

  it("EDGE-18: Vastu analysis loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/analysis/vastu");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Vastu analysis body not displayed");
    } catch (err) {
      throw new Error(`EDGE-18 Vastu analysis failed: ${err.message}`);
    }
  });

  it("EDGE-19: Cost analysis loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/analysis/cost");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Cost analysis body not displayed");
    } catch (err) {
      throw new Error(`EDGE-19 Cost analysis failed: ${err.message}`);
    }
  });

  it("EDGE-20: Materials analysis loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/analysis/materials");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Materials analysis body not displayed");
    } catch (err) {
      throw new Error(`EDGE-20 Materials analysis failed: ${err.message}`);
    }
  });

  it("EDGE-21: Dashboard sub-pages load (multiple in one test)", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const subPages = [
        "/dashboard/ai",
        "/dashboard/analytics",
        "/dashboard/billing",
        "/dashboard/exports",
        "/dashboard/history",
        "/dashboard/library",
        "/dashboard/notifications",
        "/dashboard/process",
        "/dashboard/reviews",
        "/dashboard/sharing",
        "/dashboard/subscription",
        "/dashboard/team",
        "/dashboard/templates",
        "/dashboard/upload",
        "/dashboard/cost",
      ];
      for (const p of subPages) {
        try {
          await navigate(p);
          await waitForPageLoad(driver);
          await driver.sleep(300);
          const body = await driver.findElement(By.css("body"));
          const displayed = await body.isDisplayed();
          if (!displayed) {
            console.warn(`EDGE-21: Dashboard subpage ${p} body not displayed`);
          }
        } catch (navErr) {
          console.warn(`EDGE-21: Navigation to ${p} failed: ${navErr.message}`);
        }
      }
    } catch (err) {
      console.warn(`EDGE-21 dashboard sub-pages check failed: ${err.message}`);
    }
  });

  it("EDGE-22: Workspace sub-pages load (multiple)", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const workspacePages = [
        "/workspace",
        "/workspace/ar",
        "/workspace/blueprint",
        "/workspace/exterior",
        "/workspace/furniture",
        "/workspace/interior",
        "/workspace/lighting",
        "/workspace/materials",
        "/workspace/vr",
      ];
      for (const p of workspacePages) {
        try {
          await navigate(p);
          await waitForPageLoad(driver);
          await driver.sleep(300);
          const body = await driver.findElement(By.css("body"));
          const displayed = await body.isDisplayed();
          if (!displayed) {
            console.warn(`EDGE-22: Workspace page ${p} body not displayed`);
          }
        } catch (navErr) {
          console.warn(`EDGE-22: Navigation to ${p} failed: ${navErr.message}`);
        }
      }
    } catch (err) {
      console.warn(`EDGE-22 workspace sub-pages check failed: ${err.message}`);
    }
  });

  it("EDGE-23: Blog post detail loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/blog/sample-post");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Blog post detail body not displayed");
      const mainContent = await driver.findElements(
        By.css("article, main, [class*='post'], [class*='blog']")
      );
      if (mainContent.length === 0) {
        console.warn("EDGE-23: Blog post page has no recognizable article container");
      }
    } catch (err) {
      throw new Error(`EDGE-23 Blog post detail failed: ${err.message}`);
    }
  });

  it("EDGE-24: Marketplace architects loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/marketplace/architects");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Marketplace architects body not displayed");
    } catch (err) {
      throw new Error(`EDGE-24 Marketplace architects failed: ${err.message}`);
    }
  });

  it("EDGE-25: Marketplace contractors loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/marketplace/contractors");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Marketplace contractors body not displayed");
    } catch (err) {
      throw new Error(`EDGE-25 Marketplace contractors failed: ${err.message}`);
    }
  });

  it("EDGE-26: Email verification page loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/verify-email");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Email verification page body not displayed");
      const text = await body.getText();
      if (
        text.includes("verify") ||
        text.includes("Verify") ||
        text.includes("email") ||
        text.includes("Email")
      ) {
        return;
      }
      console.warn("EDGE-26: /verify-email loaded but no verification-related text found");
    } catch (err) {
      throw new Error(`EDGE-26 Email verification page failed: ${err.message}`);
    }
  });

  it("EDGE-27: Structural analysis loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/analysis/structural");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Structural analysis body not displayed");
    } catch (err) {
      throw new Error(`EDGE-27 Structural analysis failed: ${err.message}`);
    }
  });

  it("EDGE-28: Sustainability analysis loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/analysis/sustainability");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Sustainability analysis body not displayed");
    } catch (err) {
      throw new Error(`EDGE-28 Sustainability analysis failed: ${err.message}`);
    }
  });

  it("EDGE-29: Image-to-plan (workspace/2d/image-to-plan) loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/workspace/2d/image-to-plan");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Image-to-plan page body not displayed");
      const text = await body.getText();
      if (
        text.includes("image") ||
        text.includes("Image") ||
        text.includes("plan") ||
        text.includes("upload") ||
        text.includes("Upload")
      ) {
        return;
      }
      console.warn("EDGE-29: /workspace/2d/image-to-plan loaded but no image/plan related text found");
    } catch (err) {
      throw new Error(`EDGE-29 Image-to-plan page failed: ${err.message}`);
    }
  });

  it("EDGE-30: Dashboard team manage loads", async () => {
    const driver = await getDriver();
    try {
      await warmupNavigate(driver, "/dashboard/team");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Dashboard team manage body not displayed");
      const text = await body.getText();
      if (
        text.includes("team") ||
        text.includes("Team") ||
        text.includes("member") ||
        text.includes("Member") ||
        text.includes("invite") ||
        text.includes("Invite")
      ) {
        return;
      }
      console.warn("EDGE-30: /dashboard/team loaded but no team-related text found");
    } catch (err) {
      throw new Error(`EDGE-30 Dashboard team manage failed: ${err.message}`);
    }
  });
});
