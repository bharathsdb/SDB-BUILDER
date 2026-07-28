const XLSX = require("xlsx");
const path = require("path");

const filePath = "D:\\Downloads\\E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx";

try {
  const wb = XLSX.readFile(filePath);
  console.log("Sheet Names:", wb.SheetNames);
  
  for (const sheetName of wb.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws);
    console.log(`Row Count: ${data.length}`);
    if (data.length > 0) {
      console.log("First Row:", data[0]);
    }
  }
} catch (err) {
  console.error("Error reading file:", err.message);
}
