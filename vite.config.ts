import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Deploy `dist/` contents to SiteGround root: public_html/
  base: "/",
});
