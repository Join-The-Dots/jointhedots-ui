import Fs from "node:fs/promises"
import Path from "node:path"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/input",
   "packages/layout",
]

for (const pkg of [...packages, "playground"]) {
   await Fs.rm(Path.join(root, pkg, "dist"), { recursive: true, force: true })
   if (pkg !== "playground") {
      await Fs.rm(Path.join(root, pkg, "src/generated"), { recursive: true, force: true })
   }
}
console.log("cleaned")
