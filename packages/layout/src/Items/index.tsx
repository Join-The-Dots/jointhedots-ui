import React from "react"
import { Menu } from "../Layouts/Menu/index.tsx"
import Icon, { getIconName } from "@jointhedots/icon"
import { toast } from 'react-toastify'
import { createFloatingDock, type FloatingTarget } from "../Layouts/Panels/FloatingDock.tsx"
import type { PanelDock } from "../Layouts/Panels/index.ts"
import { openContextualMenu } from "../Layouts/open.tsx"
import { ButtonIcon } from "@jointhedots/button"

export type ShapeDecoration = {
   type: "shape"
   color: string
}

export type BadgeDecoration = {
   type: "badge"
   name: string
}

export type LabelDecoration = ShapeDecoration | BadgeDecoration

export type LabelProps<T = any> = {
   name: string // Object name
   icon?: string // Object icon
   decorations?: LabelDecoration[]
   tooling?: (ToolingProps | false | null | undefined)[] // Object tooling list
   summary?: React.ReactNode // Object short description
   tooltip?: DisplayProps // Object tooltip
   content?: DisplayProps // Object content
   data?: T // Object custom data
   onActivate?: (label: LabelProps, dock: PanelDock) => void | Promise<void> // On Object activation
}

export enum LabelSelected {
   None,
   Enabled = 1,
   Disabled = 2,
   Editable = 4,
   EnabledEditable = Enabled | Editable,
   DisabledEditable = Disabled | Editable,
}

export type ToolingProps = LabelProps & {
   optional?: boolean
}

export type ItemVariant = "minimal" | "outlined"

export type ItemTextOverflow = "wrap" | "truncate"

export type ItemProps<T = any> = LabelProps<T> & {
   /** Leading visual replacing the icon, such as an avatar image. */
   avatar?: React.ReactNode
   tags?: TagProps[]
   /** Trailing actions, after the tooling. */
   actions?: React.ReactNode
   selected?: LabelSelected
   /** Marks the item as the current one of its list (current organization, page…). */
   current?: boolean
   onSelect?: (item: ItemProps) => void
   variant?: ItemVariant
   textOverflow?: ItemTextOverflow
}

export type DisplayProps = React.ReactNode | ((props: LabelProps) => React.ReactElement)

export type TagProps = string | React.ReactElement | LabelProps

function GetNodeText(node?: React.ReactNode): string | undefined {
   return (typeof node === "string") ? node : undefined
}

function DrawLabelIcon(label: ItemProps): React.ReactNode {
   const { icon, name, decorations, avatar } = label
   if (avatar) return avatar
   let content = <Icon name={getIconName(icon, name)} />
   for (const deco of decorations ?? []) {
      if (deco.type === "shape") {
         content = <div className="colored" style={{ "--jtd-item-color": deco.color } as React.CSSProperties}>
            <div className="colored-inner">
               {content}
            </div>
         </div>
      }
      if (deco.type === "badge") {
         content = <div className="badged">
            {content}
            <Icon className="badge" name={deco.name} />
         </div>
      }
   }
   return content
}

function DrawTag(tag: TagProps, key: number): React.ReactNode {
   if (typeof tag === "string") return <span key={key} className="jtd-item-tag">{tag}</span>
   if (React.isValidElement(tag)) return <React.Fragment key={key}>{tag}</React.Fragment>
   return <span key={key} className="jtd-item-tag" title={GetNodeText(tag.summary)}>
      {tag.icon ? <Icon name={tag.icon} /> : null}{tag.name}
   </span>
}

function DrawDisplay(label: LabelProps, display: DisplayProps): React.ReactNode {
   if (display instanceof Function) {
      return display(label)
   }
   return display
}

function DrawToolingMenu(tooling: ToolingProps[], onClose: () => void): React.ReactNode {
   return <Menu>
      {tooling.map((label, i) => <Menu.Item
         key={i}
         name={label.name}
         icon={label.icon}
         onClick={(e) => {
            onClose()
            label.onActivate?.(label, createFloatingDock(e))
         }}
      />)}
   </Menu>
}

export function DrawToolingWidgets(tooling: LabelProps["tooling"]): React.ReactNode {
   const labels = (tooling ?? []).filter((label): label is ToolingProps => !!label)
   const buttons = labels.filter((label) => !label.optional).map((label, i) => <LabelButton key={i} {...label} />)
   if (labels.some((label) => label.optional)) {
      buttons.push(<ButtonIcon
         key="more"
         icon="bi:three-dots-vertical"
         title="More actions"
         aria-haspopup="menu"
         onClick={(e) => {
            e.stopPropagation()
            openContextualMenu(e, (close) => DrawToolingMenu(labels, close))
         }}
      />)
   }
   return buttons.length > 0 ? <>{buttons}</> : null
}

