import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { emailApiPlugin } from "./server/emailApiPlugin.ts";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Relative base so the built app works from any subpath, including a
    // GitHub Pages project site (https://<user>.github.io/<repo>/).
    base: "./",
    plugins: [react(), tailwindcss(), emailApiPlugin(env)],
  };
});
