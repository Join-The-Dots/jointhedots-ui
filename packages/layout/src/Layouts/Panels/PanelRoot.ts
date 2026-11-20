import ReactDOMClient from "react-dom/client"

/**
 * A React root rendering a dock in a node of its own at the root of the document body, unmounted
 * after the current commit so that a panel can be closed from an effect.
 */
export class PanelRoot {
   private node?: HTMLElement
   private root?: ReactDOMClient.Root

   render(node: React.ReactNode) {
      if (!this.root) {
         this.node = document.createElement("div")
         document.body.appendChild(this.node)
         this.root = ReactDOMClient.createRoot(this.node)
      }
      this.root.render(node)
   }
   unmount() {
      const { root, node } = this
      this.root = undefined
      this.node = undefined
      if (root) {
         queueMicrotask(() => {
            root.unmount()
            node?.remove()
         })
      }
   }
}
