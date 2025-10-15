import { DocumentType } from '../services/api';

export interface DocumentTypeDeleteModalProps {
  documentType: DocumentType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}
