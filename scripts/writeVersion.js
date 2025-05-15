const { execSync } = require("child_process");
const fs = require("fs");

const commitCount = execSync("git rev-list --count HEAD").toString().trim();
console.log("🔍 Git commit count:", commitCount);
const version = `1.${commitCount}`;

const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
})
  .format(new Date())
  .replace(/\//g, "-");

const data = {
  version,
  modified: date,
};

fs.writeFileSync("version.json", JSON.stringify(data, null, 2));
console.log("✅ version.json updated:", data);
