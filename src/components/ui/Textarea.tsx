export default function Textarea({
  label,
  className,
  placeholder,
  rows = 4,
  value,
  onBlur,
}: {
  label: string;
  className?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-3">
        <textarea
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={placeholder}
          onBlur={onBlur}
        >
          {value}
        </textarea>
      </div>
    </div>
  );
}
