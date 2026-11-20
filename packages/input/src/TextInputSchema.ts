import type { HTMLInputTypeAttribute } from "react"
import type { JSONSchema } from "./JSONSchema.ts"

export function TextInputSchema(placeholder: string | number, type: HTMLInputTypeAttribute): JSONSchema {
   return { type: "string", format: type, examples: [placeholder] }
}
