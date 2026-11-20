import React from "react"
import ReactDOMClient from 'react-dom/client'
import { createPanel, type Panel, type PanelContent, type PanelDock } from "./index.ts"
import { computeEdgeBoxDOM, type PositionType } from "../../computeEdgeBox.tsx"
import { addOutsideEventListener, getStackZIndex, type OutsideHandler, floating_stack, removeOutsideEventListener } from "./StackedDock.tsx"

export type StyleType = { [key: string]: string }

export type FloatingTarget = UIEvent | Element | React.SyntheticEvent<Element, Event>

export type FloatingDockOptions = {
   position?: PositionType
   variant?: "menu" | "popup" | "popover"
   className?: string
   noAutoClose?: boolean
}

/**
 * A dock floating next to its target element: it follows the target every frame, closes on a click
 * outside, on Escape or when another panel opens, and gives the focus back to the target when it
 * held it. The target carries `aria-expanded` while the dock is shown.
 */
class FloatingDock implements PanelDock {
   node?: HTMLElement
   arrow?: HTMLElement
   root?: ReactDOMClient.Root
   main?: Panel
   stackIndex: number = 0
   frame: number = 0

   constructor(
      readonly opts: FloatingDockOptions,
      readonly tracked: Element,
   ) {
   }
   popup(displayed: PanelContent) {
      createPanel(displayed).open(this)
   }
   private show(): boolean {
      if (this.root) return true
      const { opts, tracked } = this
      const position = opts.position || "down-right"

      // Close the floating docks stacked above the one holding the target
      this.stackIndex = 0
      while (this.stackIndex < floating_stack.length) {
         const floating = floating_stack[this.stackIndex]!
         if (!floating.node.contains(tracked)) {
            floating.close()
            // same anchor: reopening toggles the dock closed instead of recreating it
            if (floating.anchor === tracked) {
               return false
            }
            break
         }
         this.stackIndex++
      }

      const node = document.createElement("div")
      const variantClass = `jtd-panel-floating-dock jtd-panel-floating-${opts.variant || "menu"}`
      node.className = opts.className ? `${opts.className} ${variantClass}` : variantClass
      node.style.setProperty("--jtd-floating-zindex", getStackZIndex(this.stackIndex))
      let render_host = node
      if (opts.variant === "popover") {
         this.arrow = document.createElement("div")
         this.arrow.className = "jtd-popover-arrow"
         node.appendChild(this.arrow)
         render_host = document.createElement("div")
         render_host.className = "jtd-popover-body"
         node.appendChild(render_host)
      }
      this.node = node
      this.root = ReactDOMClient.createRoot(render_host)
      document.body.appendChild(node)
      tracked.setAttribute("aria-expanded", "true")
      document.addEventListener("keydown", this.handleKeyDown)
      addOutsideEventListener(this.handleClickOutside)
      floating_stack.push({ node, anchor: tracked, close: this.close.bind(this) })

      const follow = () => {
         if (this.node !== node) return
         if (!tracked.isConnected) {
            this.close()
            return
         }
         computeEdgeBoxDOM(position, node, tracked)
         this.offsetFromTarget()
         this.updateArrow()
         node.style.visibility = "visible"
         this.frame = requestAnimationFrame(follow)
      }
      follow()
      return true
   }
   private handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && floating_stack.at(-1)?.node === this.node) {
         event.preventDefault()
         this.close()
      }
   }
   private handleClickOutside: OutsideHandler = (type, target) => {
      if (type === "open" && !this.opts.noAutoClose) {
         this.close()
      }
      if (type === "mouse" && this.node && !(target && this.tracked.contains(target))) {
         for (let i = this.stackIndex; i < floating_stack.length; i++) {
            if (floating_stack[i]!.node.contains(target)) return
         }
         this.close()
      }
   }
   private offsetFromTarget() {
      if (this.opts.variant !== "popover" || !this.node) return
      const nodeRect = this.node.getBoundingClientRect()
      const trackedRect = this.tracked.getBoundingClientRect()
      const { style } = this.node
      const below = nodeRect.top >= trackedRect.bottom - 2
      const above = nodeRect.bottom <= trackedRect.top + 2
      const right = nodeRect.left >= trackedRect.right - 2
      if (below) style.top = `${parseFloat(style.top) + PopoverGap}px`
      else if (above) style.bottom = `${parseFloat(style.bottom) + PopoverGap}px`
      else if (right) style.left = `${parseFloat(style.left) + PopoverGap}px`
      else style.right = `${parseFloat(style.right) + PopoverGap}px`
   }
   private updateArrow() {
      if (!this.arrow || !this.node) return
      const nodeRect = this.node.getBoundingClientRect()
      const trackedRect = this.tracked.getBoundingClientRect()
      const { style } = this.arrow
      const half = PopoverArrowSize / 2
      // the arrow center straddles the dock border line
      const strut = half + PopoverBorderWidth
      const inset = 10
      const clamp = (v: number, max: number) => Math.min(Math.max(v, inset), Math.max(inset, max))
      const below = nodeRect.top >= trackedRect.bottom - 2
      const above = nodeRect.bottom <= trackedRect.top + 2
      if (below || above) {
         const x = clamp(
            trackedRect.left + trackedRect.width / 2 - nodeRect.left - half,
            nodeRect.width - PopoverArrowSize - 2 * PopoverBorderWidth,
         )
         style.left = `${x - PopoverBorderWidth}px`
         style.top = below ? `${-strut}px` : "auto"
         style.bottom = above ? `${-strut}px` : "auto"
         style.right = "auto"
      }
      else {
         const right = nodeRect.left >= trackedRect.right - 2
         const y = clamp(
            trackedRect.top + trackedRect.height / 2 - nodeRect.top - half,
            nodeRect.height - PopoverArrowSize - 2 * PopoverBorderWidth,
         )
         style.top = `${y - PopoverBorderWidth}px`
         style.left = right ? "auto" : `${-strut}px`
         style.right = right ? `${-strut}px` : "auto"
         style.bottom = "auto"
      }
   }
   private hide() {
      const { node, root } = this
      if (!node || !root) return
      this.node = undefined
      this.root = undefined
      this.arrow = undefined
      cancelAnimationFrame(this.frame)
      removeOutsideEventListener(this.handleClickOutside)
      document.removeEventListener("keydown", this.handleKeyDown)
      this.tracked.setAttribute("aria-expanded", "false")
      const hadFocus = node.contains(document.activeElement)
      node.remove()
      queueMicrotask(() => root.unmount())
      if (hadFocus && this.tracked instanceof HTMLElement) this.tracked.focus()

      // Close the floating docks stacked above this one
      floating_stack[this.stackIndex + 1]?.close()
      floating_stack.splice(this.stackIndex, 1)
   }
   private close() {
      this.main?.close()
   }
   appendPanel(panel: Panel) {
      if (panel !== this.main) {
         this.close()
         this.main = panel
         this.refresh(panel)
      }
   }
   removePanel(panel: Panel) {
      if (panel === this.main) {
         this.main = undefined
         this.hide()
      }
   }
   refresh(panel: Panel) {
      if (panel !== this.main) return
      const displayed = panel.displayed
      if (!displayed) {
         this.hide()
      }
      else if (this.show()) {
         this.root!.render(displayed.content)
      }
      else {
         panel.close()
      }
   }
}

const PopoverArrowSize = 12
const PopoverBorderWidth = 1
const PopoverGap = 3

const stopableEvents = ["click", "dbclick", "contextmenu"]

function getTrackedElement(target: FloatingTarget): Element {
   if (target instanceof Element) {
      return target
   }
   if (target.currentTarget instanceof Element) {
      if (stopableEvents.includes(target.type)) {
         target.stopPropagation()
         target.preventDefault()
      }
      return target.currentTarget
   }
   if (target.target instanceof Element) {
      return target.target
   }
   throw new Error("target is invalid")
}

export function createFloatingDock(
   target: FloatingTarget,
   options?: FloatingDockOptions
): PanelDock & { popup(displayed: PanelContent): void } {
   return new FloatingDock(options || {}, getTrackedElement(target))
}
