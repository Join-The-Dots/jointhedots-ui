import Path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

await import("./styles.mts")

execFileSync("pnpm", ["exec", "vite", "serve", "--config", "playground/vite.config.ts"], {
   cwd: root,
   stdio: "inherit",
   shell: true,
})
