import { IconCollection, IconElement, registerIconCollection } from "../Icon"

export class IconLabelCollection implements IconCollection {
   setup(element: IconElement) {
      const { name } = element
      element.className = `jtd-icons-avatar ${element.className}`
      element.style["--jtd-avatar-bg"] = "#888"
      element.value = "" + name
   }
   draw(element: IconElement) {
      const { value, className, style } = element
      return <div className={className} style={style}>
         <div>{value}</div>
      </div>
   }
}

registerIconCollection("label", new IconLabelCollection())
