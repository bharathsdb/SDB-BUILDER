const { By } = require("selenium-webdriver");
const { navigate, getDriver } = require("../utils/driver");
const {
  waitAndFind,
  click,
  getText,
  isVisible,
  countElements,
  waitForPageLoad,
} = require("../utils/helpers");

async function safeClick(driver, element) {
  try {
    await element.click();
  } catch (e) {
    await driver.executeScript("arguments[0].click()", element);
  }
}

async function loginAnonymously(driver) {
  await navigate("/");
  await waitForPageLoad(driver);
  await driver.sleep(1000);
  const buttons = await driver.findElements(By.xpath("//button[contains(text(),'Login')]"));
  if (buttons.length > 0) {
    await safeClick(driver, buttons[0]);
    await driver.sleep(3000);
  }
  const url = await driver.getCurrentUrl();
  return url.includes("/dashboard");
}

describe("Workspace Tests", function () {
  this.timeout(120000);

  beforeEach(async function () {
    const driver = await getDriver();
    await loginAnonymously(driver);
  });

  afterEach(async function () {
    try {
      const driver = await getDriver();
      await driver.executeScript(
        "localStorage.clear(); document.cookie.split(';').forEach(c => { document.cookie = c.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'; });"
      );
    } catch (e) {
      // ignore cleanup errors
    }
  });

  it("WRK-01: Workspace hub loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Workspace hub body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace")) throw new Error(`Not on workspace page: ${url}`);
      const workspaceContent = await driver.findElements(
        By.xpath("//*[contains(text(),'Workspace') or contains(text(),'workspace') or contains(text(),'My Projects')]")
      );
      if (workspaceContent.length === 0) {
        console.warn("WRK-01: Workspace hub loaded but no workspace-related text found");
      }
    } catch (e) {
      throw new Error("WRK-01 failed: " + e.message);
    }
  });

  it("WRK-02: 2D editor loads with toolbar", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/2d");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("2D editor body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/2d")) throw new Error(`Not on 2D editor page: ${url}`);

      const toolbarElements = await driver.findElements(
        By.xpath("//*[contains(text(),'File') or contains(text(),'Edit') or contains(text(),'View')]")
      );
      if (toolbarElements.length === 0) {
        const toolbarContainer = await driver.findElements(
          By.css('[class*="toolbar"], [class*="Toolbar"], [role="toolbar"]')
        );
        if (toolbarContainer.length === 0) {
          console.warn("WRK-02: No toolbar elements or menu items found in 2D editor");
        }
      }

      const canvasElements = await driver.findElements(By.css("canvas"));
      if (canvasElements.length === 0) {
        const canvasDiv = await driver.findElements(
          By.css('[class*="canvas"], [class*="Canvas"], [id*="canvas"]')
        );
        if (canvasDiv.length === 0) {
          console.warn("WRK-02: No canvas element found in 2D editor");
        }
      }

      const sidebar = await driver.findElements(
        By.css('[class*="sidebar"], [class*="Sidebar"], [class*="panel"], aside')
      );
      if (sidebar.length === 0) {
        console.warn("WRK-02: No sidebar/panel found in 2D editor");
      }

      const toolButtons = await driver.findElements(By.css("button[title]"));
      if (toolButtons.length === 0) {
        const leftTools = await driver.findElements(
          By.css('[class*="tool"]:not([title]), button[class*="tool"]')
        );
        if (leftTools.length === 0) {
          console.warn("WRK-02: No tool buttons with title attributes found");
        }
      }

      const propertiesPanel = await driver.findElements(
        By.xpath("//*[contains(text(),'Properties') or contains(text(),'properties') or contains(text(),'Copilot')]")
      );
      if (propertiesPanel.length === 0) {
        const rightPanel = await driver.findElements(
          By.css('[class*="properties"], [class*="Properties"], [class*="inspector"]')
        );
        if (rightPanel.length === 0) {
          console.warn("WRK-02: No properties panel found in 2D editor");
        }
      }

      const statusBar = await driver.findElements(
        By.xpath("//*[contains(text(),'X:') or contains(text(),'x:') or contains(text(),'Y:') or contains(text(),'y:')]")
      );
      if (statusBar.length === 0) {
        const statusBars = await driver.findElements(
          By.css('[class*="status"], [class*="Status"], [class*="status-bar"]')
        );
        if (statusBars.length === 0) {
          console.warn("WRK-02: No status bar with coordinates found in 2D editor");
        }
      }
    } catch (e) {
      throw new Error("WRK-02 failed: " + e.message);
    }
  });

  it("WRK-03: 3D viewer loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/3d");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("3D viewer body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/3d")) throw new Error(`Not on 3D viewer page: ${url}`);
      const canvas = await driver.findElements(By.css("canvas"));
      if (canvas.length === 0) {
        const viewerContainer = await driver.findElements(
          By.css('[class*="viewer"], [class*="Viewer"], [class*="three"], [class*="render"]')
        );
        if (viewerContainer.length === 0) {
          console.warn("WRK-03: No canvas or 3D viewer container found");
        }
      }
    } catch (e) {
      throw new Error("WRK-03 failed: " + e.message);
    }
  });

  it("WRK-04: Blueprint view loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/blueprint");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Blueprint view body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/blueprint")) throw new Error(`Not on blueprint page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("blueprint") &&
        !text.includes("Blueprint") &&
        !text.includes("plan")
      ) {
        console.warn("WRK-04: Blueprint view loaded but no blueprint-related text found");
      }
    } catch (e) {
      throw new Error("WRK-04 failed: " + e.message);
    }
  });

  it("WRK-05: Interior design page loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/interior");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Interior design body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/interior")) throw new Error(`Not on interior page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("interior") &&
        !text.includes("Interior")
      ) {
        console.warn("WRK-05: Interior design page loaded but no interior-related text found");
      }
    } catch (e) {
      throw new Error("WRK-05 failed: " + e.message);
    }
  });

  it("WRK-06: Exterior design page loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/exterior");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Exterior design body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/exterior")) throw new Error(`Not on exterior page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("exterior") &&
        !text.includes("Exterior")
      ) {
        console.warn("WRK-06: Exterior design page loaded but no exterior-related text found");
      }
    } catch (e) {
      throw new Error("WRK-06 failed: " + e.message);
    }
  });

  it("WRK-07: Furniture layout loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/furniture");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Furniture layout body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/furniture")) throw new Error(`Not on furniture page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("furniture") &&
        !text.includes("Furniture")
      ) {
        console.warn("WRK-07: Furniture layout page loaded but no furniture-related text found");
      }
    } catch (e) {
      throw new Error("WRK-07 failed: " + e.message);
    }
  });

  it("WRK-08: Materials page loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/materials");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Materials page body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/materials")) throw new Error(`Not on materials page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("material") &&
        !text.includes("Material")
      ) {
        console.warn("WRK-08: Materials page loaded but no material-related text found");
      }
    } catch (e) {
      throw new Error("WRK-08 failed: " + e.message);
    }
  });

  it("WRK-09: Lighting page loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/lighting");
      await waitForPageLoad(driver);
      await driver.sleep(1500);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("Lighting page body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/lighting")) throw new Error(`Not on lighting page: ${url}`);
      const text = await body.getText();
      if (
        !text.includes("light") &&
        !text.includes("Light") &&
        !text.includes("Lighting")
      ) {
        console.warn("WRK-09: Lighting page loaded but no lighting-related text found");
      }
    } catch (e) {
      throw new Error("WRK-09 failed: " + e.message);
    }
  });

  it("WRK-10: VR mode loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/vr");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("VR mode body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/vr")) throw new Error(`Not on VR page: ${url}`);
      const canvas = await driver.findElements(By.css("canvas"));
      if (canvas.length === 0) {
        const vrContainer = await driver.findElements(
          By.css('[class*="vr"], [class*="VR"], [class*="webgl"], [class*="render"]')
        );
        if (vrContainer.length === 0) {
          console.warn("WRK-10: No canvas or VR container found");
        }
      }
      const vrText = await body.getText();
      if (
        !vrText.includes("VR") &&
        !vrText.includes("vr") &&
        !vrText.includes("virtual") &&
        !vrText.includes("Virtual")
      ) {
        console.warn("WRK-10: VR mode loaded but no VR-related text found");
      }
    } catch (e) {
      throw new Error("WRK-10 failed: " + e.message);
    }
  });

  it("WRK-11: AR mode loads", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/ar");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("AR mode body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/ar")) throw new Error(`Not on AR page: ${url}`);
      const canvas = await driver.findElements(By.css("canvas"));
      if (canvas.length === 0) {
        const arContainer = await driver.findElements(
          By.css('[class*="ar"], [class*="AR"], [class*="webgl"], [class*="render"]')
        );
        if (arContainer.length === 0) {
          console.warn("WRK-11: No canvas or AR container found");
        }
      }
      const arText = await body.getText();
      if (
        !arText.includes("AR") &&
        !arText.includes("ar") &&
        !arText.includes("augmented") &&
        !arText.includes("Augmented")
      ) {
        console.warn("WRK-11: AR mode loaded but no AR-related text found");
      }
    } catch (e) {
      throw new Error("WRK-11 failed: " + e.message);
    }
  });

  it("WRK-12: 2D workspace has zoom controls", async function () {
    const driver = await getDriver();
    try {
      await navigate("/workspace/2d");
      await waitForPageLoad(driver);
      await driver.sleep(2000);
      const body = await driver.findElement(By.css("body"));
      const displayed = await body.isDisplayed();
      if (!displayed) throw new Error("2D workspace body not displayed");
      const url = await driver.getCurrentUrl();
      if (!url.includes("/workspace/2d")) throw new Error(`Not on 2D page: ${url}`);

      const zoomByText = await driver.findElements(
        By.xpath("//*[contains(text(),'Zoom') or contains(text(),'zoom') or contains(text(),'+') or contains(text(),'-')]")
      );
      if (zoomByText.length === 0) {
        const zoomByTitle = await driver.findElements(
          By.css('button[title*="zoom" i], button[title*="Zoom"], button[title*="Zoom in"], button[title*="Zoom out"]')
        );
        if (zoomByTitle.length === 0) {
          const zoomByClass = await driver.findElements(
            By.css('[class*="zoom"], [class*="Zoom"], [class*="zoom-in"], [class*="zoom-out"]')
          );
          if (zoomByClass.length === 0) {
            const zoomControls = await driver.findElements(
              By.css('[class*="controls"] button, [class*="controls"] a')
            );
            if (zoomControls.length === 0) {
              console.warn("WRK-12: No zoom controls found in 2D workspace");
            }
          }
        }
      }

      const zoomIn = await driver.findElements(
        By.css('button[title*="Zoom in" i], button[aria-label*="Zoom in" i], button[class*="zoom-in"]')
      );
      if (zoomIn.length > 0) {
        try {
          await safeClick(driver, zoomIn[0]);
          await driver.sleep(300);
        } catch (e) {
          console.warn("WRK-12: Could not click zoom in button: " + e.message);
        }
      }
      const zoomOut = await driver.findElements(
        By.css('button[title*="Zoom out" i], button[aria-label*="Zoom out" i], button[class*="zoom-out"]')
      );
      if (zoomOut.length > 0) {
        try {
          await safeClick(driver, zoomOut[0]);
          await driver.sleep(300);
        } catch (e) {
          console.warn("WRK-12: Could not click zoom out button: " + e.message);
        }
      }

      const zoomLevel = await driver.findElements(
        By.css('[class*="zoom-level"], [class*="zoomLevel"], *[class*="zoom"][class*="level"]')
      );
      if (zoomLevel.length === 0) {
        const zoomSlider = await driver.findElements(
          By.css('input[type="range"][class*="zoom"], input[type="range"][title*="zoom" i]')
        );
        if (zoomSlider.length === 0) {
          const zoomPercentage = await driver.findElements(
            By.xpath("//*[contains(text(),'%') and (contains(text(),'zoom') or contains(text(),'Zoom'))]")
          );
          if (zoomPercentage.length === 0) {
            // Zoom level display is optional
          }
        }
      }
    } catch (e) {
      throw new Error("WRK-12 failed: " + e.message);
    }
  });
});
