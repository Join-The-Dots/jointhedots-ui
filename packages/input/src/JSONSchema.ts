export type JSONSchemaOption = { const: unknown, title?: string }

/** The JSON Schema subset driving inputs. */
export type JSONSchema = {
   type?: "string" | "number" | "integer" | "boolean" | "array"
   format?: string
   enum?: unknown[]
   oneOf?: JSONSchemaOption[]
   items?: JSONSchema
   default?: unknown
   examples?: unknown[]
   minLength?: number
   maxLength?: number
   pattern?: string
   minimum?: number
   maximum?: number
   multipleOf?: number
   minItems?: number
   maxItems?: number
   contentMediaType?: string
}

export type SchemaOption = { value: unknown, label: string }

/** The restricted choices of a schema: `oneOf` constants with their titles, else `enum` values. */
export function getSchemaOptions(schema?: JSONSchema): SchemaOption[] | undefined {
   if (schema?.oneOf) return schema.oneOf.map((option) => ({ value: option.const, label: option.title ?? String(option.const) }))
   if (schema?.enum) return schema.enum.map((value) => ({ value, label: String(value) }))
   return undefined
}
