import React from "react"
import Icon, { IconSize } from "@jointhedots/icon"
import { JSONSchema } from "@jointhedots/core"
import { DrawToolingWidgets, Menu, openContextualMenu, ToolingProps } from "@jointhedots/layout"

type InputProps = {
   label?: React.ReactNode
   icon?: string
   tooling?: ToolingProps[]
   size?: keyof typeof IconSize
   value: any
   schema: JSONSchema
   onChange: (value: any) => void
}

export const InputData: React.FC<InputProps> = ({ value, onChange, schema, icon, label, tooling, size = "md" }) => {
   const fieldClass = size === "md" ? "jtd-field" : `jtd-field jtd-field--${size}`
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const inputType = schema.type
      let newValue: any = e.target.value

      if (inputType === "number" || inputType === "integer") {
         newValue = Number(newValue)
      }

      onChange(newValue)
   }

   const openEnumMenu = (e: React.MouseEvent) => {
      e.stopPropagation()
      openContextualMenu<string>(e, (close) => (<>
         {schema.enum.map((option: string) => (
            <Menu.Item
               key={option}
               name={option}
               icon={option === value ? "bi:check-lg" : "blank"}
               onClick={() => close(option)}
            />
         ))}
      </>), { position: "down-left" }).then((option) => {
         if (option !== undefined) {
            onChange(option)
         }
      })
   }

   const renderInput = () => {
      const type = schema.type

      if (type === "string" && schema.enum) {
         return (
            <button type="button" className="jtd-input jtd-select" onClick={openEnumMenu}>
               <span className="jtd-select-value">{value}</span>
               <Icon className="jtd-select-caret" name="bi:chevron-down" />
            </button>
         )
      }

      if (type === "string" && schema.format === "textarea") {
         return <textarea className="jtd-input" value={value} placeholder={schema.default} onChange={handleInputChange} />
      }

      const inputType = type === "number" || type === "integer"
         ? "number"
         : (type === "string" && schema.format ? schema.format : "text")

      return (
         <input
            className="jtd-input"
            type={inputType}
            value={value}
            placeholder={schema.default}
            onChange={handleInputChange}
         />
      )
   }

   // a lone checkbox carries no composite box
   if (schema.type === "boolean") {
      return (
         <div className={fieldClass}>
            {label ? <span className="jtd-field-label">{label}</span> : null}
            <input
               type="checkbox"
               className="jtd-checkbox"
               checked={value}
               onChange={(e) => onChange(e.target.checked)}
            />
         </div>
      )
   }

   return (
      <div className={fieldClass}>
         {label ? <span className="jtd-field-label">{label}</span> : null}
         <div className="jtd-field-control">
            {icon ? <Icon className="jtd-field-icon" name={icon} /> : null}
            {renderInput()}
            {tooling && tooling.length ? (
               <div className="jtd-field-tooling">{DrawToolingWidgets(tooling)}</div>
            ) : null}
         </div>
      </div>
   )
}
