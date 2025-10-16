import React from 'react'

interface Props {
	value: string
	onChange: (e: any) => void
	placeholder: string
	className?: string
}

const FormInput = ({value, onChange, placeholder, className}: Props) => {
  return (
    <input
      className={`form-input ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

export default FormInput
