import { injectStyles } from "./inject-styles.ts"
import panelStyles from "./Layouts/Panels/style.scss?inline"
import menuStyles from "./Layouts/Menu/style.scss?inline"
import itemStyles from "./Items/style.scss?inline"

injectStyles(panelStyles + menuStyles + itemStyles, "jtd-layout-styles")

export * from "./Layouts/index.tsx"
export * from "./Items/index.tsx"
