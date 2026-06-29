import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: ReactNode
  rightAddon?: ReactNode
  optional?: boolean
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, leftAddon, rightAddon, optional, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            {optional && <span className="text-xs text-gray-400">Optional</span>}
          </div>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900',
              'placeholder:text-gray-400 bg-white shadow-sm',
              'outline-none transition-all duration-150',
              'focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              leftAddon ? 'pl-9' : '',
              rightAddon ? 'pr-9' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center text-gray-400">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
