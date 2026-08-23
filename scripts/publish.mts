import Fs from "node:fs/promises"
import Path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const dry = process.argv.includes("--dry")

// Dependencies first: theme → icon → button → layout → input
const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/layout",
   "packages/input",
]

const versions = new Map<string, string>()
for (const pkg of packages) {
   const manifest = JSON.parse(await Fs.readFile(Path.join(root, pkg, "package.json"), "utf-8"))
   if (manifest.version === "0.0.0") {
      throw new Error(`Refusing to publish ${pkg}: version is 0.0.0 (bump it first)`)
   }
   versions.set(manifest.name, manifest.version)
}

for (const pkg of packages) {
   const manifest = JSON.parse(await Fs.readFile(Path.join(root, pkg, "package.json"), "utf-8"))
   for (const [dep, range] of Object.entries<any>(manifest.dependencies || {})) {
      const version = versions.get(dep)
      if (version && !String(range).includes(version)) {
         throw new Error(`${pkg} depends on ${dep} "${range}" but its version is ${version}`)
      }
   }
}

function isPublished(name: string, version: string): boolean {
   try {
      const out = execFileSync("npm", ["view", `${name}@${version}`, "version"], {
         shell: true,
         encoding: "utf-8",
         stdio: ["ignore", "pipe", "ignore"],
      })
      return out.trim() === version
   }
   catch {
      return false
   }
}

await import("./build.mts")

for (const pkg of packages) {
   const manifest = JSON.parse(await Fs.readFile(Path.join(root, pkg, "package.json"), "utf-8"))
   if (isPublished(manifest.name, manifest.version)) {
      console.log(`\n=== skip ${pkg}: ${manifest.name}@${manifest.version} already published ===`)
      continue
   }
   console.log(`\n=== publish ${pkg} ===`)
   execFileSync(
      "pnpm",
      ["publish", "--access", "public", "--no-git-checks", ...(dry ? ["--dry-run"] : [])],
      { cwd: Path.join(root, pkg), stdio: "inherit", shell: true },
   )
}
