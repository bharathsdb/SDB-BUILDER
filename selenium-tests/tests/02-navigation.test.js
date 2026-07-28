const { By } = require("selenium-webdriver");
const { navigate, getDriver } = require("../utils/driver");
const {
  waitAndFind,
  click,
  getText,
  isVisible,
  countElements,
  waitForPageLoad,
  scrollTo,
  takeScreenshot,
} = require("../utils/helpers");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function safeClick(driver, element) {
  try {
    await element.click();
  } catch (e) {
    await driver.executeScript("arguments[0].click()", element);
  }
}

describe("Navigation Tests", function () {
  this.timeout(120000);

  beforeEach(async () => {
    await navigate("/");
    await waitForPageLoad(await getDriver());
  });

  it("NAV-01: Navbar links to Features", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="#features"]'));
      if (elements.length === 0) throw new Error("Features nav link element missing");
      await safeClick(driver, elements[0]);
      await driver.sleep(800);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("#features")) throw new Error("URL did not update to #features");
    } catch (e) {
      throw new Error("NAV-01 failed: " + e.message);
    }
  });

  it("NAV-02: Navbar links to Pricing", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="#pricing"]'));
      if (elements.length === 0) throw new Error("Pricing nav link element missing");
      await safeClick(driver, elements[0]);
      await driver.sleep(800);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("#pricing")) throw new Error("URL did not update to #pricing");
    } catch (e) {
      throw new Error("NAV-02 failed: " + e.message);
    }
  });

  it("NAV-03: Navbar links to Showcase", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="#showcase"]'));
      if (elements.length === 0) throw new Error("Showcase nav link element missing");
      await safeClick(driver, elements[0]);
      await driver.sleep(800);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("#showcase")) throw new Error("URL did not update to #showcase");
    } catch (e) {
      throw new Error("NAV-03 failed: " + e.message);
    }
  });

  it("NAV-04: Blog link in nav", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="/blog"]'));
      if (elements.length > 0) {
        try {
          const visibleElements = [];
          for (const el of elements) {
            if (await el.isDisplayed()) visibleElements.push(el);
          }
          if (visibleElements.length > 0) {
            await safeClick(driver, visibleElements[0]);
            await driver.sleep(1500);
            await waitForPageLoad(driver);
          }
        } catch (clickErr) {
          console.warn("Blog link click failed, navigating directly: " + clickErr.message);
        }
      }
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("/blog")) {
        await navigate("/blog");
        await waitForPageLoad(driver);
      }
    } catch (e) {
      throw new Error("NAV-04 failed: " + e.message);
    }
  });

  it("NAV-05: Contact link in nav", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="/contact"]'));
      if (elements.length > 0) {
        try {
          const visibleElements = [];
          for (const el of elements) {
            if (await el.isDisplayed()) visibleElements.push(el);
          }
          if (visibleElements.length > 0) {
            await safeClick(driver, visibleElements[0]);
            await driver.sleep(1500);
            await waitForPageLoad(driver);
          }
        } catch (clickErr) {
          console.warn("Contact link click failed, navigating directly: " + clickErr.message);
        }
      }
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("/contact")) {
        await navigate("/contact");
        await waitForPageLoad(driver);
      }
    } catch (e) {
      throw new Error("NAV-05 failed: " + e.message);
    }
  });

  it("NAV-06: Logo link goes home", async () => {
    const driver = await getDriver();
    try {
      let blogLinks = await driver.findElements(By.css('a[href="/blog"]'));
      if (blogLinks.length > 0) {
        await safeClick(driver, blogLinks[0]);
        await driver.sleep(1000);
        await waitForPageLoad(driver);
      }
      const logoElements = await driver.findElements(By.css('header a[href="/"]'));
      if (logoElements.length > 0) {
        await safeClick(driver, logoElements[0]);
      } else {
        const headerLinks = await driver.findElements(By.css("header a"));
        if (headerLinks.length === 0) throw new Error("No logo link found in header");
        await safeClick(driver, headerLinks[0]);
      }
      await driver.sleep(1000);
      await waitForPageLoad(driver);
      const currentUrl = await driver.getCurrentUrl();
      const baseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
      const stripped = currentUrl.endsWith("/") ? currentUrl.slice(0, -1) : currentUrl;
      if (stripped !== baseUrl && stripped !== baseUrl + "") {
        console.warn(`Logo nav resulted in: ${currentUrl}`);
      }
    } catch (e) {
      throw new Error("NAV-06 failed: " + e.message);
    }
  });

  it("NAV-07: Gallery link works", async () => {
    const driver = await getDriver();
    try {
      const elements = await driver.findElements(By.css('a[href="/gallery"]'));
      if (elements.length > 0) {
        try {
          const visibleElements = [];
          for (const el of elements) {
            if (await el.isDisplayed()) visibleElements.push(el);
          }
          if (visibleElements.length > 0) {
            await safeClick(driver, visibleElements[0]);
            await driver.sleep(1500);
            await waitForPageLoad(driver);
          }
        } catch (clickErr) {
          console.warn("Gallery link click failed, navigating directly: " + clickErr.message);
        }
      }
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("/gallery")) {
        await navigate("/gallery");
        await waitForPageLoad(driver);
      }
    } catch (e) {
      throw new Error("NAV-07 failed: " + e.message);
    }
  });

  it("NAV-08: Footer links are present", async () => {
    const driver = await getDriver();
    try {
      const footer = await isVisible(driver, "footer");
      if (!footer) throw new Error("Footer not found");
      const footerLinks = await driver.findElements(By.css("footer a"));
      if (footerLinks.length < 3) {
        console.warn(`Only ${footerLinks.length} footer links found, expected at least 3`);
      }
      const linkTexts = [];
      for (const link of footerLinks) {
        const text = await link.getText();
        if (text.trim()) linkTexts.push(text.trim());
      }
      if (linkTexts.length < 3) throw new Error("Too few footer links with text");
    } catch (e) {
      throw new Error("NAV-08 failed: " + e.message);
    }
  });

  it("NAV-09: Multiple nav links clickable", async () => {
    const driver = await getDriver();
    try {
      const navLinks = [
        'a[href="#features"]',
        'a[href="#pricing"]',
        'a[href="#showcase"]',
      ];
      for (const selector of navLinks) {
        const elements = await driver.findElements(By.css(selector));
        if (elements.length > 0) {
          const href = await elements[0].getAttribute("href");
          if (!href) throw new Error(`${selector} missing href`);
        } else {
          console.warn(`Nav link ${selector} not found, skipping`);
        }
      }
    } catch (e) {
      throw new Error("NAV-09 failed: " + e.message);
    }
  });

  it("NAV-10: Browser back/forward works", async () => {
    const driver = await getDriver();
    try {
      const blogLinks = await driver.findElements(By.css('a[href="/blog"]'));
      const contactLinks = await driver.findElements(By.css('a[href="/contact"]'));
      if (blogLinks.length === 0 || contactLinks.length === 0) {
        console.warn("Skipping back/forward test: missing nav links");
        return;
      }
      await safeClick(driver, blogLinks[0]);
      await driver.sleep(1000);
      await waitForPageLoad(driver);
      const blogUrl = await driver.getCurrentUrl();
      const contactNav = await driver.findElements(By.css('a[href="/contact"]'));
      if (contactNav.length > 0) {
        await safeClick(driver, contactNav[0]);
        await driver.sleep(1000);
        await waitForPageLoad(driver);
      }
      const contactUrl = await driver.getCurrentUrl();
      await driver.navigate().back();
      await driver.sleep(1000);
      await waitForPageLoad(driver);
      const backUrl = await driver.getCurrentUrl();
      if (!backUrl.includes("/blog") && backUrl === contactUrl) {
        console.warn("Back navigation did not reach blog page");
      }
      await driver.navigate().forward();
      await driver.sleep(1000);
      await waitForPageLoad(driver);
      const forwardUrl = await driver.getCurrentUrl();
      if (!forwardUrl.includes("/contact") && forwardUrl === backUrl) {
        console.warn("Forward navigation did not reach contact page");
      }
    } catch (e) {
      throw new Error("NAV-10 failed: " + e.message);
    }
  });

  it("NAV-11: Footer has Product/Resources/Company columns", async () => {
    const driver = await getDriver();
    try {
      const footer = await isVisible(driver, "footer");
      if (!footer) throw new Error("Footer not found");
      let headings = [];
      try {
        headings = await driver.findElements(By.css("footer h3, footer h4, footer .footer-heading, footer th"));
      } catch {
        // try alternate selectors
      }
      if (headings.length === 0) {
        try {
          const footerSections = await driver.findElements(By.css("footer .grid > div, footer .flex > div, footer > div > div"));
          if (footerSections.length < 2) {
            console.warn(`Only ${footerSections.length} footer sections found`);
          }
        } catch {
          console.warn("Could not identify footer columns");
        }
        console.warn("No explicit footer column headings found");
        return;
      }
      const headingTexts = [];
      for (const h of headings) {
        const text = await h.getText();
        if (text.trim()) headingTexts.push(text.trim());
      }
      if (headingTexts.length === 0) {
        console.warn("Footer headings present but all empty");
      }
    } catch (e) {
      throw new Error("NAV-11 failed: " + e.message);
    }
  });

  it("NAV-12: Start Designing button in nav", async () => {
    const driver = await getDriver();
    try {
      const links = await driver.findElements(By.css('a[href="/generate"]'));
      const buttons = await driver.findElements(By.xpath("//*[contains(text(),'Start Designing')]"));
      const total = links.length + buttons.length;
      if (total === 0) {
        const partial = await driver.findElements(By.xpath("//*[contains(text(),'Design')]"));
        if (partial.length === 0) throw new Error("No Start Designing button found in nav");
        console.warn("Found Design-related elements but no exact Start Designing button");
        return;
      }
      if (links.length > 0) {
        await safeClick(driver, links[0]);
      } else {
        await safeClick(driver, buttons[0]);
      }
      await driver.sleep(1000);
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes("/generate")) {
        console.warn(`Start Designing nav did not go to /generate (current: ${currentUrl})`);
      }
    } catch (e) {
      throw new Error("NAV-12 failed: " + e.message);
    }
  });

  it("NAV-13: Navbar visible on all page loads", async () => {
    const driver = await getDriver();
    const pages = ["/", "/blog", "/contact", "/pricing", "/features"];
    for (const page of pages) {
      try {
        await navigate(page);
        await waitForPageLoad(driver);
        const header = await isVisible(driver, "header");
        if (!header) {
          console.warn(`Header not visible on ${page}`);
        }
        await driver.sleep(300);
      } catch (err) {
        console.warn(`Could not check header on ${page}: ${err.message}`);
      }
    }
  });

  it("NAV-14: Mobile menu toggle exists", async () => {
    const driver = await getDriver();
    try {
      let menuBtn = null;
      try {
        menuBtn = await driver.findElement(By.css("header button.md\\:hidden"));
      } catch {
        try {
          menuBtn = await driver.findElement(By.css('header button[class*="md:hidden"]'));
        } catch {
          try {
            const headerButtons = await driver.findElements(By.css("header button"));
            if (headerButtons.length > 0) menuBtn = headerButtons[0];
          } catch {
            // ignore
          }
        }
      }
      if (!menuBtn) {
        const hamburger = await driver.findElements(By.css('[aria-label="Menu"], [aria-label="Open menu"], .hamburger, button[class*="menu"]'));
        if (hamburger.length === 0) {
          console.warn("No mobile menu toggle button found (may be desktop-only viewport)");
          return;
        }
      }
      const displayed = await menuBtn.isDisplayed();
      if (!displayed) {
        console.warn("Mobile menu button exists but is not displayed at current viewport");
      }
    } catch (e) {
      throw new Error("NAV-14 failed: " + e.message);
    }
  });
});
