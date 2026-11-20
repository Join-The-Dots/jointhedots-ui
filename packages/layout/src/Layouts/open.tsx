import { createPanel } from "./Panels/index.ts"
import { createFloatingDock, type FloatingDockOptions, type FloatingTarget } from "./Panels/FloatingDock.tsx"
import type { ModalSize } from "./Panels/ModalDock.tsx"

export type DialogOptions = {
   title?: string
   size?: ModalSize
   height?: string
}

/** Opens a modal panel and resolves with the value given to `resolve`, or `undefined` when the user closes it. */
export function openDialog<T>(renderer: (resolve: (data: T) => void) => React.ReactNode, options?: DialogOptions): Promise<T | undefined> {
   return new Promise(resolve => {
      const panel = createPanel(undefined, "modal")
      let done = false
      panel.display({
         ...options,
         content: renderer((res) => {
            if (!done) {
               done = true
               resolve(res)
            }
            panel.close()
         }),
         onClose: () => {
            if (!done) {
               done = true
               resolve(undefined)
            }
         },
      })
      panel.open()
   })
}

export type ContextualMenuPromise<T> = Promise<T | undefined> & { close(): void }

/** Opens a floating panel next to `target` and resolves with the value given to `close`, or `undefined`. */
export function openContextualMenu<T>(
   target: FloatingTarget,
   renderer: (close: (value?: T) => void) => React.ReactNode | Promise<React.ReactNode>,
   options?: FloatingDockOptions,
): ContextualMenuPromise<T> {
   const panel = createPanel(undefined, createFloatingDock(target, options))
   const promise = new Promise<T | undefined>(async (resolve) => {
      panel.display({
         content: await renderer((res) => {
            resolve(res)
            panel.close()
         }),
         onClose: () => resolve(undefined),
      })
      panel.open()
   }) as ContextualMenuPromise<T>
   promise.close = () => panel.close()
   return promise
}
