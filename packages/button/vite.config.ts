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
         entry: { index: Path.join(root, "src/index.ts") },
         formats: ["es"],
      },
      rollupOptions: {
         external: (id) =>
            /^react(-dom)?($|\/)/.test(id)
            || id.startsWith("@jointhedots/")
            || id.startsWith("@salesforce/")
            || /\.css$/.test(id),
         output: {
            entryFileNames: "[name].js",
            chunkFileNames: "chunks/[name]-[hash].js",
         },
      },
   },
})
