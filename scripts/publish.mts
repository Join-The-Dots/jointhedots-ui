import Fs from "node:fs/promises"
import Path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const dry = process.argv.includes("--dry")

const packages = ["packages/theme", "packages/icon"]

const manifests = new Map<string, any>()
for (const pkg of packages) {
   const manifest = JSON.parse(await Fs.readFile(Path.join(root, pkg, "package.json"), "utf-8"))
   manifests.set(pkg, manifest)
   if (manifest.version === "0.0.0") {
      throw new Error(`Refusing to publish ${pkg}: version is 0.0.0 (bump it first)`)
   }
}

// icon depends on a literal theme version (core links the folders via file:)
{
   const theme_version = manifests.get("packages/theme").version
   const icon_theme_range = manifests.get("packages/icon").dependencies["@jointhedots/theme"]
   if (!icon_theme_range.includes(theme_version)) {
      throw new Error(
         `packages/icon depends on @jointhedots/theme "${icon_theme_range}" but theme version is ${theme_version}`,
      )
   }
}

await import("./build.mts")

for (const pkg of packages) {
   console.log(`\n=== publish ${pkg} ===`)
   execFileSync(
      "pnpm",
      ["publish", "--access", "public", "--no-git-checks", ...(dry ? ["--dry-run"] : [])],
      { cwd: Path.join(root, pkg), stdio: "inherit", shell: true },
   )
}
