import { HelpCircle } from 'lucide-react';

interface WordCountProps {
  count: number;
  className?: string;
}

export default function WordCount({ count, className = '' }: WordCountProps) {
  return (
    <div
      className={`flex justify-end mt-8 transition-all duration-500 ease-out ${className}`}
    >
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <span className="text-sm">{count} words</span>
        <HelpCircle className="h-3 w-3" />
      </div>
    </div>
  );
}
