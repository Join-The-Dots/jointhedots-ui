
import React, { HTMLInputTypeAttribute } from 'react'

export function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
}: {
  label: string
  onChange: (val: string) => void
  placeholder?: string
  value: string
  type?: HTMLInputTypeAttribute
}): React.JSX.Element {
  return (
    <div className="jtd-input_wrapper">
      <label className="jtd-input_label">{label}</label>
      <input
        type={type}
        className="jtd-input_input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
    </div>
  )
}
