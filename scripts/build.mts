import Path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

await import("./styles.mts")

// Dependencies first: theme → icon → button → input → layout
const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/input",
   "packages/layout",
]

for (const pkg of packages) {
   console.log(`\n=== vite build ${pkg} ===`)
   await build({ configFile: Path.join(root, pkg, "vite.config.ts") })
}

console.log(`\n=== vite build playground ===`)
await build({ configFile: Path.join(root, "playground/vite.config.ts") })
