import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tsconfigPaths(), tailwindcss()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
