const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const RESULTS_FILE = path.join(__dirname, "reports", "results.json");
const OUTPUT_DIR = path.join(__dirname, "reports");

function makeTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-");
}

function generateReport() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`Results file not found: ${RESULTS_FILE}`);
    console.error("Run tests first: npm test");
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const OUTPUT_FILE = path.join(OUTPUT_DIR, `E2E_Test_Report_PlanCraftAI_${makeTimestamp()}.xlsx`);

  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Summary ---
  const summaryData = [
    {
      "Test Suite": "PlanCraftAI Web App — Full E2E Workflow",
      "Total Tests": results.totalTests,
      Passed: results.totalPassed,
      Failed: results.totalFailed,
      "Pass Rate %": results.passRate,
      "Duration (sec)": results.durationSec.toFixed(2),
      "Start Time": results.startTime,
      "End Time": results.endTime,
    },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  summaryWs["!cols"] = [
    { wch: 45 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 30 },
  ];

  // --- Sheet 2: Passed Tests ---
  let passedCounter = 0;
  const passedRows = [];
  for (const suite of results.suites) {
    for (const test of suite.tests) {
      if (test.status === "PASS") {
        passedCounter++;
        passedRows.push({
          "No.": passedCounter,
          "Category": suite.suite.replace("tests/", "").replace(".test.js", ""),
          "Test Name": test.title,
          "Time (sec)": (test.duration / 1000).toFixed(2),
          "Status": "PASSED",
        });
      }
    }
  }

  if (passedRows.length > 0) {
    const passedWs = XLSX.utils.json_to_sheet(passedRows);
    XLSX.utils.book_append_sheet(wb, passedWs, "Passed Tests");
    passedWs["!cols"] = [
      { wch: 8 }, { wch: 35 }, { wch: 70 }, { wch: 12 }, { wch: 10 },
    ];
  }

  // --- Sheet 3: Failed Tests ---
  let failedCounter = 0;
  const failedRows = [];
  for (const suite of results.suites) {
    for (const test of suite.tests) {
      if (test.status === "FAIL") {
        failedCounter++;
        failedRows.push({
          "No.": failedCounter,
          "Category": suite.suite.replace("tests/", "").replace(".test.js", ""),
          "Test Name": test.title,
          "Error": test.error || "Unknown error",
          "Status": "FAILED",
          "Timestamp": new Date().toISOString(),
        });
      }
    }
  }

  if (failedRows.length > 0) {
    const failedWs = XLSX.utils.json_to_sheet(failedRows);
    XLSX.utils.book_append_sheet(wb, failedWs, "Failed Tests");
    failedWs["!cols"] = [
      { wch: 8 }, { wch: 35 }, { wch: 70 }, { wch: 80 }, { wch: 10 }, { wch: 30 },
    ];
    // Red highlight
    for (let i = 1; i <= failedRows.length; i++) {
      const cellRef = `E${i + 1}`;
      if (failedWs[cellRef]) {
        failedWs[cellRef].s = { fill: { fgColor: { rgb: "FFE0E0" } } };
      }
    }
  }

  // --- Sheet 4: Execution Log ---
  const logRows = [];
  const logLevels = ["INFO", "ERROR"];
  for (const suite of results.suites) {
    for (const test of suite.tests) {
      const level = test.status === "PASS" ? "INFO" : "ERROR";
      const category = suite.suite.replace("tests/", "").replace(".test.js", "");
      logRows.push({
        "Timestamp": new Date().toISOString(),
        "Level": level,
        "Message": `[${category}] ${test.title} → ${test.status === "PASS" ? "PASSED" : "FAILED"}: ${test.status === "PASS" ? "None — test passed successfully." : (test.error || "Unknown error")}`,
      });
    }
  }

  if (logRows.length > 0) {
    const logWs = XLSX.utils.json_to_sheet(logRows);
    XLSX.utils.book_append_sheet(wb, logWs, "Execution Log");
    logWs["!cols"] = [
      { wch: 30 }, { wch: 8 }, { wch: 160 },
    ];
  }

  // --- Sheet 5: Test Details ---
  let detailCounter = 0;
  const detailRows = [];
  for (const suite of results.suites) {
    for (const test of suite.tests) {
      detailCounter++;
      detailRows.push({
        "No.": detailCounter,
        "Category": suite.suite.replace("tests/", "").replace(".test.js", ""),
        "Test Name": test.title,
        "Status": test.status === "PASS" ? "PASSED" : "FAILED",
        "Error Details": test.status === "PASS" ? "None — test passed successfully." : (test.error || "Unknown error"),
      });
    }
  }

  const detailWs = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, detailWs, "Test Details");
  detailWs["!cols"] = [
    { wch: 8 }, { wch: 35 }, { wch: 70 }, { wch: 10 }, { wch: 80 },
  ];

  XLSX.writeFile(wb, OUTPUT_FILE);
  console.log(`\n  Report generated: ${OUTPUT_FILE}`);
  return OUTPUT_FILE;
}

if (require.main === module) {
  generateReport();
}

module.exports = { generateReport };
