import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import BlockMenu, { BlockType } from './BlockMenu';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlockSelect?: (blockType: BlockType) => void;
  className?: string;
}

export default function ContentEditor({
  value,
  onChange,
  placeholder = 'Begin writing your post...',
  onBlockSelect,
  className = '',
}: ContentEditorProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  // Close block menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blockMenuRef.current &&
        !blockMenuRef.current.contains(event.target as Node)
      ) {
        setShowBlockMenu(false);
      }
    };

    if (showBlockMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBlockMenu]);

  const handleBlockSelect = (blockType: BlockType) => {
    if (onBlockSelect) {
      onBlockSelect(blockType);
    }
    setShowBlockMenu(false);
  };

  return (
    <div className={`relative ${className}`} ref={blockMenuRef}>
      <div className="flex items-start space-x-4">
        <button
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
        >
          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex-1">
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[200px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none resize-none text-lg leading-relaxed bg-transparent font-light"
            style={{
              lineHeight: '1.6',
              fontFamily: 'sans-serif',
            }}
          />
        </div>
      </div>

      <BlockMenu
        isOpen={showBlockMenu}
        onClose={() => setShowBlockMenu(false)}
        onSelectBlock={handleBlockSelect}
      />
    </div>
  );
}
