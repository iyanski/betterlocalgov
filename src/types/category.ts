import { Category } from '../services/api';

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface EditModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  loading: boolean;
}

export interface DeleteConfirmModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}
