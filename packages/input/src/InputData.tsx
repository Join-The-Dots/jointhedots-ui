import React, { useEffect, useId, useImperativeHandle, useLayoutEffect, useRef } from "react"
import Icon, { IconSize } from "@jointhedots/icon"
import { DrawToolingWidgets, Menu, openContextualMenu, type ToolingProps } from "@jointhedots/layout"
import { getSchemaOptions, type JSONSchema, type SchemaOption } from "./JSONSchema.ts"
import { validateData, type ValidationError } from "./validateData.ts"

export type InputControl = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement

export type InputDataProps = {
   value: any
   schema: JSONSchema
   onChange: (value: any) => void
   label?: React.ReactNode
   hint?: React.ReactNode
   /** Error shown under the field; marks the control invalid. */
   error?: React.ReactNode
   /** Receives the first schema constraint the value breaks, or `undefined`, whenever it changes. */
   onValidate?: (error: ValidationError | undefined) => void
   placeholder?: string
   /** Suggested values of a text field. */
   suggestions?: string[]
   /** Presentation of restricted choices. Default `select`. */
   variant?: "select" | "radio" | "segmented"
   rows?: number
   monospace?: boolean
   autoGrow?: boolean
   icon?: string
   tooling?: ToolingProps[]
   size?: keyof typeof IconSize
   id?: string
   name?: string
   disabled?: boolean
   readOnly?: boolean
   required?: boolean
   autoFocus?: boolean
   autoComplete?: string
   className?: string
   onBlur?: (event: React.FocusEvent<InputControl>) => void
   onKeyDown?: (event: React.KeyboardEvent<InputControl>) => void
}

const inputTypes: Record<string, string> = { "date-time": "datetime-local" }

