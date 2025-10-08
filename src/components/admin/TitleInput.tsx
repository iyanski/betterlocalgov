import { useEffect, useRef } from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const INPUT_STYLES =
  'w-full text-6xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none resize-none bg-transparent';

export default function TitleInput({
  value,
  onChange,
  placeholder = 'Post title',
  className = '',
}: TitleInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = scrollHeight * (value.split('\n').length || 1); // Dynamic height based on number of lines
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    adjustHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`mb-8 ${className}`}>
      <textarea
        autoFocus
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_STYLES}
        style={{
          lineHeight: '1.2',
          fontFamily: 'sans-serif',
          minHeight: 'auto',
          height: 'auto',
          overflow: 'hidden',
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        rows={1}
      />
    </div>
  );
}
