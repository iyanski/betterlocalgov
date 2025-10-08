import {
  Image,
  Minus,
  Square,
  Bookmark,
  Camera,
  Eye,
  MousePointer,
  Mail,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface BlockType {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const defaultBlockTypes: BlockType[] = [
  { id: 'image', icon: Image, label: 'Image' },
  { id: 'divider', icon: Minus, label: 'Divider' },
  { id: 'button', icon: Square, label: 'Button' },
  { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
  { id: 'gallery', icon: Camera, label: 'Gallery' },
  { id: 'preview', icon: Eye, label: 'Public preview' },
  { id: 'cta', icon: MousePointer, label: 'Call to action' },
  { id: 'email', icon: Mail, label: 'Email content' },
  { id: 'callout', icon: AlertCircle, label: 'Callout' },
];

interface BlockMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockType: BlockType) => void;
  blockTypes?: BlockType[];
  className?: string;
}

export default function BlockMenu({
  isOpen,
  onClose,
  onSelectBlock,
  blockTypes = defaultBlockTypes,
  className = '',
}: BlockMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute left-0 top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 min-w-[200px] ${className}`}
    >
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Primary
        </span>
        <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
      </div>
      {blockTypes.map(block => (
        <button
          key={block.id}
          onClick={() => {
            onSelectBlock(block);
            onClose();
          }}
          className="w-full flex items-center space-x-3 px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <block.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {block.label}
          </span>
        </button>
      ))}
    </div>
  );
}
