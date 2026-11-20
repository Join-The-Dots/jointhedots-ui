import { IconCollection, IconElement } from "../Icon.tsx"

export class IconError implements IconCollection {
   setup(element: IconElement) {
      Object.assign(element.style, error_styles)
   }
   draw(element: IconElement) {
      const { name, className, style } = element
      const title = `[Bad icon '${name}']`
      return <span title={title} className={className} style={style} />
   }
}

export class IconBlank implements IconCollection {
   setup(element: IconElement) {
   }
   draw(element: IconElement) {
      const { className, style } = element
      return <span className={className} style={style} />
   }
}

const error_styles = {
   height: "1em",
   width: "1em",
   background: 'repeating-linear-gradient(45deg, transparent, transparent 1px, var(--jtd-error) 2px, var(--jtd-error) 3px)',
}

