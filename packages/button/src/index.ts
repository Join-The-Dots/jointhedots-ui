import { injectStyles } from "./inject-styles.ts"
import styles from "./Button.scss?inline"

injectStyles(styles, "jtd-button-styles")

export * from "./Button.tsx"
export { Button as default } from "./Button.tsx"
