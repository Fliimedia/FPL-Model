import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // App.jsx lives at the repo root rather than in src/, matching the layout
  // used across the other Flii apps. Vite needs to be told to treat .jsx
  // outside src/ as JSX, hence the explicit include below.
  build: { outDir: "dist" },
});
