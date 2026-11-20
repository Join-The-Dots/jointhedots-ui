import { usePanel } from "../Panels/index.ts"
import { createFloatingDock, type FloatingDockOptions } from "../Panels/FloatingDock.tsx"
import type { PositionType } from "../../computeEdgeBox.tsx"

export function Popup<D = unknown>(props: {
   content: React.ReactNode | ((data: D | undefined) => Promise<React.ReactNode> | React.ReactNode)
   data?: D
   variant?: "menu" | "popup" | "popover"
   position?: PositionType
   className?: string
   children: React.ReactNode
}) {
   const { content, data, children, variant, position, className } = props
   const options: FloatingDockOptions = { variant: variant ?? "popover", position }
   const panel = usePanel(async () => {
      return {
         content: content instanceof Function ? await content(data) : content
      }
   }, [data, content])
   return <div
      className={className}
      onMouseEnter={(e) => panel.open(createFloatingDock(e, options))}
      onMouseLeave={() => panel.close()}
   >
      {children}
   </div>
}
