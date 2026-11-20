import { injectStyles } from "./inject-styles.ts"
import styles from "./Input.scss?inline"

injectStyles(styles, "jtd-input-styles")

export * from "./InputData.tsx"
export * from "./JSONSchema.ts"
export * from "./TextInputSchema.ts"
export * from "./validateData.ts"
