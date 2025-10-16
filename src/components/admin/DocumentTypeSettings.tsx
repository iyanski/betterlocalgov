import { useEffect, useState } from 'react';
import type { DocumentType, Category } from '../../services/types.ts';
import Textarea from '../ui/Textarea.tsx';
import SelectPicker from '../ui/SelectPicker.tsx';
import { useApiCategories } from '../../hooks/useApiData';
import { useAuth } from '../../hooks/useAuth';

export default function DocumentTypeSettings({
  documentType,
  onChange,
}: {
  documentType: DocumentType;
  onChange: (documentType: DocumentType) => void;
}) {
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token') || '';
  const { data: categories, loading: categoriesLoading } = useApiCategories({
    isAdmin: !!user,
    authToken: token,
  });

  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (categories) {
      const options = categories.map((category: Category) => ({
        label: category.name,
        value: category.id,
      }));
      setCategoryOptions(options);
    }
  }, [categories]);

  const handleDescriptionChange = (description: string) => {
    onChange({ ...documentType, description: description });
  };

  const handleCategoryChange = (
    selectedOption: { label: string; value: string } | null
  ) => {
    onChange({
      ...documentType,
      categoryId: selectedOption?.value || undefined,
    });
  };

  return (
    <form className="space-y-6">
      <SelectPicker
        label="Category"
        placeholder="Select a category..."
        options={categoryOptions}
        selectedValue={documentType.categoryId}
        onSelect={handleCategoryChange}
        disabled={categoriesLoading}
        searchable={true}
        clearable={true}
      />
      <Textarea
        label="Description"
        placeholder="A brief summary of document type"
        value={documentType.description || ''}
        onBlur={e => handleDescriptionChange(e.target.value)}
      />
    </form>
  );
}
