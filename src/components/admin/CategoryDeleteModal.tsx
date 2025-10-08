import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { DeleteConfirmModalProps } from '../../types';

export function CategoryDeleteModal({
  category,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Heading
              level={2}
              className="text-lg font-semibold text-red-600 dark:text-red-400"
            >
              Delete Category
            </Heading>
          </div>

          <div className="px-6 py-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete the category{' '}
              <strong>"{category.name}"</strong>? This action cannot be undone.
            </Text>

            {category._count?.content && category._count.content > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
                <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ This category has {category._count.content} content
                  item(s). Deleting it may affect your content organization.
                </Text>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
