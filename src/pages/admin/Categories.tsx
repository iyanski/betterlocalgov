import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { LoadingState, ErrorState } from '../../components/ui/LoadingSpinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import Stack from '../../components/ui/Stack';
import Button from '../../components/ui/Button';
import { CategoryEditModal, CategoryDeleteModal } from '../../components/admin';
import { useApiCategories, useCategoryCrud } from '../../hooks/useApiData';
import { useAuth } from '../../hooks/useAuth';
import { ApiResponse, Category } from '../../services/api';
import { CategoryFormData } from '../../types';

export default function Categories() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('auth_token');
  const {
    data: categories,
    loading,
    error,
    refetch,
  } = useApiCategories({
    isAdmin: true,
    authToken: token || undefined,
  });
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    loading: crudLoading,
  } = useCategoryCrud(token || undefined);
  const [searchTerm] = useState('');
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null,
  });

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    const apiResponse: ApiResponse<Category[]> =
      categories as unknown as ApiResponse<Category[]>;
    const localCategories = apiResponse?.data || [];
    if (!apiResponse || !Array.isArray(localCategories)) return [];
    if (!searchTerm.trim()) return localCategories;

    const term = searchTerm.toLowerCase();
    return localCategories.filter(
      category =>
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term) ||
        (category.description &&
          category.description.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  const handleCreate = () => {
    if (!isAuthenticated) {
      alert(
        'Authentication required to create categories. Please log in to the admin panel.'
      );
      return;
    }
    setEditModal({ isOpen: true, category: null });
  };

  const handleEdit = (category: Category) => {
    if (!isAuthenticated) {
      alert(
        'Authentication required to edit categories. Please log in to the admin panel.'
      );
      return;
    }
    setEditModal({ isOpen: true, category });
  };

  const handleDelete = (category: Category) => {
    if (!isAuthenticated) {
      alert(
        'Authentication required to delete categories. Please log in to the admin panel.'
      );
      return;
    }
    setDeleteModal({ isOpen: true, category });
  };

  const handleSave = async (formData: CategoryFormData) => {
    if (editModal.category) {
      await updateCategory(editModal.category.id, formData);
    } else {
      await createCategory(formData);
    }
    refetch();
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      await deleteCategory(deleteModal.category.id);
      refetch();
      setDeleteModal({ isOpen: false, category: null });
    } catch {
      // Error is handled by the hook
    }
  };

  if (loading) {
    return <LoadingState message="Loading categories..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <Stack direction="horizontal" justify="between" align="center">
            <CardTitle>Categories</CardTitle>
            <Button
              onClick={handleCreate}
              disabled={!isAuthenticated || crudLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </Stack>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Content Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {searchTerm
                        ? 'No categories found matching your search.'
                        : 'No categories found.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(category => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: category.color || '#3B82F6',
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate w-[50ch]">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category._count?.content || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={!isAuthenticated}
                            className={`p-1 ${
                              isAuthenticated
                                ? 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                            title={
                              isAuthenticated
                                ? 'Edit category'
                                : 'Authentication required'
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={!isAuthenticated}
                            className={`p-1 ${
                              isAuthenticated
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 cursor-pointer'
                                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                            title={
                              isAuthenticated
                                ? 'Delete category'
                                : 'Authentication required'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CategoryEditModal
        category={editModal.category}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, category: null })}
        onSave={handleSave}
        loading={crudLoading}
      />

      <CategoryDeleteModal
        category={deleteModal.category}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleConfirmDelete}
        loading={crudLoading}
      />
    </div>
  );
}
