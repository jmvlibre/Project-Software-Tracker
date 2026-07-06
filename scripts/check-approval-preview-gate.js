const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "..", "public", "script.js");
const indexPath = path.join(__dirname, "..", "public", "index.html");
const source = fs.readFileSync(scriptPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");

const requiredPatterns = [
  {
    pattern: /let\s+approvalFormViewed\s*=\s*false/,
    message: "approval form view state is tracked"
  },
  {
    pattern: /function\s+markApprovalFormViewed\s*\(/,
    message: "approval form view marker exists"
  },
  {
    pattern: /function\s+resetApprovalFormViewed\s*\(/,
    message: "approval form view state can reset per approval request"
  },
  {
    pattern: /if\s*\(\s*!approvalFormViewed\s*\)[\s\S]*?Please open and review the PDF before approving\./,
    message: "approval is blocked until the PDF is opened"
  },
  {
    pattern: /markApprovalFormViewed\(\);\s*const records = approvalRouteRecords\(\);[\s\S]*?(?:printModificationPdf|openModificationPdfPreview)\([\s\S]*?records[\s\S]*?\)/,
    message: "opening the PDF marks the form as viewed"
  }
];

const failures = requiredPatterns
  .filter(({ pattern }) => !pattern.test(source))
  .map(({ message }) => `Missing: ${message}`);

if (!/id="approvalPreviewPdfBtn"/.test(indexSource)) {
  failures.push("Missing: Open PDF button in the approval form");
}

if (!/id="approvalPdfPrompt"/.test(indexSource)) {
  failures.push("Missing: visible PDF review prompt in the approval form");
}

if (!/Open and review the PDF before approving\./.test(indexSource)) {
  failures.push("Missing: PDF review requirement copy in the approval form");
}

if (/approvalPreviewFrame/.test(source) || /approvalPreviewFrame/.test(indexSource)) {
  failures.push("Forbidden: embedded approval PDF preview iframe");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Approval PDF gate check passed.");
