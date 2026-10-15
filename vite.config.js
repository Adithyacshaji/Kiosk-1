import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";
import legacyWebviewCss from "./vite-plugins/legacyWebviewCss.js";

export default defineConfig({
  plugins: [
    react(),
// mkcert(),
    tailwindcss(),
    // The kiosk runs Android 11 with an old system WebView that can't be
    // updated, so ship transpiled JS + polyfills and down-levelled CSS.
    legacy({
      targets: ["chrome >= 49", "android >= 5"],
      modernTargets: ["chrome >= 64", "android >= 64", "safari >= 12", "firefox >= 67", "edge >= 79"],
      modernPolyfills: true,
    }),
    legacyWebviewCss(),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
