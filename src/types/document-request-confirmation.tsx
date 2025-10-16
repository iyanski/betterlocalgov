import { DocumentRequest } from '../services/api';

export interface DocumentRequestConfirmationModalProps {
  documentRequest: DocumentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  okLabel: string;
}
