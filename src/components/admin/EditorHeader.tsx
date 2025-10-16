import { ArrowLeft, PanelRightOpen } from 'lucide-react';

interface EditorHeaderProps {
  onBack: () => void;
  backLabel: string;
  currentPage: string;
  status?: string;
  onPreview?: () => void;
  onPublish?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  isPublishing?: boolean;
  isSaving?: boolean;
}

export default function EditorHeader({
  onBack,
  backLabel,
  currentPage,
  status = 'Draft - Saved',
  onPreview,
  onPublish,
  onSave,
  onSettings,
  isPublishing = false,
  isSaving = false,
}: EditorHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{backLabel}</span>
          </button>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentPage}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {status}
          </span>
          {onPreview && (
            <button
              onClick={onPreview}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Preview
            </button>
          )}
          {onPublish && (
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
