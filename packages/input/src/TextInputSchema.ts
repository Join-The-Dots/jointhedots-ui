import { HTMLInputTypeAttribute } from "react"
import { JSONSchema } from "@jointhedots/core"

export function TextInputSchema(placeholder: string | number, type: HTMLInputTypeAttribute): JSONSchema {
   return { type: "string", format: type, default: placeholder }
}
