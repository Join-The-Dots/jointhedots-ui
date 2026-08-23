import Fs from "node:fs/promises"
import Path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const dry = process.argv.includes("--dry")
const level = (["major", "minor"] as const).find((arg) => process.argv.includes(`--${arg}`)) ?? "patch"

// Dependencies first: theme → icon → button → layout → input
const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/layout",
   "packages/input",
]

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

function bump(version: string, level: "patch" | "minor" | "major"): string {
   const parts = version.split(".").map(Number)
   if (parts.length !== 3 || parts.some(Number.isNaN)) {
      throw new Error(`Cannot bump "${version}": expected semver x.y.z`)
   }
   if (level === "major") return `${parts[0] + 1}.0.0`
   if (level === "minor") return `${parts[0]}.${parts[1] + 1}.0`
   return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
}

// A version already on the registry is bumped; an unreleased version is published as-is.
const plan: { pkg: string; name: string; from: string; to: string; manifest: any }[] = []
for (const pkg of packages) {
   const manifest = JSON.parse(await Fs.readFile(Path.join(root, pkg, "package.json"), "utf-8"))
   if (manifest.version === "0.0.0") {
      throw new Error(`Refusing to publish ${pkg}: version is 0.0.0 (set an initial version)`)
   }
   const to = isPublished(manifest.name, manifest.version) ? bump(manifest.version, level) : manifest.version
   plan.push({ pkg, name: manifest.name, from: manifest.version, to, manifest })
}

// Internal dependency ranges follow the target versions.
for (const { manifest, to } of plan) {
   manifest.version = to
   for (const dep of Object.keys(manifest.dependencies || {})) {
      const depVersion = plan.find((entry) => entry.name === dep)?.to
      if (depVersion) manifest.dependencies[dep] = `^${depVersion}`
   }
}

console.log(`Release plan (bump level: ${level})`)
for (const { name, from, to } of plan) {
   console.log(`  ${name} ${from === to ? from : `${from} → ${to}`}`)
}
if (dry) {
   console.log("\nDry run — nothing is written or published.")
   process.exit(0)
}

for (const { pkg, manifest } of plan) {
   await Fs.writeFile(Path.join(root, pkg, "package.json"), JSON.stringify(manifest, null, 3) + "\n")
}

await import("./build.mts")

for (const { pkg, name, to } of plan) {
   if (isPublished(name, to)) {
      console.log(`\n=== skip ${pkg}: ${name}@${to} already published ===`)
      continue
   }
   console.log(`\n=== publish ${name}@${to} ===`)
   execFileSync(
      "pnpm",
      ["publish", "--access", "public", "--no-git-checks"],
      { cwd: Path.join(root, pkg), stdio: "inherit", shell: true },
   )
}
