import React from "react"
import { ThemeContext, ThemeProvider } from "@jointhedots/theme"
import { IconUrlCollection } from "./collections/url.tsx"
import { IconBlank, IconError } from "./collections/defaults.tsx"
import { injectStyles } from "./inject-styles.ts"
import styles from "./style.scss?inline"

injectStyles(styles, "jtd-icon-styles")

export interface IconStyle {
   className?: string
   style?: Record<string, string | number>
}

export interface IconElement {
   collection: IconCollection
   name: string
   className: string
   style: Record<string, string | number>
   [key: string]: any
}

export interface IconComposed extends IconStyle {
   elements: IconElement[]
}

export interface IconCollection {
   setup(element: IconElement): void
   draw(element: IconElement, theme: ThemeProvider): React.ReactElement
}

export enum IconSize {
   xs = "0.8em",
   sm = "1.0em",
   md = "1.5em",
   lg = "2.0em",
}

export type IconProps = {
   name: string
   size?: keyof typeof IconSize | string // default is 'sm'
   inverse?: boolean
   title?: string
   className?: string
   style?: React.CSSProperties
   onClick?: (evt: React.MouseEvent<HTMLSpanElement>) => void
}

export function registerIconCollection(namespace: string, collection: IconCollection) {
   IconCollections[namespace] = collection
}

export function getIconName(icon?: string, name?: string): string {
   if (icon) {
      return icon
   }
   else if (name) {
      return "avatar:" + name
   }
   return "blank"
}

export function Icon(props: IconProps): React.ReactElement {
   const { name, size, inverse: inversed, title, className, style } = props
   const theme = React.useContext(ThemeContext)
   const icon = getIconParsed(name)
   const iconTheme = inversed ? theme.contrastTheme : theme
   const iconLayers = []
   for (const element of icon.elements) {
      iconLayers.push(element.collection.draw(element, iconTheme))
   }
   return React.createElement("span", {
      ...props,
      name: undefined,
      inverse: undefined,
      role: title ? "img" : undefined,
      "aria-label": title,
      "aria-hidden": title ? undefined : true,
      className: (className && icon.className)
         ? `${className} ${icon.className}`
         : (className || icon.className),
      style: {
         fontSize: size && (IconSize[size as keyof typeof IconSize] || size),
         ...style,
         ...icon.style,
      }
   }, ...iconLayers)
}

const ErrorCollection = new IconError()

const IconCollections: { [namespace: string]: IconCollection } = {
   "blank": new IconBlank(),
   "?": ErrorCollection,
}

const IconParsedCache = new Map<string, IconComposed>()

const IconFlags: Record<string, IconStyle> = {
    "error": makeColorFlag("var(--jtd-error)"),
    "warning": makeColorFlag("var(--jtd-warning)"),
    "info": makeColorFlag("var(--jtd-muted)"),
    "primary": makeColorFlag("var(--jtd-primary)"),
    "secondary": makeColorFlag("var(--jtd-muted)"),
    "success": makeColorFlag("var(--jtd-success)"),
   "badge": {
      style: {
         "fontSize": "0.6em",
         "top": "-0.3em", "right": "-0.3em",
         "left": "unset", "bottom": "unset",
      }
   },
   "RT": {
      style: {
         "fontSize": "0.6em",
         "top": "-0.3em", "right": "-0.3em",
         "left": "unset", "bottom": "unset",
      }
   },
   "RB": {
      style: {
         "fontSize": "0.6em",
         "bottom": "-0.3em", "right": "-0.3em",
         "left": "unset", "top": "unset",
      }
   },
   "LT": {
      style: {
         "fontSize": "0.6em",
         "top": "-0.3em", "left": "-0.3em",
         "right": "unset", "bottom": "unset",
      }
   },
   "LB": {
      style: {
         "fontSize": "0.6em",
         "bottom": "-0.3em", "left": "-0.3em",
         "right": "unset", "top": "unset",
      }
   },
}

// Inline so collection stylesheets (e.g. flag-icons `.fi { position: relative }`)
// can never wrestle a layer out of the unit box
const IconLayerStyle: Record<string, string | number> = {
   position: "absolute",
   top: 0, right: 0, bottom: 0, left: 0,
}

const IconBaseRegex = /^(?:\[(?<options>[^\]]*)\])?(?<elements>.*)$/
const IconElementRegex = /^(?:(?<set>[a-z0-9-_@]+):)?(?<name>[^\[]+)(?:\[(?<options>[^\]]*)\])?$/

registerIconCollection("data", new IconUrlCollection(""))

function makeColorFlag(color: string): IconStyle {
   return {
      style: { color, "--color": color },
   }
}

function parseIconStyle(icon: IconStyle, options?: string) {
   if (options) {
      const style = icon.style || {}
      const classnames: string[] = []
      if (icon.className) {
         classnames.push(icon.className)
      }
      for (const opt of options.split(',')) {
         const [key = "", val] = opt.split('=')
         if (val) {
            style["--" + key] = val
         }
         else {
            const flag = IconFlags[key]
            if (flag) {
               if (flag.className) classnames.push(flag.className)
               Object.assign(style, flag.style)
            }
            else {
               console.error(`Icon option '${options}' has invalid flag '${key}'`)
            }
         }
      }
      icon.className = classnames.join(" ")
      icon.style = style
   }
}

function parseIconElement(icon: IconComposed, name: string) {
   let element: IconElement
   const match = name.match(IconElementRegex)
   if (match && match.groups) {
      const { set, name = "", options } = match.groups
      const collection = (set ? IconCollections[set] : IconCollections[name]) || ErrorCollection
      element = { collection, name, className: "", style: { ...IconLayerStyle } }
      parseIconStyle(element, options)
   }
   else {
      element = { collection: ErrorCollection, name, className: "", style: { ...IconLayerStyle } }
      console.error(`Icon element '${name}' is invalid`)
   }
   element.collection.setup(element)
   icon.elements.push(element)
}

function parseIconStack(name: string): IconComposed {
   const icon: IconComposed = {
      elements: [],
      className: "jtd-icon"
   }
   const match = name.match(IconBaseRegex)
   if (match && match.groups) {
      const { options, elements = "" } = match.groups
      parseIconStyle(icon, options)
      for (const element of elements.split("|")) {
         parseIconElement(icon, element)
      }
   }
   else {
      console.error(`Icon '${name}' is invalid`)
      icon.elements.push({ collection: ErrorCollection, name, className: "", style: { ...IconLayerStyle } })
   }
   return icon
}

function getIconParsed(name: string): IconComposed {
   let parsed = IconParsedCache.get(name)
   if (!parsed) {
      if (typeof name !== "string") {
         if (name === undefined) name = "blank"
         else if (name === null) name = "blank"
         else if (typeof name === "number") name = `label:${name}`
         else name = `error:typeof ${typeof name}`
      }
      parsed = parseIconStack(name)
      IconParsedCache.set(name, parsed)
   }
   return parsed
}
