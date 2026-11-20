import { createPanel, usePanel, type Panel, type PanelContent, type PanelRender } from "./Panels/index.ts"
import { createFloatingDock, type FloatingDockOptions, type FloatingTarget } from "./Panels/FloatingDock.tsx"
import { openContextualMenu, openDialog } from "./open.tsx"

function useModal<T = unknown>(render: PanelRender<T>, deps?: unknown[]): Panel<T> {
   return usePanel(render, deps, "modal")
}
function useLeftDrawer<T = unknown>(render: PanelRender<T>, deps?: unknown[]): Panel<T> {
   return usePanel(render, deps, "left")
}
function useRightDrawer<T = unknown>(render: PanelRender<T>, deps?: unknown[]): Panel<T> {
   return usePanel(render, deps, "side")
}

/**
 * Overlay helpers bound to a dock, so that `open()` / `switch()` need no argument:
 * `Overlays.useModal(render, deps)`, `Overlays.useLeftDrawer(...)`, `Overlays.createModal(...)`, …
 */
export const Overlays = {
   usePanel,
   useModal,
   useLeftDrawer,
   useRightDrawer,
   createPanel,
   createModal: <T = unknown>(displayed?: PanelContent) => createPanel<T>(displayed, "modal"),
   createLeftDrawer: <T = unknown>(displayed?: PanelContent) => createPanel<T>(displayed, "left"),
   createRightDrawer: <T = unknown>(displayed?: PanelContent) => createPanel<T>(displayed, "side"),
   createPopover: <T = unknown>(target: FloatingTarget, displayed?: PanelContent, options?: FloatingDockOptions) =>
      createPanel<T>(displayed, createFloatingDock(target, options)),
   createFloatingDock,
   openDialog,
   openContextualMenu,
}
