import Path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

await import("./styles.mts")

for (const pkg of ["packages/theme", "packages/icon"]) {
   console.log(`\n=== vite build ${pkg} ===`)
   await build({ configFile: Path.join(root, pkg, "vite.config.ts") })
}
