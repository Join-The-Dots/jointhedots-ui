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
         entry: {
            index: Path.join(root, "src/index.ts"),
            bootstrap: Path.join(root, "src/bootstrap/index.ts"),
            "font-awesome": Path.join(root, "src/font-awesome/index.ts"),
            "flag-icons": Path.join(root, "src/flag-icons/index.ts"),
            salesforce: Path.join(root, "src/salesforce/index.ts"),
         },
         formats: ["es"],
      },
      rollupOptions: {
         // Asset stylesheets and sprites of dependencies stay as literal
         // imports, resolved and emitted by the consuming application bundler.
         external: (id) =>
            /^react(-dom)?($|\/)/.test(id)
            || id.startsWith("@jointhedots/theme")
            || /\.css$/.test(id)
            || /\.svg$/.test(id),
         output: {
            entryFileNames: "[name].js",
            chunkFileNames: "chunks/[name]-[hash].js",
         },
      },
   },
})
