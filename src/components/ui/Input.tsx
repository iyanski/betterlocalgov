import { cn } from '../../lib/utils';

interface InputProps {
  label?: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'password' | 'tel' | 'url';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
  required = false,
  min,
  max,
  minLength,
  maxLength,
  pattern,
}: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          'placeholder-gray-500 dark:placeholder-gray-400',
          'transition-colors duration-200',
          disabled &&
            'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
        )}
      />
    </div>
  );
}
