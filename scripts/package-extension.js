import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, "package.json"), "utf-8"));
const version = pkg.version;

console.log(`[Anchor] Packaging extension v${version} for Chrome and Firefox...`);

// 1. Build Chrome target
console.log("\n-> Building Chrome target (dist/chrome)...");
execSync("npx vite build --mode chrome", { stdio: "inherit", cwd: rootDir });

// 2. Build Firefox target
console.log("\n-> Building Firefox target (dist/firefox)...");
execSync("npx vite build --mode firefox", { stdio: "inherit", cwd: rootDir });

// 3. Verify manifests
const chromeManifestPath = path.resolve(rootDir, "dist/chrome/manifest.json");
const firefoxManifestPath = path.resolve(rootDir, "dist/firefox/manifest.json");

if (!fs.existsSync(chromeManifestPath)) {
  console.error("✗ Chrome manifest.json missing in dist/chrome!");
  process.exit(1);
}
const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, "utf-8"));
console.log(`✓ Chrome Manifest V3 verified (v${chromeManifest.version})`);

if (!fs.existsSync(firefoxManifestPath)) {
  console.error("✗ Firefox manifest.json missing in dist/firefox!");
  process.exit(1);
}
const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, "utf-8"));
console.log(`✓ Firefox Manifest V3 verified (v${firefoxManifest.version})`);

// 4. Create release directory
const releaseDir = path.resolve(rootDir, "release");
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

// Helper to compute sha256
function computeSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getFileSizeKb(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(1) + " KB";
}

// 5. Create store ZIP archives
console.log("\n-> Creating store-ready release archives in release/...");

const chromeZipName = `anchor-chrome-v${version}.zip`;
const chromeZipPath = path.resolve(releaseDir, chromeZipName);
if (fs.existsSync(chromeZipPath)) fs.unlinkSync(chromeZipPath);

const firefoxZipName = `anchor-firefox-v${version}.zip`;
const firefoxZipPath = path.resolve(releaseDir, firefoxZipName);
if (fs.existsSync(firefoxZipPath)) fs.unlinkSync(firefoxZipPath);

const sourceZipName = `anchor-source-v${version}.zip`;
const sourceZipPath = path.resolve(releaseDir, sourceZipName);
if (fs.existsSync(sourceZipPath)) fs.unlinkSync(sourceZipPath);

// Chrome Zip (contents of dist/chrome at root of zip)
execSync(`cd "${path.resolve(rootDir, "dist/chrome")}" && zip -r -q "${chromeZipPath}" . -x "*.DS_Store*"`, {
  stdio: "inherit"
});

// Firefox Zip (contents of dist/firefox at root of zip)
execSync(`cd "${path.resolve(rootDir, "dist/firefox")}" && zip -r -q "${firefoxZipPath}" . -x "*.DS_Store*"`, {
  stdio: "inherit"
});

// Source Zip for Mozilla Review (mandatory for bundled extensions on AMO)
execSync(
  `cd "${rootDir}" && zip -r -q "${sourceZipPath}" src/ scripts/ package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts README.md LICENSE -x "*.DS_Store*"`,
  { stdio: "inherit" }
);

// 6. Generate Checksums
const checksums = [
  `${computeSha256(chromeZipPath)}  ${chromeZipName}`,
  `${computeSha256(firefoxZipPath)}  ${firefoxZipName}`,
  `${computeSha256(sourceZipPath)}  ${sourceZipName}`
].join("\n");

const checksumPath = path.resolve(releaseDir, "checksums.txt");
fs.writeFileSync(checksumPath, checksums + "\n", "utf-8");

console.log("\n========================================================");
console.log("            Anchor Release Bundles Summary              ");
console.log("========================================================");
console.log(`• Chrome Web Store Bundle:  ${chromeZipName} (${getFileSizeKb(chromeZipPath)})`);
console.log(`  SHA256: ${computeSha256(chromeZipPath)}`);
console.log(`• Firefox AMO Bundle:       ${firefoxZipName} (${getFileSizeKb(firefoxZipPath)})`);
console.log(`  SHA256: ${computeSha256(firefoxZipPath)}`);
console.log(`• Firefox Source Archive:   ${sourceZipName} (${getFileSizeKb(sourceZipPath)})`);
console.log(`  SHA256: ${computeSha256(sourceZipPath)}`);
console.log(`• Checksums recorded to:    release/checksums.txt`);
console.log("========================================================");
console.log("✓ All release packages created successfully in release/!\n");
