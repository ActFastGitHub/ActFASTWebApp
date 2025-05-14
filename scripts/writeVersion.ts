// scripts/writeVersion.ts
import { execSync } from "child_process";
import fs from "fs";

const commitCount = execSync("git rev-list --count HEAD").toString().trim();
const version = `1.${commitCount}`;
const date = new Date().toISOString().split("T")[0];

const data = {
  version,
  modified: date,
};

fs.writeFileSync("version.json", JSON.stringify(data, null, 2));
console.log("✅ version.json updated:", data);
