const { Builder, Browser } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let driverInstance = null;

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");
  options.addArguments("--disable-features=ChromeWhatsNewUI");
  options.addArguments("--disable-features=TranslateUI");
  options.addArguments("--disable-sync");
  options.addArguments("--disable-background-networking");
  const os = require("os");
  options.addArguments("--user-data-dir=" + require("path").join(os.tmpdir(), "selenium-chrome-profile-" + Date.now()));
  options.setPageLoadStrategy("eager");

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  driverInstance = driver;
  return driver;
}

async function getDriver() {
  if (!driverInstance) {
    driverInstance = await createDriver();
  }
  return driverInstance;
}

async function quitDriver() {
  if (driverInstance) {
    try {
      await driverInstance.quit();
    } catch (e) {
      // ignore
    }
    driverInstance = null;
  }
}

async function navigate(path = "") {
  const driver = await getDriver();
  const url = `${BASE_URL}${path}`;
  await driver.get(url);
  await driver.sleep(1000);
  return driver;
}

function getBaseUrl() {
  return BASE_URL;
}

module.exports = {
  createDriver,
  getDriver,
  quitDriver,
  navigate,
  getBaseUrl,
};
