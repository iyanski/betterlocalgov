import type { DocumentType } from '../../services/types.ts';
import Textarea from '../ui/Textarea.tsx';

export default function DocumentTypeSettings({
  documentType,
  onChange,
}: {
  documentType: DocumentType;
  onChange: (documentType: DocumentType) => void;
}) {
  const handleDescriptionChange = (description: string) => {
    onChange({ ...documentType, description: description });
  };

  return (
    <form className="space-y-6">
      <Textarea
        label="Description"
        placeholder="A brief summary of the post"
        value={documentType.description || ''}
        onBlur={e => handleDescriptionChange(e.target.value)}
      />
    </form>
  );
}
