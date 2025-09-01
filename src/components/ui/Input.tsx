'use client'
import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  loading?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helper,
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    loading = false,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputType = showPasswordToggle 
      ? (showPassword ? 'text' : 'password')
      : type

    const hasError = !!error
    const hasSuccess = success && !hasError

    return (
      <div className="w-full">
        {label && (
          <label className={cn(
            "block text-sm font-medium mb-2 transition-colors duration-200",
            hasError ? "text-red-600" : "text-gray-700",
            isFocused && !hasError && "text-blue-600"
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "block w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all duration-200",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || hasError || hasSuccess || loading) && "pr-10",
              
              // Default state
              "border-gray-200 hover:border-gray-300",
              "focus:border-blue-500 focus:ring-blue-500/20",
              
              // Error state
              hasError && "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20",
              
              // Success state
              hasSuccess && "border-green-300 bg-green-50/30 focus:border-green-500 focus:ring-green-500/20",
              
              // Disabled state
              props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200",
              
              className
            )}
            {...props}
          />
          
          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            )}
            
            {hasError && !loading && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            
            {hasSuccess && !loading && !hasError && (
              <Check className="w-4 h-4 text-green-500" />
            )}
            
            {showPasswordToggle && !loading && !hasError && !hasSuccess && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
            
            {rightIcon && !showPasswordToggle && !hasError && !hasSuccess && !loading && rightIcon}
          </div>
        </div>
        
        {/* Helper/Error text */}
        {(error || helper) && (
          <div className={cn(
            "mt-2 text-sm transition-all duration-200",
            hasError ? "text-red-600" : "text-gray-500"
          )}>
            {error || helper}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

// Search Input variant
export function SearchInput({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  ...props 
}: InputProps & { onSearch?: (value: string) => void }) {
  const [value, setValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4" />}
        className={cn("pr-20", className)}
        {...props}
      />
      <button
        type="submit"
        className={cn(
          "absolute right-2 top-1/2 transform -translate-y-1/2",
          "px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg",
          "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          "transition-all duration-200"
        )}
      >
        Search
      </button>
    </form>
  )
}