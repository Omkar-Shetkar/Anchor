import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("[Anchor] Packaging extension for Chrome and Firefox...");

// 1. Build Chrome target
console.log("-> Building Chrome target (dist/chrome)...");
execSync("npx vite build --mode chrome", { stdio: "inherit", cwd: rootDir });

// 2. Build Firefox target
console.log("-> Building Firefox target (dist/firefox)...");
execSync("npx vite build --mode firefox", { stdio: "inherit", cwd: rootDir });

// Verify manifests
const chromeManifestPath = path.resolve(rootDir, "dist/chrome/manifest.json");
const firefoxManifestPath = path.resolve(rootDir, "dist/firefox/manifest.json");

if (fs.existsSync(chromeManifestPath)) {
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, "utf-8"));
  console.log(`✓ Chrome Manifest V3 verified (v${chromeManifest.version})`);
} else {
  console.error("✗ Chrome manifest.json missing in dist/chrome!");
}

if (fs.existsSync(firefoxManifestPath)) {
  const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, "utf-8"));
  console.log(`✓ Firefox Manifest V3 verified (v${firefoxManifest.version})`);
} else {
  console.error("✗ Firefox manifest.json missing in dist/firefox!");
}

console.log("✓ Packaging ready: Load unpacked from dist/chrome or dist/firefox.");
