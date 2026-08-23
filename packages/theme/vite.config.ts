import Path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
   root,
   plugins: [dts({ entryRoot: "src", outDir: "dist" })],
   build: {
      outDir: "dist",
      lib: {
         entry: { index: Path.join(root, "src/index.tsx") },
         formats: ["es"],
      },
      rollupOptions: {
         // Asset stylesheets of dependencies stay as literal imports,
         // resolved and loaded by the consuming application bundler.
         external: (id) => /^react(-dom)?($|\/)/.test(id) || /\.css$/.test(id),
         output: {
            entryFileNames: "[name].js",
            chunkFileNames: "chunks/[name]-[hash].js",
         },
      },
   },
})
