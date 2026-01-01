import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-white/70 mb-2 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full px-4 py-3 
            ${icon ? 'pl-12' : ''}
            bg-dark-700 border border-dark-500
            rounded-xl text-white
            placeholder:text-white/40
            focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20
            transition-all duration-200
            min-h-[48px]
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function TextArea({
  label,
  error,
  maxLength,
  showCount = false,
  className = '',
  value,
  ...props
}: TextAreaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-white/70 mb-2 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`
            w-full px-4 py-3
            bg-dark-700 border border-dark-500
            rounded-xl text-white
            placeholder:text-white/40
            focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20
            transition-all duration-200
            resize-none
            ${error ? 'border-error' : ''}
            ${className}
          `}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCount && maxLength && (
          <span className={`absolute bottom-3 right-3 text-xs ${
            charCount >= maxLength ? 'text-error' : 'text-white/40'
          }`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

