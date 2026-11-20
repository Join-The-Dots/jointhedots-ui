import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

export default defineConfig({
   root: fileURLToPath(new URL(".", import.meta.url)),
   build: {
      outDir: "dist",
      // Third-party icon stylesheets use modern selector syntax that the
      // default minifier chokes on; a showcase bundle needs no css minify.
      cssMinify: false,
   },
})
