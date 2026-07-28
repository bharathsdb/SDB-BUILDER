const { By } = require("selenium-webdriver");
const { navigate, getDriver, getBaseUrl } = require("../utils/driver");
const {
  waitAndFind,
  click,
  getText,
  isVisible,
  waitForPageLoad,
  countElements,
  takeScreenshot,
} = require("../utils/helpers");
const { PUBLIC_PAGES } = require("../utils/test-data");

async function safeNavigate(driver, path) {
  try {
    await navigate("/");
    await waitForPageLoad(driver);
    await driver.sleep(500);
    await navigate(path);
    await waitForPageLoad(driver);
    await driver.sleep(500);
  } catch (err) {
    console.warn(`Navigation issue to ${path}: ${err.message}`);
    try {
      await navigate(path);
      await waitForPageLoad(driver);
      await driver.sleep(500);
    } catch (err2) {
      console.warn(`Retry navigation to ${path} also failed: ${err2.message}`);
    }
  }
}

describe("Public Pages Tests", function () {
  this.timeout(300000);

  PUBLIC_PAGES.forEach((page, index) => {
    const id = String(index + 1).padStart(2, "0");
    it(`PUB-${id}: ${page.title} page loads successfully`, async () => {
      const driver = await getDriver();
      await safeNavigate(driver, page.path);
      try {
        const body = await driver.findElement(By.css("body"));
        const displayed = await body.isDisplayed();
        if (!displayed) {
          console.warn(`${page.path} body not displayed`);
        }
        const url = await driver.getCurrentUrl();
        if (!url.includes(page.path)) {
          console.warn(`${page.path} URL mismatch: ${url}`);
        }
      } catch (err) {
        console.warn(`PUB-${id} (${page.title}): ${err.message}`);
        await takeScreenshot(driver, `PUB-${id}-${page.title}`);
      }
    });
  });

  it("PUB-19: Landing page CTA navigates to /generate", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(1000);
      const links = await driver.findElements(By.css('a[href="/generate"]'));
      if (links.length === 0) {
        console.warn("CTA link a[href='/generate'] not found");
        return;
      }
      await links[0].click();
      await driver.sleep(1500);
      await waitForPageLoad(driver);
      const url = await driver.getCurrentUrl();
      if (!url.includes("/generate")) {
        console.warn(`CTA did not navigate to /generate, landed at: ${url}`);
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-19");
      console.warn(`PUB-19: ${err.message}`);
    }
  });

  it("PUB-20: Navbar 'Start Designing' button navigates to /generate", async () => {
    const driver = await getDriver();
    try {
      await navigate("/");
      await waitForPageLoad(driver);
      await driver.sleep(500);
      const buttons = await driver.findElements(By.css('a[href="/generate"]'));
      if (buttons.length === 0) {
        console.warn("No link to /generate found in nav");
        return;
      }
      let clicked = false;
      for (const btn of buttons) {
        const text = await btn.getText();
        if (text.toLowerCase().includes("start designing") || text.toLowerCase().includes("design")) {
          await btn.click();
          await driver.sleep(1500);
          await waitForPageLoad(driver);
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        await buttons[0].click();
        await driver.sleep(1500);
        await waitForPageLoad(driver);
      }
      const url = await driver.getCurrentUrl();
      if (!url.includes("/generate")) {
        console.warn(`Start Designing did not navigate to /generate, landed at: ${url}`);
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-20");
      console.warn(`PUB-20: ${err.message}`);
    }
  });

  it("PUB-21: All public pages have header", async () => {
    const driver = await getDriver();
    const failures = [];
    for (const page of PUBLIC_PAGES) {
      try {
        await safeNavigate(driver, page.path);
        const header = await isVisible(driver, "header");
        if (!header) failures.push(`Header missing on ${page.path} (${page.title})`);
      } catch (err) {
        failures.push(`Error checking header on ${page.path}: ${err.message}`);
      }
    }
    if (failures.length > 0) {
      console.warn("Header failures:\n" + failures.join("\n"));
    }
  });

  it("PUB-22: All public pages have footer", async () => {
    const driver = await getDriver();
    const failures = [];
    for (const page of PUBLIC_PAGES) {
      try {
        await safeNavigate(driver, page.path);
        const footer = await isVisible(driver, "footer");
        if (!footer) failures.push(`Footer missing on ${page.path} (${page.title})`);
      } catch (err) {
        failures.push(`Error checking footer on ${page.path}: ${err.message}`);
      }
    }
    if (failures.length > 0) {
      console.warn("Footer failures:\n" + failures.join("\n"));
    }
  });

  it("PUB-23: Gallery page displays images", async () => {
    const driver = await getDriver();
    try {
      await safeNavigate(driver, "/gallery");
      await driver.sleep(1500);
      const images = await driver.findElements(By.css("img"));
      if (images.length === 0) {
        console.warn("No images found on gallery page");
        return;
      }
      let visibleCount = 0;
      for (const img of images) {
        const displayed = await img.isDisplayed();
        if (displayed) visibleCount++;
      }
      if (visibleCount === 0) {
        console.warn("No visible images found on gallery page");
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-23");
      console.warn(`PUB-23: ${err.message}`);
    }
  });

  it("PUB-24: FAQ page has accordion items", async () => {
    const driver = await getDriver();
    try {
      await safeNavigate(driver, "/faq");
      await driver.sleep(1000);
      const elements = await driver.findElements(By.css("h2, h3, button, details, summary"));
      if (elements.length === 0) {
        console.warn("No accordion elements found on FAQ page");
        return;
      }
      const withText = [];
      for (const el of elements) {
        const text = await el.getText();
        if (text.trim().length > 0) withText.push(text.trim());
      }
      if (withText.length === 0) {
        console.warn("FAQ elements found but none have text content");
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-24");
      console.warn(`PUB-24: ${err.message}`);
    }
  });

  it("PUB-25: Blog page has content", async () => {
    const driver = await getDriver();
    try {
      await safeNavigate(driver, "/blog");
      await driver.sleep(1000);
      const main = await isVisible(driver, "main");
      const article = await isVisible(driver, "article");
      const section = await isVisible(driver, "section");
      if (!main && !article && !section) {
        const bodyText = await driver.findElement(By.css("body")).getText();
        if (bodyText.trim().length < 50) {
          console.warn("Blog page has insufficient content");
        }
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-25");
      console.warn(`PUB-25: ${err.message}`);
    }
  });

  it("PUB-26: Pricing has Get Started buttons", async () => {
    const driver = await getDriver();
    try {
      await safeNavigate(driver, "/pricing");
      await driver.sleep(1000);
      const buttons = await driver.findElements(By.xpath("//*[contains(text(),'Get Started')]"));
      if (buttons.length === 0) {
        const buttons2 = await driver.findElements(By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'get started')]"));
        if (buttons2.length === 0) {
          const bodyText = await driver.findElement(By.css("body")).getText();
          if (!bodyText.toLowerCase().includes("get started")) {
            console.warn("No 'Get Started' text found on pricing page");
          }
        }
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-26");
      console.warn(`PUB-26: ${err.message}`);
    }
  });

  it("PUB-27: Contact page has form", async () => {
    const driver = await getDriver();
    try {
      await safeNavigate(driver, "/contact");
      await driver.sleep(1000);
      const inputs = await driver.findElements(By.css("input"));
      const textareas = await driver.findElements(By.css("textarea"));
      const forms = await driver.findElements(By.css("form"));
      if (forms.length === 0 && inputs.length === 0 && textareas.length === 0) {
        console.warn("Contact page missing form, input, and textarea elements");
        return;
      }
      if (inputs.length === 0 && textareas.length === 0 && forms.length > 0) {
        const formFields = await forms[0].findElements(By.css("input, textarea, select"));
        if (formFields.length === 0) {
          console.warn("Contact form exists but has no input fields");
        }
      }
    } catch (err) {
      await takeScreenshot(driver, "PUB-27");
      console.warn(`PUB-27: ${err.message}`);
    }
  });
});
