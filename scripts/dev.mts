import { execFileSync } from "node:child_process"

execFileSync("pnpm", ["exec", "vite", "serve", "--config", "playground/vite.config.ts"], {
   stdio: "inherit",
   shell: true,
})
