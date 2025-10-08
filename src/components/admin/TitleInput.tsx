interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TitleInput({
  value,
  onChange,
  placeholder = 'Post title',
  className = '',
}: TitleInputProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-4xl font-light text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none resize-none bg-transparent"
        style={{
          lineHeight: '1.2',
          fontFamily: 'sans-serif',
        }}
      />
    </div>
  );
}
