import React, { useId } from "react"
import { ItemRowRich } from "../../Items/index.tsx"
import type { Panel, PanelContent } from "./index.ts"
import { PanelHeader, useDockLayer } from "./DockLayer.tsx"
import { PanelRoot } from "./PanelRoot.ts"
import { StackedDock } from "./StackedDock.tsx"

export type DrawerSide = "left" | "right"

const defaultWidth = 300
const minWidth = 200

/** Shows its main panel in a resizable drawer, the panels below it listed as rows that bring them back. */
export class DrawerDock extends StackedDock {
   private root = new PanelRoot()
   /** Kept by the dock: the drawer reopens at the width the user left it. */
   private width = defaultWidth

   constructor(readonly side: DrawerSide) {
      super()
   }
   private setWidth = (width: number) => {
      this.width = width
      this.updateStack()
   }
   updateStack() {
      const main = this.main
      const displayed = main?.displayed
      if (main && displayed) {
         const stacked = this.stack.map((panel, key) => panel.displayed
            ? <ItemRowRich
               key={key}
               icon={panel.displayed.icon}
               name={panel.displayed.title ?? ""}
               onSelect={() => this.appendPanel(panel)}
            />
            : null)
         this.root.render(<DrawerFrame
            side={this.side}
            panel={main}
            displayed={displayed}
            stacked={stacked}
            width={this.width}
            setWidth={this.setWidth}
            onClose={() => main.close()}
         />)
      }
      else {
         this.root.unmount()
      }
   }
}

function DrawerFrame(props: {
   side: DrawerSide
   panel: Panel
   displayed: PanelContent
   stacked: React.ReactNode
   width: number
   setWidth: (width: number) => void
   onClose: () => void
}) {
   const { side, panel, displayed, stacked, width, setWidth, onClose } = props
   const { closable = true } = displayed
   const titleId = useId()
   const ref = useDockLayer<HTMLElement>(closable ? onClose : undefined, false, panel)

   const startResize = (event: React.PointerEvent) => {
      event.preventDefault()
      const move = (moved: PointerEvent) => {
         const wanted = side === "left" ? moved.clientX : window.innerWidth - moved.clientX
         setWidth(Math.min(Math.max(wanted, minWidth), window.innerWidth * 0.7))
      }
      const stop = () => {
         window.removeEventListener("pointermove", move)
         window.removeEventListener("pointerup", stop)
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", stop)
   }

   return <div className={`jtd-panel-drawer-dock side-${side}`}>
      <aside
         ref={ref}
         className="jtd-panel-drawer-frame"
         role="dialog"
         aria-labelledby={displayed.title ? titleId : undefined}
         tabIndex={-1}
         style={{ width }}
      >
         {displayed.title || displayed.icon || displayed.tooling?.length || closable
            ? <PanelHeader displayed={displayed} titleId={titleId} onClose={onClose} />
            : null}
         <div className="jtd-panel-body">
            {stacked}
            {displayed.content}
         </div>
         <div className="jtd-panel-drawer-resize" onPointerDown={startResize} onDoubleClick={() => setWidth(defaultWidth)} />
      </aside>
   </div>
}
