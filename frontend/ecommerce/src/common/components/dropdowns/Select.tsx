import { forwardRef, type SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  /** Rendered as a leading empty-valued option when provided. */
  placeholder?: string
}

/** Native select that renders its options from data. */
const Select = forwardRef<HTMLSelectElement, Props>(
  ({ options, placeholder, ...props }, ref) => (
    <select ref={ref} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
)

Select.displayName = 'Select'
export default Select
