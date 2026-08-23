import { usePanel } from "../Panels"
import { createFloatingDock, FloatingDockOptions } from "../Panels/FloatingDock"
import { PositionType } from "../../computeEdgeBox"

export function Popup<D = unknown>(props: {
   content: React.ReactNode | ((data: D) => Promise<React.ReactNode> | React.ReactNode)
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
