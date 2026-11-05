// Lovable TanStack config: bundles tanstackStart, React, Tailwind, path aliases.
// Nitro is pinned to the Netlify preset for deployment.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: { preset: "netlify" },
});
