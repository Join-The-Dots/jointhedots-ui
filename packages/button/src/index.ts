import { injectStyles } from "./inject-styles"
import styles from "./generated/styles"

injectStyles(styles, "jtd-button-styles")

export * from "./Button"
export { Button as default } from "./Button"
