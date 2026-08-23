import React from "react"
import ReactDOMClient from 'react-dom/client'
import ReactDOM from 'react-dom'
import { createPanel, Panel, PanelDisplay, PanelDock } from "."
import { computeEdgeBoxDOM, PositionType } from "../../computeEdgeBox"
import { addOutsideEventListener, getStackZIndex, OutsideHandler, overlays_stack, removeOutsideEventListener } from "./StackedDock"

export type StyleType = { [key: string]: string }

export type FloatingTarget = UIEvent | Element | React.Component | React.SyntheticEvent<Element, Event>

export type FloatingDockOptions = {
   position?: PositionType
   variant?: "menu" | "popup" | "popover"
   className?: string
   noAutoClose?: boolean
}

class FloatingDock implements PanelDock {
   node: HTMLElement
   arrow: HTMLElement = null
   root: ReactDOMClient.Root = null
   tracked: Element = null
   main: Panel = null
   stackIndex: number = 0
   resolve?: (data: any) => void
   constructor(
      readonly opts: FloatingDockOptions,
   ) {
   }
   stick(target: FloatingTarget) {
      this.tracked = getTrackedElement(target)
      return this
   }
   popup(displayed: PanelDisplay) {
      const panel = createPanel(displayed)
      panel.open(this)
   }
   private show(): boolean {
      if (!this.root) {
         if (!this.tracked) {
            return false
         }

         const { opts } = this
         const variantClass = variantClasses[opts.variant] || variantClasses.default
         const position = opts.position || "down-right"

         // Purge top of stack popup
         this.stackIndex = 0
         while (this.stackIndex < overlays_stack.length) {
            if (!overlays_stack[this.stackIndex].node.contains(this.tracked)) {
               overlays_stack[this.stackIndex].close()
               break
            }
            this.stackIndex++
         }

          // Create popup node
          this.node = document.createElement("div")
          this.node.className = opts.className ? `${opts.className} ${variantClass}` : variantClass
          this.node.setAttribute("style", `--jtd-floating-zindex:${getStackZIndex(this.stackIndex)};`)
          let render_host: HTMLElement = this.node
          if (opts.variant === "popover") {
             this.arrow = document.createElement("div")
             this.arrow.className = "jtd-popover-arrow"
             this.node.appendChild(this.arrow)
             render_host = document.createElement("div")
             render_host.className = "jtd-popover-body"
             this.node.appendChild(render_host)
          }
          this.root = ReactDOMClient.createRoot(render_host)
          document.body.appendChild(this.node)

          const updatePosition = () => {
             if (this.node) {
                if (this.tracked.isConnected) {
                   computeEdgeBoxDOM(position, this.node, this.tracked)
                   this.updateArrow()
                   this.node.style.visibility = "visible"
                   setTimeout(updatePosition, 25)
                }
                else {
                   this.hide()
                }
             }
          }

          // Append popup in document on top of stack
          addOutsideEventListener(this._handleClickOutside)
          computeEdgeBoxDOM(position, this.node, this.tracked, document.body)
          this.updateArrow()
          overlays_stack.push({ node: this.node, close: this.hide.bind(this) })

         // Render popup on node
         setTimeout(updatePosition, 25)
         this.refresh(this.main)
      }
      return true
   }
   private _handleClickOutside: OutsideHandler = (type, target) => {
      if (type === "open" && !this.opts.noAutoClose) {
         this.close()
      }
      if (type === "mouse" && this.node && !this.tracked.contains(target)) {
         for (let i = this.stackIndex; i < overlays_stack.length; i++) {
            if (overlays_stack[i].node.contains(target)) return
         }
         this.close()
      }
   }
   private updateArrow() {
      if (!this.arrow || !this.node || !this.tracked) return
      const nodeRect = this.node.getBoundingClientRect()
      const trackedRect = this.tracked.getBoundingClientRect()
      const { style } = this.arrow
      const half = PopoverArrowSize / 2
      const inset = 10
      const clamp = (v: number, max: number) => Math.min(Math.max(v, inset), Math.max(inset, max))
      const below = nodeRect.top >= trackedRect.bottom - 2
      const above = nodeRect.bottom <= trackedRect.top + 2
      if (below || above) {
         const x = clamp(trackedRect.left + trackedRect.width / 2 - nodeRect.left - half, nodeRect.width - PopoverArrowSize)
         style.left = `${x}px`
         style.top = below ? `${-half}px` : "auto"
         style.bottom = above ? `${-half}px` : "auto"
         style.right = "auto"
         this.arrow.className = `jtd-popover-arrow ${below ? "up" : "down"}`
      }
      else {
         const right = nodeRect.left >= trackedRect.right - 2
         const y = clamp(trackedRect.top + trackedRect.height / 2 - nodeRect.top - half, nodeRect.height - PopoverArrowSize)
         style.top = `${y}px`
         style.left = right ? "auto" : `${-half}px`
         style.right = right ? `${-half}px` : "auto"
         style.bottom = "auto"
         this.arrow.className = `jtd-popover-arrow ${right ? "left" : "right"}`
      }
   }
   private hide() {
      if (this.root) {

          // Remove popup
          removeOutsideEventListener(this._handleClickOutside)
          document.body.removeChild(this.node)
          this.root.unmount()
          this.root = null
          this.node = null
          this.arrow = null

         // Close sub popup when not the top of stack
         if (this.stackIndex < overlays_stack.length - 1) {
            overlays_stack[this.stackIndex + 1].close()
         }
         overlays_stack.pop()
      }
   }
   private close() {
      if (this.main) {
         this.main.close()
      }
   }
   appendPanel(panel: Panel) {
      if (panel !== this.main) {
         this.close()
         this.main = panel
         this.refresh(panel)
      }
   }
   removePanel(panel: Panel) {
      if (panel == this.main) {
         this.main = null
         this.hide()
      }
   }
   refresh(panel: Panel) {
      if (panel == this.main) {
         const displayed = this.main?.displayed
         if (displayed) {
            if (this.show()) {
               this.root.render(displayed.content)
            }
         }
         else {
            this.hide()
         }
      }
   }
}

const variantClasses = {
   "default": "jtd-panel-floating-dock menu",
   "menu": "jtd-panel-floating-dock menu",
   "popup": "jtd-panel-floating-dock popup",
   "popover": "jtd-panel-floating-dock popover",
}

const PopoverArrowSize = 12

const stopableEvents = ["click", "dbclick", "contextmenu"]

function getTrackedElement(target: FloatingTarget): Element {
   if (target instanceof Object) {
      if (target instanceof Element) {
         return target
      }
      else if (target["currentTarget"] instanceof Element) {
         if (stopableEvents.indexOf(target["type"]) >= 0) {
            if (target["stopPropagation"] instanceof Function) target["stopPropagation"]()
            if (target["preventDefault"] instanceof Function) target["preventDefault"]()
         }
         return target["currentTarget"]
      }
      else if (target["target"] instanceof Element) {
         return target["target"]
      }
      else if (target instanceof React.Component) {
         return ReactDOM.findDOMNode(target) as Element
      }
   }
   throw new Error("target is invalid")
}

export function createFloatingDock(
   target: FloatingTarget,
   options?: FloatingDockOptions
): FloatingDock {
   const dock = new FloatingDock(options || {})
   dock.stick(target)
   return dock
}
