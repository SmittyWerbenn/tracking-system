import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { emailApiPlugin } from "./server/emailApiPlugin.ts";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Absolute root base - this app is deployed at the domain root (GitHub
    // Pages custom domain, confirmed via `gh api repos/.../pages`), not a
    // project subpath. A relative base ("./") broke deep links: the 404.html
    // SPA-fallback trick rewrites the URL via history.replaceState (e.g. to
    // /admin/login) before the browser finishes resolving the page's own
    // relative asset tags, so "./assets/x.js" resolved against the new path
    // instead of root, 404ing every JS/CSS file and leaving a blank page.
    base: "/",
    plugins: [react(), tailwindcss(), emailApiPlugin(env)],
  };
});
