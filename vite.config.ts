import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, existsSync, mkdirSync, cpSync } from "fs";

export default defineConfig(({ mode }) => {
  const isFirefox = mode === "firefox";
  const outDir = isFirefox ? "dist/firefox" : "dist/chrome";

  return {
    root: resolve(__dirname, "src"),
    publicDir: false,
    build: {
      outDir: resolve(__dirname, outDir),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, "src/popup/popup.html"),
          interstitial: resolve(__dirname, "src/interstitial/interstitial.html"),
          background: resolve(__dirname, "src/background/index.ts"),
          content: resolve(__dirname, "src/content/index.ts")
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === "background") return "background.js";
            if (chunkInfo.name === "content") return "content.js";
            return "[name]/[name].js";
          },
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name].[ext]"
        }
      }
    },
    plugins: [
      {
        name: "copy-manifest-and-assets",
        closeBundle() {
          const targetManifest = isFirefox ? "src/manifest.firefox.json" : "src/manifest.chrome.json";
          const distManifest = resolve(__dirname, outDir, "manifest.json");
          const distIcons = resolve(__dirname, outDir, "assets/icons");
          const srcIcons = resolve(__dirname, "src/assets/icons");

          if (!existsSync(resolve(__dirname, outDir))) {
            mkdirSync(resolve(__dirname, outDir), { recursive: true });
          }

          if (existsSync(targetManifest)) {
            copyFileSync(targetManifest, distManifest);
          }

          if (existsSync(srcIcons)) {
            mkdirSync(distIcons, { recursive: true });
            cpSync(srcIcons, distIcons, { recursive: true });
          }
        }
      }
    ],
    test: {
      globals: true,
      environment: "node"
    }
  };
});
