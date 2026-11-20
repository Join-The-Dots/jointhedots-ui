import React, { useEffect, useRef } from "react"
import { type ItemProps, ItemRowRich, ItemRowShort } from "../../Items/index.tsx"
import { openContextualMenu } from "../open.tsx"

type MenuProps = {
   children?: React.ReactNode
   className?: string
   "aria-label"?: string
}

type MenuItemProps = ItemProps & {
   children?: React.ReactNode
   onClick?: (event: React.SyntheticEvent) => void
   onMouseEnter?: (event: React.SyntheticEvent) => void
   onElementRef?: (element: HTMLElement | null) => void
}

type AnchorProps = {
   children?: React.ReactNode
   onClick?: (event: React.SyntheticEvent) => void
}

const itemSelector = "[role=menuitem]"

/** Menu container: focuses its first item, moves between items with the arrow keys, Home and End. */
export function Menu(props: MenuProps) {
   const ref = useRef<HTMLDivElement>(null)
   useEffect(() => {
      ref.current?.querySelector<HTMLElement>(itemSelector)?.focus()
   }, [])
   const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>(itemSelector)]
      const index = items.indexOf(document.activeElement as HTMLElement)
      const target = {
         ArrowDown: items[(index + 1) % items.length],
         ArrowUp: items[(index - 1 + items.length) % items.length],
         Home: items[0],
         End: items[items.length - 1],
      }[event.key]
      if (target) {
         event.preventDefault()
         target.focus()
      }
   }
   return <div
      ref={ref}
      role="menu"
      aria-label={props["aria-label"]}
      className={props.className ? `jtd-menu ${props.className}` : "jtd-menu"}
      onKeyDown={onKeyDown}
   >
      {props.children}
   </div>
}

function menuItemProps(props: MenuItemProps) {
   const { children } = props
   let onClick = props.onClick
   let onMouseEnter = props.onMouseEnter
   let onMouseLeave: (() => void) | undefined
   if (children) {
      let close: (() => void) | undefined
      const submenu = () => <Menu>{children}</Menu>
      onMouseEnter = (e) => {
         openContextualMenu(e, (f) => {
            close = f
            return submenu()
         })
      }
      onMouseLeave = () => close?.()
      onClick ??= (e) => openContextualMenu(e, submenu)
   }
   const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      const opens = event.key === "Enter" || event.key === " " || (children && event.key === "ArrowRight")
      if (opens && event.target === event.currentTarget) {
         event.preventDefault()
         event.currentTarget.click()
      }
   }
   return {
      role: "menuitem",
      tabIndex: -1,
      "aria-haspopup": children ? "menu" as const : undefined,
      "aria-current": props.current || undefined,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
   }
}

function MenuItem(props: MenuItemProps) {
   return <div className="jtd-menu-item" {...menuItemProps(props)}>
      <ItemRowShort {...props} onActivate={undefined} onSelect={undefined} />
   </div>
}

function MenuLargeItem(props: MenuItemProps) {
   return <div className="jtd-menu-item-large" ref={props.onElementRef} {...menuItemProps(props)}>
      <ItemRowRich {...props} onActivate={undefined} onSelect={undefined} content={undefined} tooling={undefined} />
   </div>
}

function MenuAnchor(props: AnchorProps) {
   const { children, onClick } = props
   return <button type="button" className="jtd-menu-anchor" aria-haspopup="menu" onClick={onClick}>{children}</button>
}

function MenuSeparator() {
   return <div className="jtd-menu-separator" role="separator" />
}

function MenuSection(props: { title?: string, children?: React.ReactNode }) {
   return <div role="group" aria-label={props.title}>
      <div className="jtd-menu-separator">
         {props.title}
      </div>
      {props.children}
   </div>
}

Menu.Item = MenuItem
Menu.LargeItem = MenuLargeItem
Menu.Anchor = MenuAnchor
Menu.Separator = MenuSeparator
Menu.Section = MenuSection
