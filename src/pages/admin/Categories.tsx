import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { LoadingState, ErrorState } from '../../components/ui/LoadingSpinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import Stack from '../../components/ui/Stack';
import Button from '../../components/ui/Button';
import { useApiCategories, useCategoryCrud } from '../../hooks/useApiData';
import { useAuth } from '../../hooks/useAuth';
import { Category } from '../../services/api';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface EditModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  loading: boolean;
}

function EditModal({
  category,
  isOpen,
  onClose,
  onSave,
  loading,
}: EditModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    color: category?.color || '#3B82F6',
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  // Update form data when category changes
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        color: category.color || '#3B82F6',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
      });
    }
    setErrors({});
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSave(formData);
        onClose();
      } catch {
        // Error handling is done in parent component
      }
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <Heading level={2} className="text-lg font-semibold">
              {category ? 'Edit Category' : 'Create Category'}
            </Heading>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Category name"
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={e =>
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="category-slug"
              />
              {errors.slug && (
                <Text className="text-red-500 text-sm mt-1">{errors.slug}</Text>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category description"
              />
            </div>

            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

function DeleteConfirmModal({
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
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <Heading level={2} className="text-lg font-semibold text-red-600">
              Delete Category
            </Heading>
          </div>

          <div className="px-6 py-4">
            <Text className="text-gray-700 mb-4">
              Are you sure you want to delete the category{' '}
              <strong>"{category.name}"</strong>? This action cannot be undone.
            </Text>

            {category._count?.content && category._count.content > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <Text className="text-yellow-800 text-sm">
                  ⚠️ This category has {category._count.content} content
                  item(s). Deleting it may affect your content organization.
                </Text>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

export default function Categories() {
  const { data: categories, loading, error, refetch } = useApiCategories();
  const { isAuthenticated, token } = useAuth();
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    loading: crudLoading,
  } = useCategoryCrud(token || undefined);
  // Debug logging

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
  console.log('categories', categories);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    console.log('Filtered categories:', categories);
    // Ensure categories is an array
    if (!categories || !Array.isArray(categories)) return [];
    if (!searchTerm.trim()) return categories;

    console.log('Categories:', categories);
    const term = searchTerm.toLowerCase();
    return categories.filter(
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? 'No categories found matching your search.'
                        : 'No categories found.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(category => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor: category.color || '#3B82F6',
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category._count?.content || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
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
                                ? 'text-blue-600 hover:text-blue-900'
                                : 'text-gray-400 cursor-not-allowed'
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
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-gray-400 cursor-not-allowed'
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
      <EditModal
        category={editModal.category}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, category: null })}
        onSave={handleSave}
        loading={crudLoading}
      />

      <DeleteConfirmModal
        category={deleteModal.category}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleConfirmDelete}
        loading={crudLoading}
      />
    </div>
  );
}