export const InputData = React.forwardRef<InputControl, InputDataProps>(function InputData(props, ref) {
   const { value, onChange, schema, label, hint, error, onValidate, icon, tooling, size = "md", required } = props
   const generatedId = useId()
   const id = props.id ?? generatedId
   const controlRef = useRef<InputControl>(null)
   useImperativeHandle(ref, () => controlRef.current!, [])
   const validate = useRef(onValidate)
   validate.current = onValidate
   useEffect(() => {
      validate.current?.(validateData(schema, value, required))
   }, [schema, value, required])
   useLayoutEffect(() => {
      const control = controlRef.current
      if (!props.autoGrow || !(control instanceof HTMLTextAreaElement)) return
      control.style.height = "auto"
      control.style.height = `${control.scrollHeight}px`
   }, [props.autoGrow, value])

   const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined
   const native = {
      id,
      name: props.name,
      disabled: props.disabled,
      required,
      autoFocus: props.autoFocus,
      onBlur: props.onBlur,
      onKeyDown: props.onKeyDown,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
   }
   const fieldClass = ["jtd-field", size !== "md" && `jtd-field--${size}`, error && "jtd-field--invalid", props.className]
      .filter(Boolean).join(" ")
   const notes = <>
      {hint ? <span id={`${id}-hint`} className="jtd-field-hint">{hint}</span> : null}
      {error ? <span id={`${id}-error`} className="jtd-field-error" role="alert">{error}</span> : null}
   </>

   const options = getSchemaOptions(schema.type === "array" ? schema.items : schema)
   const grouped = schema.type === "array" || (options && props.variant && props.variant !== "select")
   if (schema.type === "boolean" || (grouped && options)) {
      const choice = (option: SchemaOption, i: number) => {
         const checked = schema.type === "array" ? (value ?? []).includes(option.value) : value === option.value
         const change = () => onChange(schema.type === "array"
            ? options!.filter((o) => o === option ? !checked : (value ?? []).includes(o.value)).map((o) => o.value)
            : option.value)
         return <label key={i} className="jtd-choice">
            <input
               type={schema.type === "array" ? "checkbox" : "radio"}
               name={props.name ?? id}
               checked={checked}
               disabled={props.disabled || props.readOnly}
               onChange={change}
            />
            <span>{option.label}</span>
         </label>
      }
      if (schema.type === "boolean") {
         return <div className={fieldClass}>
            <label className="jtd-choice">
               <input
                  {...native}
                  ref={controlRef as React.Ref<HTMLInputElement>}
                  type="checkbox"
                  className="jtd-checkbox"
                  checked={!!value}
                  readOnly={props.readOnly}
                  onChange={(e) => props.readOnly || onChange(e.target.checked)}
               />
               {label ? <span className="jtd-field-label">{label}</span> : null}
            </label>
            {notes}
         </div>
      }
      return <fieldset
         className={fieldClass}
         role={schema.type === "array" ? "group" : "radiogroup"}
         aria-invalid={native["aria-invalid"]}
         aria-describedby={describedBy}
      >
         {label ? <legend className="jtd-field-label">{label}</legend> : null}
         <div className={props.variant === "segmented" ? "jtd-choices jtd-segmented" : "jtd-choices"}>
            {options!.map(choice)}
         </div>
         {notes}
      </fieldset>
   }

   const placeholder = props.placeholder ?? (schema.examples?.[0] === undefined ? undefined : String(schema.examples[0]))
   const renderControl = () => {
      if (options) {
         const current = options.find((option) => option.value === value)
         const openMenu = (e: React.MouseEvent) => {
            e.stopPropagation()
            openContextualMenu<SchemaOption>(e, (close) => <Menu>
               {options.map((option, i) => <Menu.Item
                  key={i}
                  name={option.label}
                  icon={option === current ? "bi:check-lg" : "blank"}
                  current={option === current}
                  onClick={() => close(option)}
               />)}
            </Menu>, { position: "down-left" }).then((option) => {
               if (option) onChange(option.value)
            })
         }
         return <button
            {...native}
            ref={controlRef as React.Ref<HTMLButtonElement>}
            type="button"
            className="jtd-input jtd-select"
            aria-haspopup="menu"
            disabled={props.disabled || props.readOnly}
            onClick={openMenu}
         >
            <span className={current ? "jtd-select-value" : "jtd-select-value jtd-select-placeholder"}>
               {current?.label ?? placeholder}
            </span>
            <Icon className="jtd-select-caret" name="bi:chevron-down" />
         </button>
      }

      const text = {
         ...native,
         className: props.monospace ? "jtd-input jtd-input--monospace" : "jtd-input",
         placeholder,
         readOnly: props.readOnly,
         autoComplete: props.autoComplete,
         minLength: schema.minLength,
         maxLength: schema.maxLength,
      }
      if (schema.format === "textarea") {
         return <textarea
            {...text}
            ref={controlRef as React.Ref<HTMLTextAreaElement>}
            rows={props.rows ?? 3}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
         />
      }
      if (schema.format === "file") {
         return <input
            {...native}
            ref={controlRef as React.Ref<HTMLInputElement>}
            className="jtd-input"
            type="file"
            accept={schema.contentMediaType}
            onChange={(e) => onChange(e.target.files?.[0])}
         />
      }
      if (schema.type === "number" || schema.type === "integer") {
         return <input
            {...text}
            ref={controlRef as React.Ref<HTMLInputElement>}
            type="number"
            min={schema.minimum}
            max={schema.maximum}
            step={schema.multipleOf ?? (schema.type === "integer" ? 1 : "any")}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
         />
      }
      return <>
         <input
            {...text}
            ref={controlRef as React.Ref<HTMLInputElement>}
            type={schema.format ? inputTypes[schema.format] ?? schema.format : "text"}
            pattern={schema.pattern}
            list={props.suggestions ? `${id}-suggestions` : undefined}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
         />
         {props.suggestions
            ? <datalist id={`${id}-suggestions`}>{props.suggestions.map((s) => <option key={s} value={s} />)}</datalist>
            : null}
      </>
   }

   return <div className={fieldClass}>
      {label ? <label className="jtd-field-label" htmlFor={id}>{label}</label> : null}
      <div className="jtd-field-control">
         {icon ? <Icon className="jtd-field-icon" name={icon} /> : null}
         {renderControl()}
         {tooling && tooling.length ? <div className="jtd-field-tooling">{DrawToolingWidgets(tooling)}</div> : null}
      </div>
      {notes}
   </div>
})
