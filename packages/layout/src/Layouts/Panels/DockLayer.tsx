import React, { useEffect, useRef } from "react"
import Icon from "@jointhedots/icon"
import { ButtonIcon } from "@jointhedots/button"
import { DrawToolingWidgets } from "../../Items/index.tsx"
import type { Panel, PanelContent } from "./index.ts"
import { floating_stack } from "./StackedDock.tsx"

/** Header of a panel shown by a modal or drawer dock: icon, title, tooling and close button. */
export function PanelHeader(props: { displayed: PanelContent, titleId: string, onClose: () => void }) {
   const { displayed: { icon, title, tooling, closable = true }, titleId, onClose } = props
   return <header className="jtd-panel-header">
      {icon ? <Icon className="jtd-panel-icon" name={icon} /> : null}
      <h2 id={titleId} className="jtd-panel-title">{title}</h2>
      {tooling ? DrawToolingWidgets(tooling) : null}
      {closable ? <ButtonIcon icon="bi:x-lg" title="Close" onClick={onClose} /> : null}
   </header>
}

const layers: HTMLElement[] = []

const fieldSelector = "input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled])"
const focusableSelector = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1']), " + fieldSelector

/**
 * Behavior of a dock layer mounted at the root of the document body, for the lifetime of the dock:
 * Escape on the topmost layer, focus restored to the trigger when the dock closes, and — when
 * `modal` — the rest of the document made inert. Each time the dock shows another `panel` (a stacked
 * dock switching its main panel), the focus moves into it (first field of its body, else its first
 * focusable, else the frame).
 */
export function useDockLayer<T extends HTMLElement>(onClose: (() => void) | undefined, modal: boolean, panel: Panel) {
   const ref = useRef<T>(null)
   const close = useRef(onClose)
   close.current = onClose

   // Declared first: on unmount the inert attributes go before the focus is given back.
   useEffect(() => {
      const node = ref.current
      if (!node) return
      const host = node.closest("body > *") ?? node
      const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
      const inerted = modal
         ? [...document.body.children].filter((child) => child !== host && !child.hasAttribute("inert"))
         : []
      for (const child of inerted) child.setAttribute("inert", "")
      // Floating docks already open belong to the page below; only those opened later take Escape first.
      const floatingBelow = new Set(floating_stack.map((floating) => floating.node))
      layers.push(node)

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key !== "Escape" || event.defaultPrevented) return
         if (layers[layers.length - 1] !== node) return
         if (floating_stack.some((floating) => !floatingBelow.has(floating.node))) return
         // A non-modal dock (drawer) only answers Escape when the focus is inside it.
         if (!modal && !node.contains(document.activeElement)) return
         event.preventDefault()
         close.current?.()
      }
      document.addEventListener("keydown", onKeyDown)
      return () => {
         document.removeEventListener("keydown", onKeyDown)
         layers.splice(layers.indexOf(node), 1)
         for (const child of inerted) child.removeAttribute("inert")
         if (trigger?.isConnected) trigger.focus()
      }
   }, [modal])

   useEffect(() => {
      const node = ref.current
      if (!node || node.contains(document.activeElement)) return
      const body = node.querySelector(".jtd-panel-body") ?? node
      const initial = body.querySelector<HTMLElement>(fieldSelector)
         ?? body.querySelector<HTMLElement>(focusableSelector)
         ?? (node.matches("[tabindex='-1']") ? node : node.querySelector<HTMLElement>("[tabindex='-1']"))
      initial?.focus()
   }, [panel])

   return ref
}
