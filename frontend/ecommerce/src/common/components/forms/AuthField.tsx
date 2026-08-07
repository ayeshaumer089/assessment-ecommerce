import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/** Labelled text input for the storefront auth screens. */
const AuthField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, ...inputProps }, ref) => (
    <div className="sz-auth-field">
      <label>{label}</label>
      <input ref={ref} {...inputProps} />
      {hint && <span className="hint">{hint}</span>}
      {error && <span className="err">{error}</span>}
    </div>
  ),
)

AuthField.displayName = 'AuthField'
export default AuthField
