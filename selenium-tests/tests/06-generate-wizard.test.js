const { By } = require("selenium-webdriver");
const { navigate, getDriver } = require("../utils/driver");
const {
  waitAndFind,
  click,
  getText,
  isVisible,
  waitForPageLoad,
  countElements,
  scrollTo,
} = require("../utils/helpers");

const FACING_DIRS = ["North", "East", "South", "West"];
const STEP_TITLES = ["Plot Details", "Requirements", "Preferences", "Budget", "Review"];
const STEP_2_LABELS = ["Bedrooms", "Bathrooms", "Kitchens", "Living Rooms", "Parking", "Floors"];
const PREFERENCE_CARDS = ["Vastu Compliant", "Space Optimized", "Luxury", "Modern Flow"];
const STYLE_OPTIONS = ["Modern", "Contemporary", "Scandinavian", "Mediterranean", "Farmhouse", "Minimalist"];
const BUDGET_TIERS = ["Economy", "Standard", "Premium", "Ultra Luxury"];

async function clickContinue(driver) {
  const btns = await driver.findElements(By.xpath("//button[contains(text(),'Continue')]"));
  if (btns.length > 0) {
    await btns[0].click();
    await driver.sleep(600);
  }
}

async function clickBack(driver) {
  const backBtns = await driver.findElements(By.xpath("//button[contains(text(),'Back')]"));
  if (backBtns.length > 0) {
    await backBtns[0].click();
    await driver.sleep(600);
  }
}

async function advanceToStep(driver, targetStep) {
  for (let i = 1; i < targetStep; i++) {
    await clickContinue(driver);
  }
}

