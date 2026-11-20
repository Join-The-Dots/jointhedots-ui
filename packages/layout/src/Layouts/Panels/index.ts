import { useEffect, useMemo } from "react"
import { DrawerDock } from "./DrawerDock.tsx"
import { ModalDock } from "./ModalDock.tsx"
import type { ToolingProps } from "../../Items/index.tsx"
import type { ModalSize } from "./ModalDock.tsx"

export type PanelContent = {
   icon?: string
   title?: string
   content: React.ReactNode
   footer?: React.ReactNode
   tooling?: ToolingProps[]
   closable?: boolean
   size?: ModalSize
   height?: number | string
   onClose?: () => void
}

export interface Panel<Data = unknown> {
   readonly isOpen: boolean
   readonly dock?: PanelDock
   readonly displayed?: PanelContent
   readonly data?: Data
   /** Dock used by `open` and `switch` when they are called without one. */
   defaultDock?: PanelDockRef
   open(dock?: PanelDockRef): void
   display(displayed?: PanelContent): void
   close(): void
   /** Closes the panel when it is open in a dock, opens it in `dock` otherwise. */
   switch(dock?: PanelDockRef): void
}

/** A named dock (`"side"`, `"left"`, `"modal"`) or a dock instance. */
export type PanelDockRef = string | PanelDock

export type PanelRender<Data = unknown> = (panel: Panel<Data>) => PanelContent | Promise<PanelContent>

export interface PanelDock {
   appendPanel(panel: Panel): void
   removePanel(panel: Panel): void
   refresh(panel: Panel): void
}

function areSimilarObjects(x: Record<string, unknown>, y: Record<string, unknown>): boolean {
   for (const key in x) if (x[key] !== y[key]) return false
   for (const key in y) if (x[key] !== y[key]) return false
   return true
}

export class PanelInstance<Data = unknown> implements Panel<Data> {
   dock?: PanelDock
   displayed?: PanelContent
   data?: Data

   constructor(public defaultDock?: PanelDockRef) {
   }

   get isOpen(): boolean {
      return this.dock !== undefined
   }

   open(dock: PanelDockRef | undefined = this.defaultDock) {
      const prev_dock = this.dock
      if (prev_dock) {
         this.dock = undefined
         prev_dock.removePanel(this)
      }
      this.dock = getPanelDockFrom(dock)
      if (this.displayed) {
         this.dock.appendPanel(this)
      }
   }
   close() {
      const prev_dock = this.dock
      if (prev_dock) {
         this.dock = undefined
         prev_dock.removePanel(this)
         this.displayed?.onClose?.()
      }
   }
   switch(dock: PanelDockRef | undefined = this.defaultDock) {
      if (this.dock) this.close()
      else this.open(dock)
   }
   display(displayed?: PanelContent) {
      if (displayed) {
         if (!this.displayed) {
            this.displayed = { ...displayed }
            if (this.dock) this.dock.appendPanel(this)
         }
         else if (areSimilarObjects(this.displayed, displayed) === false) {
            Object.assign(this.displayed, displayed)
            if (this.dock) this.dock.refresh(this)
         }
      }
      else {
         this.close()
      }
   }
}

// Docks are created on first use: importing the package touches no DOM.
const dockFactories: Record<string, () => PanelDock> = {
   "side": () => new DrawerDock("right"),
   "left": () => new DrawerDock("left"),
   "modal": () => new ModalDock(),
}
const docks: Record<string, PanelDock> = {}

export function getPanelDockFrom(dock?: PanelDockRef): PanelDock {
   if (typeof dock === "object") return dock
   const name = dock && dockFactories[dock] ? dock : "side"
   return docks[name] ??= dockFactories[name]!()
}

export function createPanel<T = unknown>(displayed?: PanelContent, dock?: PanelDockRef): Panel<T> {
   const panel = new PanelInstance<T>(dock)
   if (displayed) panel.display(displayed)
   return panel
}

/** A stable panel, re-rendered when `deps` change and closed on unmount; `dock` is its default dock. */
export function usePanel<T>(render: PanelRender<T>, deps?: unknown[], dock?: PanelDockRef): Panel<T> {
   const panel = useMemo(() => new PanelInstance<T>(dock), [])
   panel.defaultDock = dock
   useEffect(() => {
      const desc = render(panel)
      if (desc instanceof Promise) {
         desc.then(desc => panel.display(desc))
      }
      else {
         panel.display(desc)
      }
   }, deps || [])
   useEffect(() => () => panel.close(), [])
   return panel
}

export { DrawerDock, type DrawerSide } from "./DrawerDock.tsx"
export { ModalDock, type ModalSize } from "./ModalDock.tsx"
export { StackedDock } from "./StackedDock.tsx"
