import Fs from "node:fs/promises"
import Path from "node:path"
import { fileURLToPath } from "node:url"
import { compileAsync } from "sass"

const root = Path.resolve(fileURLToPath(new URL("..", import.meta.url)))

const packages = [
   {
      dir: "packages/theme",
      // Same cascade order as the former index side-effect imports
      styles: ["src/theme-dark.scss", "src/theme-light.scss", "src/theme.scss"],
   },
   {
      dir: "packages/icon",
      styles: ["src/style.scss"],
   },
   {
      dir: "packages/button",
      styles: ["src/Button.scss"],
   },
   {
      dir: "packages/input",
      styles: ["src/Input.scss"],
   },
   {
      dir: "packages/layout",
      styles: [
         "src/Layouts/Panels/style.scss",
         "src/Layouts/Menu/style.scss",
         "src/Items/style.scss",
      ],
   },
]

for (const pkg of packages) {
   const chunks: string[] = []
   for (const style of pkg.styles) {
      const result = await compileAsync(Path.join(root, pkg.dir, style), { style: "compressed" })
      chunks.push(result.css)
   }
   const css = chunks.join("\n")
   const out = Path.join(root, pkg.dir, "src/generated/styles.ts")
   await Fs.mkdir(Path.dirname(out), { recursive: true })
   await Fs.writeFile(out, `const css: string = ${JSON.stringify(css)}\nexport default css\n`)
   console.log(`styles: ${pkg.dir}/src/generated/styles.ts (${css.length} bytes)`)
}
