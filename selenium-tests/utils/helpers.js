const { By, until } = require("selenium-webdriver");

async function waitAndFind(driver, cssSelector, timeout = 10000) {
  const element = await driver.wait(
    until.elementLocated(By.css(cssSelector)),
    timeout,
    `Element not found: ${cssSelector}`
  );
  await driver.wait(
    until.elementIsVisible(element),
    timeout,
    `Element not visible: ${cssSelector}`
  );
  return element;
}

async function waitAndFindAll(driver, cssSelector, timeout = 10000) {
  await driver.wait(
    until.elementLocated(By.css(cssSelector)),
    timeout,
    `Elements not found: ${cssSelector}`
  );
  return driver.findElements(By.css(cssSelector));
}

async function click(driver, cssSelector) {
  const element = await waitAndFind(driver, cssSelector);
  await element.click();
  return element;
}

async function type(driver, cssSelector, text) {
  const element = await waitAndFind(driver, cssSelector);
  await element.clear();
  await element.sendKeys(text);
  return element;
}

async function getText(driver, cssSelector) {
  const element = await waitAndFind(driver, cssSelector);
  return element.getText();
}

async function isVisible(driver, cssSelector) {
  try {
    const element = await driver.findElement(By.css(cssSelector));
    return await element.isDisplayed();
  } catch {
    return false;
  }
}

async function countElements(driver, cssSelector) {
  try {
    const elements = await driver.findElements(By.css(cssSelector));
    return elements.length;
  } catch {
    return 0;
  }
}

async function waitForPageLoad(driver) {
  await driver.wait(
    async () => {
      const state = await driver.executeScript("return document.readyState");
      return state === "complete";
    },
    15000,
    "Page did not load"
  );
  await driver.sleep(500);
}

async function waitForTitle(driver, expectedTitle, timeout = 10000) {
  await driver.wait(
    until.titleIs(expectedTitle),
    timeout,
    `Title did not match: ${expectedTitle}`
  );
}

async function scrollTo(driver, cssSelector) {
  const element = await waitAndFind(driver, cssSelector);
  await driver.executeScript("arguments[0].scrollIntoView(true);", element);
  await driver.sleep(500);
  return element;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function takeScreenshot(driver, name) {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(__dirname, "..", "reports", "screenshots");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = await driver.takeScreenshot();
  const filePath = path.join(dir, `${name}.png`);
  fs.writeFileSync(filePath, data, "base64");
  return filePath;
}

module.exports = {
  waitAndFind,
  waitAndFindAll,
  click,
  type,
  getText,
  isVisible,
  countElements,
  waitForPageLoad,
  waitForTitle,
  scrollTo,
  sleep,
  takeScreenshot,
};
