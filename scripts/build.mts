import Path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

await import("./styles.mts")

// Dependencies first: theme → icon → button → layout → input
const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/layout",
   "packages/input",
]

for (const pkg of packages) {
   console.log(`\n=== vite build ${pkg} ===`)
   await build({ configFile: Path.join(root, pkg, "vite.config.ts") })
}

console.log(`\n=== vite build playground ===`)
await build({ configFile: Path.join(root, "playground/vite.config.ts") })
