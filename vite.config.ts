import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

// --- Deployment target selection -------------------------------------------------
// This app has no platform-specific code. The ONLY place that varies by host is
// this one branch, which picks the right build adapter:
//
//   Netlify  -> Netlify sets the NETLIFY env var automatically during its build,
//               so the official @netlify/vite-plugin-tanstack-start plugin is used
//               (this is the current, documented Netlify integration for
//               TanStack Start >= 1.132 — see docs.netlify.com/build/frameworks/
//               framework-setup-guides/tanstack-start/). It configures both the
//               production build (SSR -> Netlify Functions) and full local
//               platform emulation in `vite dev`.
//   Vercel   -> Vercel sets VERCEL=1 automatically; plain Nitro auto-detects this
//               and applies its "vercel" preset with zero extra config.
//   Anywhere else (a plain Node server, Docker, etc.) -> set NITRO_PRESET
//               (e.g. "node-server") to pick a target explicitly. Nitro defaults
//               to a portable Node server build when nothing is set.
const isNetlify = process.env.NETLIFY === "true" || process.env.NETLIFY === "1";
const nitroPreset = process.env.NITRO_PRESET;

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      // Use src/server.ts (our SSR error-wrapping entry) instead of the
      // framework's default server entry.
      server: { entry: "./src/server.ts" },
    }),
    viteReact(),
    tailwindcss(),
    isNetlify ? netlify() : nitro(nitroPreset ? { preset: nitroPreset } : {}),
  ],
});
