import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { CategoryFormData, EditModalProps } from '../../types';

export function CategoryEditModal({
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

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
      slug: generateSlug(name),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create Category'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
          type="text"
          value={formData.name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Category name"
          required
          error={errors.name}
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Category description"
          />
        </div>

        <Input
          id="slug"
          label="Slug"
          type="text"
          value={formData.slug}
          onChange={e =>
            setFormData(prev => ({ ...prev, slug: e.target.value }))
          }
          placeholder="category-slug"
          required
          error={errors.slug}
        />

        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              aria-label="Color picker"
            />
            <input
              type="text"
              value={formData.color}
              onChange={e =>
                setFormData(prev => ({ ...prev, color: e.target.value }))
              }
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#3B82F6"
              aria-label="Color value"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
