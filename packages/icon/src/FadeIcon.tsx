import React from "react"
import { Icon, IconProps, IconSize } from "./Icon"

export type FadeIconProps = IconProps & {
   duration?: number // milliseconds, default 300
}

interface FadeState {
   name: string
   retired: string | null
}

// Same rationale as IconLayerStyle: collection stylesheets must not
// wrestle a fade layer out of the unit box
const FadeLayerStyle: Record<string, string | number> = {
   position: "absolute",
   top: 0, right: 0, bottom: 0, left: 0,
}

const DefaultFadeDuration = 300

export function FadeIcon(props: FadeIconProps): React.ReactElement {
   const { name, size, inverse, duration = DefaultFadeDuration, className, style } = props
   const [state, setState] = React.useState<FadeState>({ name, retired: null })
   // Adjust state during render so the retiring layer and the new one land
   // in the same commit — an effect would leave one frame without the old icon
   if (state.name !== name) {
      setState({ name, retired: state.name })
   }
   const layers = [
      React.createElement("div", { key: String(name), style: { ...FadeLayerStyle } },
         React.createElement(Icon, { name, inverse })),
   ]
   if (state.retired) {
      // The retiring layer fades out on top, revealing the new icon below
      layers.push(React.createElement("div", {
         key: String(state.retired),
         style: { ...FadeLayerStyle, opacity: 0, transition: `opacity ${duration}ms ease` },
         onTransitionEnd: (evt: React.TransitionEvent<HTMLDivElement>) => {
            if (evt.target === evt.currentTarget && evt.propertyName === "opacity") {
               setState((current) => ({ ...current, retired: null }))
            }
         },
      }, React.createElement(Icon, { name: state.retired, inverse })))
   }
   return React.createElement("div", {
      ...props,
      name: undefined,
      size: undefined,
      inverse: undefined,
      duration: undefined,
      className: ["jtd-icon-fade", className].filter(Boolean).join(" ") || undefined,
      style: {
         fontSize: size && (IconSize[size] || size),
         ...style,
      },
   }, ...layers)
}
