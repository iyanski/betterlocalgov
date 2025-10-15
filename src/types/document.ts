import { Content } from '../services/api';

export interface DocumentDeleteModalProps {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export interface ContentCategory {
  category: {
    name: string;
  };
}
