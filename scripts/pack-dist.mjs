import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const desktop = path.join(process.env.USERPROFILE || "", "Desktop");
const zipPath = path.join(desktop, "SiteGround-upload.zip");
const folderPath = path.join(desktop, "SiteGround-upload");

if (!fs.existsSync(dist)) {
  console.error("dist/ not found — run npm run build first.");
  process.exit(1);
}

if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true });
if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });

fs.mkdirSync(folderPath, { recursive: true });
execSync(`xcopy /E /I /Y "${dist}\\*" "${folderPath}\\"`, { stdio: "inherit", shell: true });
execSync(`tar -a -cf "${zipPath.replace(/\\/g, "/")}" -C "${dist.replace(/\\/g, "/")}" .`, {
  stdio: "inherit",
});

const stats = fs.statSync(zipPath);
console.log(`\nDeploy pack ready:\n  ZIP:    ${zipPath}\n  Folder: ${folderPath}\n  Size:   ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
