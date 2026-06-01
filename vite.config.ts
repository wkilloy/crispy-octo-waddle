/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the build tool that runs the dev server (`npm run dev`) and
// produces the optimized production build (`npm run build`).
export default defineConfig({
  plugins: [react()],
  // Vitest (our test runner) reuses this same config file.
  test: {
    environment: "node",
  },
});
