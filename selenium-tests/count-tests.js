const fs = require("fs");
const path = require("path");

const testsDir = path.join(__dirname, "tests");
const files = fs.readdirSync(testsDir).filter(f => f.endsWith(".test.js"));

let grandTotal = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(testsDir, file), "utf-8");
  const matches = content.match(/it\s*\(\s*["'`]/g) || [];
  console.log(`${file}: ${matches.length} tests`);
  grandTotal += matches.length;
}

console.log("\nGrand Total of E2E test cases in files:", grandTotal);
