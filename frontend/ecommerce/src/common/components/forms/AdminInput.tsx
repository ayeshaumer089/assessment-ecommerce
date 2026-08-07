import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

/** Appends the shared invalid-state modifier when the field has an error. */
function controlClass(base: string, invalid?: boolean) {
  return `${base}${invalid ? ' adm-input--err' : ''}`
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const AdminInput = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, ...props }, ref) => (
    <input ref={ref} className={controlClass('adm-input', invalid)} {...props} />
  ),
)
AdminInput.displayName = 'AdminInput'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, ...props }, ref) => (
    <textarea ref={ref} className={controlClass('adm-textarea', invalid)} {...props} />
  ),
)
AdminTextarea.displayName = 'AdminTextarea'