function Switch(props: {
   selected?: boolean
   onSelect?: (event: React.SyntheticEvent) => void
}) {
   const { selected, onSelect } = props
   return <ButtonIcon
      icon={selected ? "bi:check-circle" : "bi:circle"}
      hoveredIcon={selected ? "bi:circle" : "bi:check-circle"}
      title={selected ? "Deselect" : "Select"}
      aria-pressed={!!selected}
      onClick={onSelect}
   />
}

async function activate(label: LabelProps, target: FloatingTarget) {
   try {
      await label.onActivate?.(label, createFloatingDock(target))
   } catch (e) {
      console.error(label.name + ".onActivate", e)
      toast.error(e instanceof Error ? e.message : String(e))
   }
}

export function LabelButton(label: LabelProps) {
   const onClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (label.onActivate) {
         activate(label, e)
      }
      else if (label.content) {
         openContextualMenu(e, () => DrawDisplay(label, label.content))
      }
   }
   return <ButtonIcon
      icon={getIconName(label.icon, label.name)}
      title={GetNodeText(label.summary) || label.name}
      onClick={onClick}
   />
}

/** Props making an element activable by click, Enter and Space, and focusable. */
function activableProps(onActivate: ((event: React.SyntheticEvent) => void) | undefined) {
   if (!onActivate) return {}
   return {
      role: "button",
      tabIndex: 0,
      onClick: onActivate,
      onKeyDown: (event: React.KeyboardEvent) => {
         if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
            event.preventDefault()
            onActivate(event)
         }
      },
   }
}

export function ItemIcon(item: LabelProps) {
   const { summary, onActivate } = item
   return <div
      className="jtd-item-short"
      title={GetNodeText(summary) || item.name}
      {...activableProps(onActivate && ((e) => activate(item, e)))}
   >
      <div className="item-icon">{DrawLabelIcon(item)}</div>
   </div>
}

function ItemRowClasses(item: ItemProps, base: string): string {
   const classes = [base, item.variant || "minimal"]
   if (item.textOverflow === "truncate") classes.push("truncate")
   if ((item.selected ?? 0) & LabelSelected.Enabled) classes.push("selected")
   if (item.current) classes.push("current")
   return classes.join(" ")
}

function ItemSwitch(item: ItemProps) {
   const onSelect = item.onSelect && ((e: React.SyntheticEvent) => { e.stopPropagation(); item.onSelect!(item) })
   if (item.selected === LabelSelected.EnabledEditable) return <Switch selected={true} onSelect={onSelect} />
   if (item.selected === LabelSelected.DisabledEditable) return <Switch selected={false} onSelect={onSelect} />
   return null
}

export function ItemRowShort(item: ItemProps) {
   const { name, summary, onSelect, onActivate } = item
   const onRowActivate = onActivate
      ? (e: React.SyntheticEvent) => { e.stopPropagation(); activate(item, e) }
      : onSelect && ((e: React.SyntheticEvent) => { e.stopPropagation(); onSelect(item) })
   return <div
      className={ItemRowClasses(item, "jtd-item-short")}
      title={GetNodeText(summary)}
      aria-current={item.current || undefined}
      {...activableProps(onRowActivate)}
   >
      <div className="item-icon">{DrawLabelIcon(item)}</div>
      <div className="item-infos">{name}</div>
      <ItemSwitch {...item} />
   </div>
}

export function ItemRowRich(item: ItemProps) {
   const { name, summary, content, tags, actions, onSelect, onActivate } = item
   let onMouseEnter: ((e: React.MouseEvent) => void) | undefined
   let onMouseLeave: (() => void) | undefined
   let onRowActivate: ((e: React.SyntheticEvent) => void) | undefined
   if (onActivate) {
      onRowActivate = (e) => { e.stopPropagation(); activate(item, e) }
   }
   else if (content) {
      onRowActivate = (e) => { openContextualMenu(e, () => DrawDisplay(item, content)) }
   }
   else if (onSelect) {
      onRowActivate = (e) => { e.stopPropagation(); onSelect(item) }
   }
   if (content) {
      let close: (() => void) | undefined
      onMouseEnter = (e) => {
         openContextualMenu(e, (f) => {
            close = f
            return DrawDisplay(item, content)
         })
      }
      onMouseLeave = () => close?.()
   }
   return <div
      className={ItemRowClasses(item, "jtd-item-large")}
      title={GetNodeText(summary)}
      aria-current={item.current || undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...activableProps(onRowActivate)}
   >
      <ItemSwitch {...item} />
      <div className="item-icon">{DrawLabelIcon(item)}</div>
      <div className="item-infos">
         <div className="item-title">
            <span className="item-name">{name}</span>
            {tags?.map(DrawTag)}
         </div>
         {summary ? <div className="item-summary">{summary}</div> : null}
      </div>
      {DrawToolingWidgets(item.tooling)}
      {actions ? <div className="item-actions" onClick={(e) => e.stopPropagation()}>{actions}</div> : null}
   </div>
}
