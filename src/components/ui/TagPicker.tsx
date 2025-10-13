import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag as TagIcon, ChevronDown } from 'lucide-react';
import type { Tag } from '../../services/types';

interface TagPickerProps {
  label?: string;
  selectedTags?: Tag[];
  availableTags?: Tag[];
  onChange?: (tags: Tag[]) => void;
  onCreateTag?: (tagName: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function TagPicker({
  label = 'Tags',
  selectedTags = [],
  availableTags = [],
  onChange,
  onCreateTag,
  placeholder = 'Search or create tags...',
  className = '',
  disabled = false,
  isLoading = false,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = availableTags.filter(
    tag =>
      !selectedTags.some(selected => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDuplicate = (tagName: string) => {
    const normalizedName = tagName.toLowerCase().trim();
    return (
      availableTags.some(tag => tag.name.toLowerCase() === normalizedName) ||
      selectedTags.some(tag => tag.name.toLowerCase() === normalizedName)
    );
  };

  const canCreateNew =
    searchQuery.trim() && onCreateTag && !isDuplicate(searchQuery);

  const showCreateNew = !searchQuery.trim() && onCreateTag;

  const handleTagSelect = (tag: Tag) => {
    // Check if tag is already selected
    if (selectedTags.some(selected => selected.id === tag.id)) {
      return;
    }

    const newSelectedTags = [...selectedTags, tag];
    onChange?.(newSelectedTags);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleTagRemove = (tagToRemove: Tag) => {
    const newSelectedTags = selectedTags.filter(
      tag => tag.id !== tagToRemove.id
    );
    onChange?.(newSelectedTags);
  };

  const handleCreateTag = () => {
    if (!onCreateTag || !canCreateNew) return;

    const tagName = searchQuery.trim();

    // Double-check for duplicates before creating
    if (isDuplicate(tagName)) {
      return;
    }

    setIsCreating(true);
    try {
      // Create a temporary tag object for immediate selection
      const tempTag: Tag = {
        id: `temp-${Date.now()}`,
        name: tagName,
        slug: tagName.toLowerCase().replace(/\s+/g, '-'),
        organizationId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to selected tags immediately
      const newSelectedTags = [...selectedTags, tempTag];
      onChange?.(newSelectedTags);

      // Notify parent to create the tag
      onCreateTag(tagName);

      setSearchQuery('');
      setIsOpen(false);
    } catch (err) {
      console.error('Error creating tag:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canCreateNew) {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Tags Container */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-1 items-center">
              {selectedTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-black dark:text-white"
                  style={
                    tag.color
                      ? { backgroundColor: tag.color + '20', color: tag.color }
                      : {}
                  }
                >
                  {tag.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleTagRemove(tag);
                      }}
                      className="ml-1 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          )}

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Hidden Input for Search */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder=""
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading tags...
              </div>
            ) : (
              <>
                {/* Available Tags */}
                {filteredTags.length > 0 && (
                  <div className="max-h-48 overflow-y-auto">
                    {filteredTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagSelect(tag)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">
                            {tag.name}
                          </span>
                          {tag.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {tag.description}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create New Tag Option - when text is empty */}
                {showCreateNew && (
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        inputRef.current?.focus();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Type to create tag
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Create New Tag Option - when typing */}
                {canCreateNew && (
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={isCreating}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {isCreating
                            ? 'Creating...'
                            : `Create "${searchQuery}"`}
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* No Results */}
                {!isLoading &&
                  filteredTags.length === 0 &&
                  !canCreateNew &&
                  !showCreateNew &&
                  searchQuery && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No tags found
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
