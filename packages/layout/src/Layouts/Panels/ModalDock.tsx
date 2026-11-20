import { useId } from "react"
import type { Panel, PanelContent } from "./index.ts"
import { PanelHeader, useDockLayer } from "./DockLayer.tsx"
import { PanelRoot } from "./PanelRoot.ts"
import { StackedDock } from "./StackedDock.tsx"

export type ModalSize = "sm" | "md" | "lg" | "fullscreen"

/** Shows its main panel in a modal frame centered over a backdrop, the rest of the page made inert. */
export class ModalDock extends StackedDock {
   private root = new PanelRoot()

   updateStack() {
      const main = this.main
      const displayed = main?.displayed
      if (main && displayed) {
         this.root.render(<ModalFrame panel={main} displayed={displayed} onClose={() => main.close()} />)
      }
      else {
         this.root.unmount()
      }
   }
}

function ModalFrame({ panel, displayed, onClose }: { panel: Panel, displayed: PanelContent, onClose: () => void }) {
   const { size = "md", height, footer, closable = true } = displayed
   const titleId = useId()
   const ref = useDockLayer<HTMLDivElement>(closable ? onClose : undefined, true, panel)
   return <div ref={ref} className="jtd-panel-modal-dock">
      <div className="jtd-panel-modal-backdrop" onMouseDown={closable ? onClose : undefined} />
      <section
         className={`jtd-panel-modal-frame size-${size}`}
         role="dialog"
         aria-modal
         aria-labelledby={displayed.title ? titleId : undefined}
         tabIndex={-1}
         style={height !== undefined ? { height } : undefined}
      >
         {displayed.title || displayed.icon || displayed.tooling?.length || closable
            ? <PanelHeader displayed={displayed} titleId={titleId} onClose={onClose} />
            : null}
         <div className="jtd-panel-body">{displayed.content}</div>
         {footer ? <footer className="jtd-panel-footer">{footer}</footer> : null}
      </section>
   </div>
}
