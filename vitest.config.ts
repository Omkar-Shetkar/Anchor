import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"]
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@assets": resolve(__dirname, "src/assets")
    }
  }
});
