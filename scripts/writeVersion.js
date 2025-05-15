const fs = require("fs");

const threshold = 100; // bump major after 100 minor versions
const versionFile = "version.json";

// Initial version starting point
let versionData = {
  major: 1,
  minor: 170,
  modified: "2025-01-01"
};

// If file exists, read and use it
if (fs.existsSync(versionFile)) {
  versionData = JSON.parse(fs.readFileSync(versionFile, "utf8"));
}

// Auto-increment logic
versionData.minor += 1;

if (versionData.minor >= threshold) {
  versionData.major += 1;
  versionData.minor = 0;
}

// Use Pacific Time
const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
})
  .format(new Date())
  .replace(/\//g, "-");

versionData.modified = date;

// Save updated version.json
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log("✅ version.json updated:", versionData);
