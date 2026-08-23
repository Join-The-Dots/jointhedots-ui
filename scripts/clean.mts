import Fs from "node:fs/promises"
import Path from "node:path"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

for (const pkg of ["packages/theme", "packages/icon"]) {
   await Fs.rm(Path.join(root, pkg, "dist"), { recursive: true, force: true })
   await Fs.rm(Path.join(root, pkg, "src/generated"), { recursive: true, force: true })
}
console.log("cleaned")
