import { execFileSync } from "node:child_process"

await import("./styles.mts")

const packages = [
   "packages/theme",
   "packages/icon",
   "packages/button",
   "packages/layout",
   "packages/input",
   "playground",
]

for (const pkg of packages) {
   console.log(`\n=== tsc --noEmit ${pkg} ===`)
   execFileSync("pnpm", ["exec", "tsc", "-p", pkg, "--noEmit"], { stdio: "inherit", shell: true })
}
