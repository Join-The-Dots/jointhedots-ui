import React from "react"
import Icon from "@jointhedots/icon"
import { JSONSchema } from "@jointhedots/core"

export type Tooling = {
   onClick: () => void
   icon: string // icon name, e.g., 'utility:settings'
}

type InputProps = {
   label?: React.ReactNode
   icon?: string
   tooling?: Tooling[]
   value: any
   schema: JSONSchema
   onChange: (value: any) => void
}

export const InputData: React.FC<InputProps> = ({ value, onChange, schema, icon, label, tooling }) => {
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const inputType = schema.type
      let newValue: any = e.target.value

      if (inputType === "number" || inputType === "integer") {
         newValue = Number(newValue)
      } else if (inputType === "boolean") {
         newValue = (e.target as any).checked
      }

      onChange(newValue)
   }

   const renderInput = () => {
      const type = schema.type

      if (type === "string" && schema.enum) {
         return (
            <select className="jtd-input" value={value} onChange={handleInputChange}>
               {schema.enum.map((option: string) => (
                  <option key={option} value={option}>
                     {option}
                  </option>
               ))}
            </select>
         )
      }

      if (type === "string" && schema.format === "textarea") {
         return <textarea className="jtd-input" value={value} onChange={handleInputChange} />
      }

      const inputType = type === "number" || type === "integer" ? "number" : "text"

      return (
         <input
            className="jtd-input"
            type={inputType}
            value={value}
            onChange={handleInputChange}
         />
      )
   }

   // a lone checkbox carries no composite box
   if (schema.type === "boolean") {
      return (
         <div className="jtd-field">
            {label ? <span className="jtd-field-label">{label}</span> : null}
            <input
               type="checkbox"
               className="jtd-checkbox"
               checked={value}
               onChange={handleInputChange}
            />
         </div>
      )
   }

   return (
      <div className="jtd-field">
         {label ? <span className="jtd-field-label">{label}</span> : null}
         <div className="jtd-field-control">
            {icon ? <Icon className="jtd-field-icon" name={icon} /> : null}
            {renderInput()}
            {tooling && tooling.length ? (
               <div className="jtd-field-tooling">
                  {tooling.map((tool, index) => (
                     <button
                        key={index}
                        type="button"
                        className="jtd-field-action"
                        aria-label={`action ${tool.icon}`}
                        onClick={tool.onClick}
                     >
                        <Icon name={tool.icon} />
                     </button>
                  ))}
               </div>
            ) : null}
         </div>
      </div>
   )
}
