// scripts/writeVersion.js
const { execSync } = require("child_process");
const fs = require("fs");

const commitCount = execSync("git rev-list --count HEAD").toString().trim();
const version = `1.${commitCount}`;
const date = new Date().toISOString().split("T")[0];

const data = {
  version,
  modified: date,
};

fs.writeFileSync("version.json", JSON.stringify(data, null, 2));
console.log("✅ version.json updated:", data);
