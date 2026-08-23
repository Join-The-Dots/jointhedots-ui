
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
    <div className="jtd-field">
      <span className="jtd-field-label">{label}</span>
      <div className="jtd-field-control">
        <input
          type={type}
          className="jtd-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
          }}
        />
      </div>
    </div>
  )
}
