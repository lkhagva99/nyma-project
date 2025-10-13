'use client'

import { forwardRef } from 'react'

interface SelectInputProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  options: { label: string; value: string | number }[]
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, icon, options, className = '', value, defaultValue, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={`
              text-black w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 bg-white
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            value={value}
            defaultValue={value === undefined && defaultValue === undefined ? '' : defaultValue}
            {...props}
          >
            {/* initial empty option so the default value is empty when none provided */}
            <option value={undefined}>Select OLT</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

SelectInput.displayName = 'SelectInput'

export default SelectInput
