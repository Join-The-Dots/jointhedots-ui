import Path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

const root = fileURLToPath(new URL(".", import.meta.url))
const pkgs = Path.resolve(root, "../packages")

// Dev on package sources: no prior build needed, only generated styles.
export default defineConfig({
   root,
   resolve: {
      alias: [
         { find: /^@jointhedots\/theme$/, replacement: Path.join(pkgs, "theme/src/index.tsx") },
         { find: /^@jointhedots\/icon$/, replacement: Path.join(pkgs, "icon/src/index.ts") },
         { find: /^@jointhedots\/icon\/(.+)$/, replacement: Path.join(pkgs, "icon/src/$1/index.ts") },
         { find: /^@jointhedots\/button$/, replacement: Path.join(pkgs, "button/src/index.ts") },
         { find: /^@jointhedots\/input$/, replacement: Path.join(pkgs, "input/src/index.ts") },
         { find: /^@jointhedots\/layout$/, replacement: Path.join(pkgs, "layout/src/index.ts") },
      ],
   },
   build: {
      outDir: "dist",
      // Third-party icon stylesheets use modern selector syntax that the
      // default minifier chokes on; a showcase bundle needs no css minify.
      cssMinify: false,
   },
})
