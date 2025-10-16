export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number; // For number type
  max?: number; // For number type
  pattern?: string; // Regex pattern
  customErrorMessage?: string;
}

export interface FormField {
  id: string;
  name: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'date'
    | 'checkbox'
    | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[]; // For select type
  validation?: FormFieldValidation;
}

export interface FormSchema {
  fields: FormField[];
}

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
] as const;

export const createEmptyField = (): FormField => ({
  id: crypto.randomUUID(),
  name: 'field',
  type: 'text',
  label: 'New Field',
  placeholder: '',
  required: false,
  defaultValue: '',
  options: [],
  validation: {},
});