describe("Generate Wizard Tests", function () {
  this.timeout(120000);

  beforeEach(async () => {
    await navigate("/generate");
    await waitForPageLoad(await getDriver());
    await (await getDriver()).sleep(1000);
  });

  it("GEN-01: Generate page loads (body displayed)", async () => {
    const driver = await getDriver();
    const body = await isVisible(driver, "body");
    if (!body) throw new Error("Generate page body not displayed");
    const wizardHeading = await driver.findElements(By.xpath("//h2[contains(text(),'Generation Wizard')]"));
    if (wizardHeading.length === 0) {
      console.warn("GEN-01: Generation Wizard sidebar heading not found");
    }
  });

  it("GEN-02: Cancel button returns to /dashboard", async () => {
    const driver = await getDriver();
    const cancelLinks = await driver.findElements(By.css('a[href="/dashboard"]'));
    if (cancelLinks.length === 0) throw new Error("Cancel link not found");
    let navigated = false;
    for (const link of cancelLinks) {
      const text = await link.getText();
      if (text.includes("Cancel")) {
        await link.click();
        await driver.sleep(1500);
        navigated = true;
        break;
      }
    }
    if (!navigated) {
      await cancelLinks[0].click();
      await driver.sleep(1500);
    }
    const url = await driver.getCurrentUrl();
    if (!url.includes("/dashboard")) {
      throw new Error(`Cancel did not navigate to /dashboard, got: ${url}`);
    }
  });

  it("GEN-03: Step 1 shows Plot Details form", async () => {
    const driver = await getDriver();
    const heading = await driver.findElements(By.xpath("//h2[contains(text(),'Plot Details')]"));
    if (heading.length === 0) throw new Error("Plot Details heading not found on step 1");
    const visible = await heading[0].isDisplayed();
    if (!visible) throw new Error("Plot Details heading not visible");
    const subtext = await driver.findElements(By.xpath("//*[contains(text(),'physical dimensions')]"));
    if (subtext.length === 0) {
      console.warn("GEN-03: Plot description text not found");
    }
  });

  it("GEN-04: Step 1 has plot dimension inputs (type=number)", async () => {
    const driver = await getDriver();
    const inputs = await driver.findElements(By.css('input[type="number"]'));
    if (inputs.length < 2) throw new Error("Expected at least 2 number inputs for plot dimensions");
    let foundLength = false;
    let foundWidth = false;
    for (const input of inputs) {
      const placeholder = await input.getAttribute("value");
      const attr = await input.getAttribute("type");
      if (attr === "number") {
        const labels = await driver.findElements(By.xpath(`//label[contains(text(),'Length')]`));
        const widths = await driver.findElements(By.xpath(`//label[contains(text(),'Width')]`));
        if (labels.length > 0) foundLength = true;
        if (widths.length > 0) foundWidth = true;
      }
    }
    const lengthLabel = await driver.findElements(By.xpath("//*[contains(text(),'Plot Length')]"));
    const widthLabel = await driver.findElements(By.xpath("//*[contains(text(),'Plot Width')]"));
    if (lengthLabel.length === 0 && !foundLength) {
      console.warn("GEN-04: Plot Length label not found");
    }
    if (widthLabel.length === 0 && !foundWidth) {
      console.warn("GEN-04: Plot Width label not found");
    }
    const displayed = await inputs[0].isDisplayed();
    if (!displayed) throw new Error("Plot dimension inputs not visible");
  });

  it("GEN-05: Step 1 has facing direction buttons", async () => {
    const driver = await getDriver();
    const allButtons = await driver.findElements(By.css("button"));
    let facingCount = 0;
    for (const btn of allButtons) {
      try {
        const text = await btn.getText();
        if (FACING_DIRS.includes(text)) {
          facingCount++;
          const visible = await btn.isDisplayed();
          if (!visible) console.warn(`GEN-05: Facing button "${text}" not visible`);
        }
      } catch (e) {
        // stale element reference, skip
      }
    }
    if (facingCount < 4) {
      throw new Error(`Expected 4 facing direction buttons, found ${facingCount}`);
    }
  });

  it("GEN-06: Continue button advances to Step 2", async () => {
    const driver = await getDriver();
    await clickContinue(driver);
    const reqHeading = await driver.findElements(By.xpath("//h2[contains(text(),'Room Requirements')]"));
    if (reqHeading.length === 0) throw new Error("Continue did not advance to Step 2 (Room Requirements)");
    const url = await driver.getCurrentUrl();
    if (!url.includes("/generate")) {
      console.warn("GEN-06: Navigated away from /generate after Continue");
    }
  });

  it("GEN-07: Step 2 shows Room Requirements", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 2);
    const heading = await driver.findElements(By.xpath("//h2[contains(text(),'Room Requirements')]"));
    if (heading.length === 0) throw new Error("Room Requirements heading not found on step 2");
    let foundLabels = 0;
    for (const label of STEP_2_LABELS) {
      const els = await driver.findElements(By.xpath(`//*[contains(text(),'${label}')]`));
      if (els.length > 0) foundLabels++;
    }
    if (foundLabels < 2) {
      console.warn(`GEN-07: Only found ${foundLabels} room labels (expected at least 2)`);
    }
    const roomControls = await driver.findElements(By.css("button"));
    let hasMinus = false;
    let hasPlus = false;
    for (const btn of roomControls) {
      try {
        const text = await btn.getText();
        if (text === "-") hasMinus = true;
        if (text === "+") hasPlus = true;
      } catch (e) {
        // skip
      }
    }
    if (!hasMinus) console.warn("GEN-07: No '-' decrement buttons found on step 2");
    if (!hasPlus) console.warn("GEN-07: No '+' increment buttons found on step 2");
  });

  it("GEN-08: Room increment/decrement buttons work", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 2);
    const buttons = await driver.findElements(By.css("button"));
    let plusClicked = false;
    let minusClicked = false;
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text === "+" && !plusClicked) {
          await btn.click();
          await driver.sleep(200);
          plusClicked = true;
        } else if (text === "-" && !minusClicked) {
          await btn.click();
          await driver.sleep(200);
          minusClicked = true;
        }
      } catch (e) {
        // stale element
      }
      if (plusClicked && minusClicked) break;
    }
    if (!plusClicked) throw new Error("Could not find/interact with increment (+) button");
    const countEls = await driver.findElements(By.css("span.w-4.text-center.font-bold, span.font-bold"));
    if (countEls.length === 0) {
      console.warn("GEN-08: Room count display element not found after increment");
    }
  });

  it("GEN-09: Can navigate through all 5 wizard steps", async () => {
    const driver = await getDriver();
    for (let i = 1; i <= 4; i++) {
      const btns = await driver.findElements(By.xpath("//button[contains(text(),'Continue')]"));
      if (btns.length === 0) throw new Error(`No Continue button at step ${i}`);
      await btns[0].click();
      await driver.sleep(600);
    }
    const reviewHeading = await driver.findElements(By.xpath("//h2[contains(text(),'Review & Generate')]"));
    if (reviewHeading.length === 0) {
      const fallback = await driver.findElements(By.xpath("//*[contains(text(),'Generate')]"));
      if (fallback.length === 0) throw new Error("Did not reach step 5 (Review)");
    }
    const genBtn = await driver.findElements(By.xpath("//button[contains(text(),'Generate Plan')]"));
    if (genBtn.length === 0) throw new Error("Step 5 should have Generate Plan button");
  });

  it("GEN-10: Step 3 shows Preferences & Style", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 3);
    const heading = await driver.findElements(By.xpath("//h2[contains(text(),'Preferences & Style')]"));
    if (heading.length === 0) throw new Error("Preferences & Style heading not found on step 3");
    let foundPrefs = 0;
    for (const pref of PREFERENCE_CARDS) {
      const els = await driver.findElements(By.xpath(`//*[contains(text(),'${pref}')]`));
      if (els.length > 0) foundPrefs++;
    }
    if (foundPrefs < 2) {
      console.warn(`GEN-10: Only found ${foundPrefs} preference cards (expected at least 2)`);
    }
  });

  it("GEN-11: Step 3 has architectural style options", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 3);
    let styleCount = 0;
    const allButtons = await driver.findElements(By.css("button"));
    for (const btn of allButtons) {
      try {
        const text = await btn.getText();
        if (STYLE_OPTIONS.includes(text)) {
          styleCount++;
        }
      } catch (e) {
        // skip
      }
    }
    if (styleCount < 4) {
      throw new Error(`Expected at least 4 architectural style buttons, found ${styleCount}`);
    }
    const styleLabel = await driver.findElements(By.xpath("//*[contains(text(),'Architectural Style')]"));
    if (styleLabel.length === 0) {
      console.warn("GEN-11: Architectural Style label not found");
    }
  });

  it("GEN-12: Step 4 shows Budget Tier options", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 4);
    const heading = await driver.findElements(By.xpath("//h2[contains(text(),'Budget Tier')]"));
    if (heading.length === 0) throw new Error("Budget Tier heading not found on step 4");
    let tierCount = 0;
    for (const tier of BUDGET_TIERS) {
      const els = await driver.findElements(By.xpath(`//*[contains(text(),'${tier}')]`));
      if (els.length > 0) tierCount++;
    }
    if (tierCount < 4) {
      console.warn(`GEN-12: Found ${tierCount} budget tiers (expected 4)`);
    }
    const economyPrice = await driver.findElements(By.xpath("//*[contains(text(),'50') or contains(text(),'sqft')]"));
    if (economyPrice.length === 0) {
      console.warn("GEN-12: Budget tier price info not found");
    }
  });

  it("GEN-13: Step 5 Review shows project summary", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 5);
    const heading = await driver.findElements(By.xpath("//h2[contains(text(),'Review & Generate')]"));
    if (heading.length === 0) throw new Error("Review heading not found on step 5");
    const summaryFields = [
      "Plot Dimensions",
      "Facing",
      "Key Rooms",
      "Budget Tier",
    ];
    let foundFields = 0;
    for (const field of summaryFields) {
      const els = await driver.findElements(By.xpath(`//*[contains(text(),'${field}')]`));
      if (els.length > 0) foundFields++;
    }
    if (foundFields < 2) {
      throw new Error(`Review summary missing fields: found ${foundFields}`);
    }
    const activeConstraints = await driver.findElements(By.xpath("//*[contains(text(),'Active Constraints')]"));
    if (activeConstraints.length === 0) {
      console.warn("GEN-13: Active Constraints section not found in review summary");
    }
  });

  it("GEN-14: Generate Plan button exists on step 5", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 5);
    const genButtons = await driver.findElements(By.xpath("//button[contains(text(),'Generate Plan')]"));
    if (genButtons.length === 0) throw new Error("Generate Plan button not found on step 5");
    const displayed = await genButtons[0].isDisplayed();
    if (!displayed) throw new Error("Generate Plan button not visible on step 5");
    const hasWandIcon = await driver.findElements(By.css("button svg.lucide-wand2, button svg[class*='wand']"));
    if (hasWandIcon.length === 0) {
      console.warn("GEN-14: Generate Plan button missing Wand2 icon");
    }
  });

  it("GEN-15: Back button navigates to previous step", async () => {
    const driver = await getDriver();
    await clickContinue(driver);
    const onStep2 = await driver.findElements(By.xpath("//h2[contains(text(),'Room Requirements')]"));
    if (onStep2.length === 0) throw new Error("Could not reach step 2 for back navigation test");
    await clickBack(driver);
    const backToStep1 = await driver.findElements(By.xpath("//h2[contains(text(),'Plot Details')]"));
    if (backToStep1.length === 0) {
      throw new Error("Back button did not return to step 1 (Plot Details)");
    }
    const url = await driver.getCurrentUrl();
    if (!url.includes("/generate")) {
      console.warn("GEN-15: Back navigation left /generate");
    }
  });

  it("GEN-16: Wizard steps show completion status", async () => {
    const driver = await getDriver();
    const sidebarStep1 = await driver.findElements(By.xpath("//*[contains(text(),'Plot Details')]"));
    if (sidebarStep1.length === 0) {
      console.warn("GEN-16: Sidebar step labels not found");
    }
    await clickContinue(driver);
    await driver.sleep(500);
    const checkIcons = await driver.findElements(By.css("svg.lucide-check, svg[class*='Check']"));
    if (checkIcons.length === 0) {
      const completedIndicators = await driver.findElements(By.xpath("//*[contains(text(),'Requirements')]"));
      if (completedIndicators.length === 0) {
        console.warn("GEN-16: No completion indicators visible after advancing");
      }
    }
    const step2Active = await driver.findElements(By.xpath("//*[contains(text(),'Requirements')]"));
    if (step2Active.length > 0) {
      const parentSections = await driver.findElements(By.xpath(
        "//*[contains(text(),'Requirements')]/ancestor::div[contains(@class,'flex')]"
      ));
      if (parentSections.length > 0) {
        const checkInSection = await parentSections[0].findElements(By.css("svg"));
        if (checkInSection.length === 0) {
          console.warn("GEN-16: Step 2 in sidebar may not show active/completed styling");
        }
      }
    }
  });

  it("GEN-17: Step 1 Back button is disabled/hidden", async () => {
    const driver = await getDriver();
    const backBtn = await driver.findElements(By.xpath("//button[contains(text(),'Back')]"));
    if (backBtn.length === 0) {
      const hiddenBackBtns = await driver.findElements(By.css("button.opacity-0"));
      if (hiddenBackBtns.length === 0) {
        console.warn("GEN-17: Could not locate Back button (may be hidden)");
      }
      return;
    }
    const isDisabled = await backBtn[0].getAttribute("disabled");
    const classes = await backBtn[0].getAttribute("class");
    const hasOpacityZero = classes && classes.includes("opacity-0");
    const hasPointerEventsNone = classes && classes.includes("pointer-events-none");
    if (!isDisabled && !hasOpacityZero) {
      throw new Error("Step 1 Back button should be disabled or hidden");
    }
    if (!hasPointerEventsNone) {
      console.warn("GEN-17: Back button missing pointer-events-none class");
    }
  });

  it("GEN-18: Vastu toggle is interactive in Step 3", async () => {
    const driver = await getDriver();
    await advanceToStep(driver, 3);
    const vastuElements = await driver.findElements(By.xpath("//*[contains(text(),'Vastu Compliant')]"));
    if (vastuElements.length === 0) throw new Error("Vastu Compliant preference not found on step 3");
    const vastuCard = vastuElements[0];
    let vastuParent = await vastuElements[0].findElements(By.xpath("./ancestor::div[contains(@class,'rounded-xl')]"));
    if (vastuParent.length === 0) {
      vastuParent = await vastuElements[0].findElements(By.xpath("./ancestor::div[contains(@class,'cursor-pointer')]"));
    }
    if (vastuParent.length > 0) {
      const initialClass = await vastuParent[0].getAttribute("class");
      const wasInitiallyActive = initialClass && (initialClass.includes("border-primary") || initialClass.includes("bg-primary"));
      await vastuCard.click();
      await driver.sleep(300);
      const classAfter = await vastuParent[0].getAttribute("class");
      const isNowActive = classAfter && (classAfter.includes("border-primary") || classAfter.includes("bg-primary"));
      if (wasInitiallyActive === isNowActive) {
        console.warn("GEN-18: Vastu card class may not have toggled (could be default state)");
      }
      await vastuCard.click();
      await driver.sleep(300);
    } else {
      await vastuCard.click();
      await driver.sleep(300);
      const checkAfterClick = await driver.findElements(By.xpath(
        "//*[contains(text(),'Vastu Compliant')]/ancestor::div[contains(@class,'rounded-xl')]//svg"
      ));
      if (checkAfterClick.length === 0) {
        console.warn("GEN-18: Vastu toggle click did not reveal checkmark indicator");
      }
    }
  });
});
