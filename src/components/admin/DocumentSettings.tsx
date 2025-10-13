import { useState } from 'react';
import DateTimePicker from '../ui/DateTimePicker';
import TagPicker from '../ui/TagPicker';
import { generateSlug } from '../../lib/slug';
import type { Content, Category, Tag } from '../../services/types';
import Textarea from '../ui/Textarea';
import SelectPicker from '../ui/SelectPicker.tsx';

export default function DocumentSettings({
  document,
  availableCategories,
  availableTags,
  onChange,
}: {
  document: Content;
  availableCategories: Category[];
  availableTags: Tag[];
  onChange: (document: Content) => void;
}) {
  const [publishDate, setPublishDate] = useState<Date | null>(
    document.publishedAt ? new Date(document.publishedAt) : null
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const authToken = localStorage.getItem('auth_token');

  const handleCreateTag = (tagName: string): void => {
    if (!authToken) {
      throw new Error('No auth token available');
    }

    const normalizedName = tagName.toLowerCase().trim();

    // Check if tag already exists in available tags
    const tagExists = availableTags.some(
      tag => tag.name.toLowerCase() === normalizedName
    );

    if (!tagExists) {
      const newTag: Tag = {
        id: generateSlug(tagName),
        name: tagName,
        slug: generateSlug(tagName),
        organizationId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onChange({ ...document, tags: [...document.tags, newTag] });
    }
  };

  const handleTagsChange = (newTags: Tag[]) => {
    const uniqueTags = newTags.filter(
      (tag, index, self) =>
        index ===
        self.findIndex(
          t =>
            t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase()
        )
    );
    setSelectedTags(uniqueTags);
    onChange({ ...document, tags: uniqueTags });
  };

  const handleExcerptChange = (excerpt: string) => {
    onChange({ ...document, excerpt });
  };

  const handlePublishDateChange = (publishDate: Date | null) => {
    setPublishDate(publishDate);
    onChange({ ...document, publishedAt: publishDate?.toISOString() });
  };

  const handleCategoriesChange = (categories: Category[]) => {
    onChange({ ...document, categories });
  };

  return (
    <form className="space-y-6">
      <DateTimePicker
        label="Publish date"
        value={publishDate || undefined}
        onChange={handlePublishDateChange}
        placeholder="Select publish date and time"
      />
      <TagPicker
        label="Tags"
        selectedTags={selectedTags}
        availableTags={availableTags || []}
        onChange={handleTagsChange}
        onCreateTag={handleCreateTag}
        placeholder="Search or create tags..."
      />
      <Textarea
        label="Excerpt"
        placeholder="A brief summary of the post"
        value={document.excerpt || ''}
        onBlur={e => handleExcerptChange(e.target.value)}
      />
      <SelectPicker
        label="Category"
        options={availableCategories.map((category: Category) => ({
          label: category.name,
          value: category.id,
        }))}
        onSelect={option => {
          if (option?.value) {
            const selectedCategory =
              availableCategories.find(cat => cat.id === option.value) ??
              undefined;
            handleCategoriesChange(selectedCategory ? [selectedCategory] : []);
          } else {
            handleCategoriesChange([]);
          }
        }}
        placeholder="Select category"
      />
    </form>
  );
}
