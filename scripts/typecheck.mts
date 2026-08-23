import { execFileSync } from "node:child_process"

await import("./styles.mts")

for (const pkg of ["packages/theme", "packages/icon"]) {
   console.log(`\n=== tsc --noEmit ${pkg} ===`)
   execFileSync("pnpm", ["exec", "tsc", "-p", pkg, "--noEmit"], { stdio: "inherit", shell: true })
}
