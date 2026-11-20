import type { Panel, PanelDock } from "./index.ts"

export interface StackedFloating {
   node: HTMLElement
   anchor: Element
   close(): void
}

export const floating_stack: StackedFloating[] = []

export function getStackZIndex(stackIndex: number): string {
   return ((stackIndex + 1) * 1000 + 10000000).toString()
}

/** A dock showing one main panel, the panels it replaced kept below it until the main one closes. */
export abstract class StackedDock implements PanelDock {
   stack: Panel[] = []
   main?: Panel
   appendPanel(panel: Panel) {
      const index = this.stack.indexOf(panel)
      if (index >= 0) {
         this.stack.splice(index, 1)
      }
      if (this.main !== panel) {
         if (this.main) this.stack.push(this.main)
         this.main = panel
      }
      this.updateStack()
      dispatchOutsideEvent("open", null)
   }
   removePanel(panel: Panel) {
      const index = this.stack.indexOf(panel)
      if (index >= 0) {
         this.stack.splice(index, 1)
         this.updateStack()
      }
      else if (panel === this.main) {
         this.main = this.stack.pop()
         this.updateStack()
      }
   }
   refresh(panel: Panel) {
      if (panel === this.main || this.stack.includes(panel)) {
         this.updateStack()
      }
   }
   abstract updateStack(): void
}

export type OutsideEventID = "mouse" | "open"
export type OutsideHandler = (type: OutsideEventID, target: HTMLElement | null) => void

const outsideListeners = new Set<OutsideHandler>()

export function dispatchOutsideEvent(type: OutsideEventID, target: HTMLElement | null) {
   for (const handler of outsideListeners) {
      handler(type, target)
   }
}

let listening = false

export function addOutsideEventListener(handler: OutsideHandler) {
   if (!listening) {
      listening = true
      window.addEventListener("mousedown", (e) => {
         dispatchOutsideEvent("mouse", e.target as HTMLElement)
      }, { capture: true })
   }
   outsideListeners.add(handler)
}

export function removeOutsideEventListener(handler: OutsideHandler) {
   outsideListeners.delete(handler)
}
