import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  /** Rendered below the error slot — e.g. a password strength meter. */
  children?: ReactNode
}

/** Password input with a show/hide toggle. */
const PasswordField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, children, ...inputProps }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="sz-auth-field">
        <label>{label}</label>
        <div className="sz-auth-pwd-wrap">
          <input ref={ref} type={visible ? 'text' : 'password'} {...inputProps} />
          <button type="button" className="eye" onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error && <span className="err">{error}</span>}
        {children}
      </div>
    )
  },
)

PasswordField.displayName = 'PasswordField'
export default PasswordField
