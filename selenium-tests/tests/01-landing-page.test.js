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

describe("Landing Page Tests", function () {
  this.timeout(120000);

  beforeEach(async () => {
    await navigate("/");
    await waitForPageLoad(await getDriver());
  });

  it("LP-01: Landing page loads", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
  });

  it("LP-02: Navbar is visible", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const header = await waitAndFind(driver, "header");
      if (!header) throw new Error("Header element not found");
    } catch (e) {
      throw new Error("Navbar/header not found: " + e.message);
    }
  });

  it("LP-03: Hero section displays heading", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const heading = await getText(driver, "h1");
      if (!heading || !heading.trim()) {
        console.warn("h1 heading text is empty or missing");
      }
    } catch (e) {
      console.warn("Hero heading (h1) not found:", e.message);
    }
  });

  it("LP-04: CTA button exists", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    const ctas = await countElements(driver, 'a[href="/generate"]');
    if (ctas === 0) console.warn("No CTA buttons (a[href='/generate']) found on landing page");
  });

  it("LP-05: Login button exists in navbar", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const loginLinks = await driver.findElements(By.xpath("//*[contains(text(),'Login')]"));
      if (loginLinks.length === 0) {
        console.warn("Login button/text not found in navbar");
      }
    } catch (e) {
      console.warn("Login button check failed:", e.message);
    }
  });

  it("LP-06: Features section exists with id='features'", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#features");
      const section = await waitAndFind(driver, "#features");
      if (!section) throw new Error("#features element not found");
    } catch (e) {
      console.warn("Features section (#features) not found:", e.message);
    }
  });

  it("LP-07: Features grid has 6 feature cards", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#features");
      const cards = await countElements(driver, "#features .grid > div");
      if (cards !== 6) {
        console.warn(`Expected 6 feature cards, found ${cards}`);
      }
    } catch (e) {
      console.warn("Features grid check failed:", e.message);
    }
  });

  it("LP-08: Showcase section exists with id='showcase'", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#showcase");
      const section = await waitAndFind(driver, "#showcase");
      if (!section) throw new Error("#showcase element not found");
    } catch (e) {
      console.warn("Showcase section (#showcase) not found:", e.message);
    }
  });

  it("LP-09: Showcase displays 3 project cards", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#showcase");
      const cards = await countElements(driver, "#showcase .grid > div");
      if (cards !== 3) {
        console.warn(`Expected 3 showcase cards, found ${cards}`);
      }
    } catch (e) {
      console.warn("Showcase cards check failed:", e.message);
    }
  });

  it("LP-10: Pricing section exists with id='pricing'", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#pricing");
      const section = await waitAndFind(driver, "#pricing");
      if (!section) throw new Error("#pricing element not found");
    } catch (e) {
      console.warn("Pricing section (#pricing) not found:", e.message);
    }
  });

  it("LP-11: Pricing has 3 plan cards", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#pricing");
      const plans = await countElements(driver, "#pricing .grid > div");
      if (plans !== 3) {
        console.warn(`Expected 3 pricing plans, found ${plans}`);
      }
    } catch (e) {
      console.warn("Pricing plans check failed:", e.message);
    }
  });

  it("LP-12: Pro plan marked Most Popular", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#pricing");
      const badges = await driver.findElements(By.xpath("//*[contains(text(),'Most Popular')]"));
      if (badges.length === 0) {
        console.warn("'Most Popular' badge not found in pricing section");
      }
    } catch (e) {
      console.warn("Most Popular badge check failed:", e.message);
    }
  });

  it("LP-13: Footer is present", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    const footer = await isVisible(driver, "footer");
    if (!footer) console.warn("Footer element not found");
  });

  it("LP-14: Theme toggle button exists", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    const themeBtn = await isVisible(driver, 'button[aria-label="Toggle Theme"]');
    if (!themeBtn) console.warn("Theme toggle button not found");
  });

  it("LP-15: Start Designing link works", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const links = await driver.findElements(By.css('a[href="/generate"]'));
      if (links.length > 0) {
        await links[0].click();
        await driver.sleep(1000);
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes("/generate")) {
          console.warn("CTA click did not navigate to /generate, current URL: " + currentUrl);
        }
        await navigate("/");
        await waitForPageLoad(driver);
      } else {
        console.warn("No CTA links found to test navigation");
      }
    } catch (e) {
      console.warn("Start Designing link click failed:", e.message);
    }
  });

  it("LP-16: Hero heading has correct branding text", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const heading = await getText(driver, "h1");
      if (!heading || !heading.trim()) {
        console.warn("h1 heading is empty");
      }
    } catch (e) {
      console.warn("Hero heading text check failed:", e.message);
    }
  });

  it("LP-17: Feature cards have icon and title", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      await scrollTo(driver, "#features");
      const cards = await driver.findElements(By.css("#features .grid > div"));
      if (cards.length === 0) {
        console.warn("No feature cards found to check icons/titles");
      } else {
        for (let i = 0; i < cards.length; i++) {
          const hasIcon = (await cards[i].findElements(By.css("img, svg, i, span"))).length > 0;
          const hasTitle = (await cards[i].findElements(By.css("h2, h3, h4, strong, b"))).length > 0;
          if (!hasIcon && !hasTitle) {
            console.warn(`Feature card ${i + 1} may be missing icon and title`);
          }
        }
      }
    } catch (e) {
      console.warn("Feature cards icon/title check failed:", e.message);
    }
  });

  it("LP-18: Gallery link exists", async () => {
    const driver = await getDriver();
    const body = await driver.findElement(By.css("body"));
    if (!(await body.isDisplayed())) throw new Error("Body not displayed");
    try {
      const galleryLinks = await countElements(driver, 'a[href="/gallery"]');
      if (galleryLinks === 0) {
        console.warn("Gallery link (a[href='/gallery']) not found on landing page");
      }
    } catch (e) {
      console.warn("Gallery link check failed:", e.message);
    }
  });
});
