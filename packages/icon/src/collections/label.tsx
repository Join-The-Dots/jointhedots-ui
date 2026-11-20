import { IconCollection, IconElement, registerIconCollection } from "../Icon.tsx"

/** Badge pill showing a raw value (`label:3`, `label:new`).
 *  Tinted by the color flags (`[error]`, `[primary]`…) through `--color`, muted otherwise. */
export class IconLabelCollection implements IconCollection {
   setup(element: IconElement) {
      const { name } = element
      element.className = `jtd-icons-label ${element.className}`
      element.value = "" + name
      // Without a corner flag the layer spans the unit box: center the pill so a
      // wide value grows on both sides instead of being clipped to 1em.
      if (element.style.left === 0 && element.style.right === 0) {
         element.style.left = "50%"
         element.style.right = "unset"
         element.style.transform = "translateX(-50%)"
      }
   }
   draw(element: IconElement) {
      const { value, className, style } = element
      return <span className={className} style={style}>
         <span>{value}</span>
      </span>
   }
}

registerIconCollection("label", new IconLabelCollection())
