import { IconCollection, IconElement } from "../Icon"
import { ThemeLighting, ThemeProvider } from "@jointhedots/theme"

const sprites = new Map<string, string>()
let spriteId = 0

function injectSprite(url: string): string {
   let prefix = sprites.get(url)
   if (prefix != null) return prefix
   prefix = `s${spriteId++}-`
   sprites.set(url, prefix)
   fetch(url).then(r => r.text()).then(svg => {
      document.body.insertAdjacentHTML("afterbegin",
         `<div style="display:none">${svg.replace(/ id="/g, ` id="${prefix}`)}</div>`)
   })
   return prefix
}

export class IconSVGInnerCollection implements IconCollection {
   public lightPrefix: string
   public darkPrefix: string
    constructor(
       readonly light_url: URL | string,
       readonly dark_url?: URL | string | null,
       readonly classNamer?: (element: IconElement) => string,
    ) {
       this.lightPrefix = injectSprite(`${light_url}`)
       this.darkPrefix = dark_url != null ? injectSprite(`${dark_url}`) : this.lightPrefix
    }
   setup(element: IconElement) {
      const { classNamer } = this
      element.className = classNamer ? classNamer(element) : element.className
      Object.assign(element.style, styles)
   }
    draw(element: IconElement, theme: ThemeProvider) {
       const { name, className, style } = element
       const light = theme.lighting === ThemeLighting.Light
       // Sprite shipped for light backgrounds only: invert its pixels for dark lighting
       const svgStyle = light || this.dark_url != null ? style : { ...style, filter: "invert(1)" }
       const prefix = light ? this.lightPrefix : this.darkPrefix
       return <svg className={className} style={svgStyle}>
          <use xlinkHref={`#${prefix}${name}`}></use>
       </svg>
    }
}

const styles = {
   height: "1em",
   width: "1em",
   minHeight: "1em",
   minWidth: "1em",
   backgroundRepeat: "no-repeat",
   backgroundPosition: "center",
}
