import type { JSONSchema } from "./JSONSchema.ts"

export type ValidationCode =
   "required" | "minLength" | "maxLength" | "pattern" | "format" | "minimum" | "maximum" | "integer" | "minItems" | "maxItems"

export type ValidationError = { code: ValidationCode, message: string }

const formats: Record<string, (value: string) => boolean> = {
   email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
   url: (value) => URL.canParse(value),
   uri: (value) => URL.canParse(value),
}

/** First constraint of `schema` (and `required`) that `value` breaks, or `undefined` when it is valid. */
export function validateData(schema: JSONSchema, value: unknown, required?: boolean): ValidationError | undefined {
   const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)
   if (empty) return required ? { code: "required", message: "This field is required." } : undefined
   if (typeof value === "string") {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
         return { code: "minLength", message: `Enter at least ${schema.minLength} characters.` }
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
         return { code: "maxLength", message: `Enter at most ${schema.maxLength} characters.` }
      }
      if (schema.pattern !== undefined && !new RegExp(schema.pattern, "u").test(value)) {
         return { code: "pattern", message: "The value does not have the expected form." }
      }
      const format = schema.format && formats[schema.format]
      if (format && !format(value)) {
         return { code: "format", message: `Enter a valid ${schema.format}.` }
      }
   }
   if (typeof value === "number") {
      if (schema.type === "integer" && !Number.isInteger(value)) {
         return { code: "integer", message: "Enter a whole number." }
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
         return { code: "minimum", message: `Enter ${schema.minimum} or more.` }
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
         return { code: "maximum", message: `Enter ${schema.maximum} or less.` }
      }
   }
   if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
         return { code: "minItems", message: `Choose at least ${schema.minItems}.` }
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
         return { code: "maxItems", message: `Choose at most ${schema.maxItems}.` }
      }
   }
   return undefined
}
