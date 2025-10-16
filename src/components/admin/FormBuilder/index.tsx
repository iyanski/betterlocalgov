import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import SelectPicker from '../../ui/SelectPicker';
import Toggle from '../../ui/Toggle';
import Textarea from '../../ui/Textarea';
import Stack from '../../ui/Stack';

import {
  FormField,
  FormSchema,
  FIELD_TYPES,
  createEmptyField,
} from '../../../types/form-field';

interface FormBuilderProps {
  initialSchema?: FormSchema;
  onChange?: (schema: FormSchema) => void;
}

interface FieldItemProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onRemove: (fieldId: string) => void;
}

function FieldItem({ field, onUpdate, onRemove }: FieldItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(field.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleValidationUpdate = (validation: FormField['validation']) => {
    onUpdate({ ...field, validation });
  };

  const handleOptionsChange = (value: string) => {
    const options = value
      .split(',')
      .map(opt => opt.trim())
      .filter(Boolean);
    onUpdate({ ...field, options });
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTempName(field.name);
  };

  const handleNameSave = () => {
    if (tempName.trim() !== field.name) {
      handleFieldUpdate({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(field.name);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card
        className="border border-gray-200 dark:border-gray-700"
        allowOverflow
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1">
                {isEditingName ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyDown}
                    className="w-full px-2 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-transparent border border-primary-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    autoFocus
                    placeholder="Field name"
                  />
                ) : (
                  <h3
                    className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={handleNameEdit}
                    title="Click to edit field name"
                  >
                    {field.name || 'Untitled Field'}
                  </h3>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {field.type} • {field.required ? 'Required' : 'Optional'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                appearance="ghost"
                circle
                onClick={() => setIsExpanded(!isExpanded)}
                icon={
                  isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                }
              />
              <Button
                appearance="ghost"
                color="red"
                circle
                onClick={() => onRemove(field.id)}
                icon={<Trash2 className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <Stack
              marginBottom={5}
              direction="horizontal"
              gap="large"
              justify="between"
            >
              <div className="flex-1">
                <Input
                  label="Field Label"
                  placeholder="e.g., First Name"
                  value={field.label}
                  onChange={e => handleFieldUpdate({ label: e.target.value })}
                />
              </div>
            </Stack>

            <Stack
              marginBottom={5}
              direction="horizontal"
              gap="large"
              justify="between"
            >
              <div className="flex-1">
                <SelectPicker
                  label="Field Type"
                  options={[...FIELD_TYPES]}
                  selectedValue={field.type}
                  onSelect={option =>
                    option &&
                    handleFieldUpdate({
                      type: option.value as FormField['type'],
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Placeholder"
                  placeholder="Enter placeholder text..."
                  value={field.placeholder || ''}
                  onChange={e =>
                    handleFieldUpdate({ placeholder: e.target.value })
                  }
                />
              </div>
            </Stack>

            {field.type === 'select' && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options (comma-separated)
                </label>
                <Textarea
                  label=""
                  placeholder="Option 1, Option 2, Option 3"
                  value={field.options?.join(', ') || ''}
                  onBlur={e => handleOptionsChange(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {field.type !== 'checkbox' && (
              <Stack
                marginBottom={5}
                direction="horizontal"
                gap="large"
                justify="between"
              >
                <div className="w-full">
                  <Input
                    label="Default Value"
                    placeholder="Enter default value..."
                    value={field.defaultValue?.toString() || ''}
                    onChange={e =>
                      handleFieldUpdate({ defaultValue: e.target.value })
                    }
                  />
                </div>
              </Stack>
            )}

            <Stack
              marginBottom={5}
              direction="horizontal"
              gap="large"
              justify="between"
            >
              <Toggle
                label="Required"
                checked={field.required}
                onChange={checked => handleFieldUpdate({ required: checked })}
              />
              <Button
                appearance="ghost"
                onClick={() => setShowValidation(!showValidation)}
                icon={
                  showValidation ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )
                }
              >
                {showValidation ? 'Hide' : 'Show'} Validation
              </Button>
            </Stack>

            {showValidation && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Validation Rules
                </h4>
                <Stack marginBottom={5} direction="vertical" gap="large">
                  {(field.type === 'text' ||
                    field.type === 'textarea' ||
                    field.type === 'email') && (
                    <Stack
                      marginBottom={5}
                      direction="horizontal"
                      gap="large"
                      justify="between"
                    >
                      <div className="flex-1">
                        <Input
                          type="number"
                          label="Min Length"
                          placeholder="0"
                          value={field.validation?.minLength || ''}
                          onChange={e =>
                            handleValidationUpdate({
                              ...field.validation,
                              minLength: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          label="Max Length"
                          placeholder="100"
                          value={field.validation?.maxLength || ''}
                          onChange={e =>
                            handleValidationUpdate({
                              ...field.validation,
                              maxLength: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </Stack>
                  )}
                  {field.type === 'number' && (
                    <Stack
                      marginBottom={5}
                      direction="horizontal"
                      gap="large"
                      justify="between"
                    >
                      <div className="flex-1">
                        <Input
                          type="number"
                          label="Min Value"
                          placeholder="0"
                          value={field.validation?.min || ''}
                          onChange={e =>
                            handleValidationUpdate({
                              ...field.validation,
                              min: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          label="Max Value"
                          placeholder="100"
                          value={field.validation?.max || ''}
                          onChange={e =>
                            handleValidationUpdate({
                              ...field.validation,
                              max: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </Stack>
                  )}
                  <div className="w-full">
                    <Input
                      label="Pattern (Regex)"
                      placeholder="^[a-zA-Z]+$"
                      value={field.validation?.pattern || ''}
                      onChange={e =>
                        handleValidationUpdate({
                          ...field.validation,
                          pattern: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      label="Custom Error Message"
                      placeholder="Custom validation error message..."
                      value={field.validation?.customErrorMessage || ''}
                      onChange={e =>
                        handleValidationUpdate({
                          ...field.validation,
                          customErrorMessage: e.target.value,
                        })
                      }
                    />
                  </div>
                </Stack>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function FormBuilder({
  initialSchema,
  onChange,
}: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || { fields: [] }
  );
  const [showPreview, setShowPreview] = useState(false);

  // Update schema when initialSchema prop changes
  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
    }
  }, [initialSchema]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = schema.fields.findIndex(field => field.id === active.id);
      const newIndex = schema.fields.findIndex(field => field.id === over.id);

      const newFields = arrayMove(schema.fields, oldIndex, newIndex);
      const newSchema = { ...schema, fields: newFields };
      setSchema(newSchema);
      onChange?.(newSchema);
    }
  };

  const handleAddField = () => {
    const newField = createEmptyField();
    const newSchema = { ...schema, fields: [...schema.fields, newField] };
    setSchema(newSchema);
    onChange?.(newSchema);
  };

  const handleUpdateField = (updatedField: FormField) => {
    const newFields = schema.fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    );
    const newSchema = { ...schema, fields: newFields };
    setSchema(newSchema);
    onChange?.(newSchema);
  };

  const handleRemoveField = (fieldId: string) => {
    const newFields = schema.fields.filter(field => field.id !== fieldId);
    const newSchema = { ...schema, fields: newFields };
    setSchema(newSchema);
    onChange?.(newSchema);
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Form Builder
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and configure form fields for your document type
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            appearance="ghost"
            onClick={() => setShowPreview(!showPreview)}
            icon={
              showPreview ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )
            }
          >
            {showPreview ? 'Hide' : 'Show'} JSON
          </Button>
          <Button
            appearance="primary"
            onClick={handleAddField}
            icon={<Plus className="h-4 w-4 mr-2" />}
          >
            Add Field
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={schema.fields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          {schema.fields.length === 0 ? (
            <Card
              className="border-2 border-dashed border-gray-300 dark:border-gray-600"
              allowOverflow
            >
              <CardContent className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium mb-2">No fields yet</p>
                  <p className="text-sm mb-4">
                    Start building your form by adding fields
                  </p>
                  <Button
                    appearance="primary"
                    onClick={handleAddField}
                    icon={<Plus className="h-4 w-4 mr-2" />}
                  >
                    Add Your First Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            schema.fields.map(field => (
              <FieldItem
                key={field.id}
                field={field}
                onUpdate={handleUpdateField}
                onRemove={handleRemoveField}
              />
            ))
          )}
        </SortableContext>
      </DndContext>

      {showPreview && (
        <Card allowOverflow>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                JSON Schema Preview
              </h3>
              <Button
                appearance="ghost"
                onClick={handleCopySchema}
                icon={<Copy className="h-4 w-4 mr-2" />}
              >
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
              <code className="text-gray-800 dark:text-gray-200">
                {JSON.stringify(schema, null, 2)}
              </code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
