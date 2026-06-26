import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronOutDir = path.join(__dirname, "dist-electron");

export default defineConfig({
  root: "renderer",
  plugins: [
    react(),
    electron({
      main: {
        entry: path.join(__dirname, "electron/main.ts"),
        vite: {
          build: {
            outDir: electronOutDir,
            emptyOutDir: false,
          },
        },
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
        vite: {
          build: {
            outDir: electronOutDir,
            emptyOutDir: false,
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "renderer/src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
