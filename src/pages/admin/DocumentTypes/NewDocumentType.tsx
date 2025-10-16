import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  EditorHeader,
  TitleInput,
  FormBuilder,
} from '../../../components/admin';
import { useAuth } from '../../../hooks/useAuth';
import { DocumentType } from '../../../services/admin.api';
import { generateSlugFromTitle } from '../../../lib/slug';

import '../../../styles/editor.css';
import SlidePanel from '../../../components/ui/SlidePanel.tsx';
import DocumentTypeSettings from '../../../components/admin/DocumentTypeSettings.tsx';
import Button from '../../../components/ui/Button.tsx';
import { Trash } from 'lucide-react';
import { useDocumentTypeCrud } from '../../../hooks/useApiData';
import {
  ApiResponse,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
} from '../../../services/types';

export default function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token') || '';
  const location = useLocation();
  const hash = location.hash.substring(1);
  const documentId = hash.split('/')[2];
  const [title, setTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>({
    id: '',
    title: '',
    slug: '',
    fields: [],
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const {
    createDocumentType,
    updateDocumentType,
    getDocumentType,
    deleteDocumentType,
    loading: crudLoading,
  } = useDocumentTypeCrud(token || undefined);

  const loadDocumentType = async () => {
    const documentType = (await getDocumentType(
      documentId
    )) as unknown as ApiResponse<DocumentType>;
    setDocumentType(documentType.data);
    setTitle(documentType.data.title);
  };

  useEffect(() => {
    if (documentId) {
      loadDocumentType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handlePreview = () => {
    // Handle preview logic here
    console.log('Preview clicked');
  };

  const handleSave = async (documentType: DocumentType) => {
    setError('');
    // Handle draft logic here

    if (!title.trim()?.length) {
      setError('Please enter a title for your document type');
      return;
    }

    const slug = generateSlugFromTitle(title);

    setStatus('Draft - Saving...');
    setDocumentType(documentType);
    try {
      if (!documentId) {
        const createDocumentTypeDto: CreateDocumentTypeDto = {
          title: title.trim(),
          slug,
          fields: documentType.fields,
          description: documentType.description,
          categoryId: documentType.categoryId,
        };

        const createdDocumentType = (await createDocumentType(
          createDocumentTypeDto
        )) as unknown as ApiResponse<DocumentType>;

        if (createdDocumentType?.data?.id) {
          window.location.hash = `#editor/document-type/${createdDocumentType.data.id}`;
        }
      } else {
        const updateContentDto: UpdateDocumentTypeDto = {
          title: documentType.title,
          slug,
          fields: documentType.fields,
          description: documentType.description,
          categoryId: documentType.categoryId,
        };
        await updateDocumentType(documentId, updateContentDto);
      }
    } catch (err: unknown) {
      console.error('Error creating document:', err);
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        err.status === 409
      ) {
        setError(
          'A document type with this title already exists. Please choose a different title.'
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to create document type'
        );
      }
    } finally {
      setStatus('Draft - Saved');
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your document');
      return;
    }

    if (!token || !user) {
      setError('You must be logged in to create documents');
      return;
    }

    setIsPublishing(true);
    setError('');

    await handleSave(documentType);
    setIsPublishing(false);
  };

  const handleOpenSettings = () => {
    // Handle settings logic here
    setSlidePanelOpen(true);
  };

  const handleDelete = async () => {
    if (!documentId) {
      setError('Cannot delete a document type that has not been saved yet');
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to delete this document type? This action cannot be undone.'
      )
    ) {
      try {
        await deleteDocumentType(documentId);
        setSlidePanelOpen(false);
        navigate('/admin/document-types');
      } catch (err) {
        console.error('Error deleting document type:', err);
        setError('Failed to delete document type');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <div
        className={`transition-all duration-500 ease-out ${
          slidePanelOpen ? 'mr-96' : 'mr-0'
        }`}
      >
        <EditorHeader
          onBack={() => navigate('/admin/document-types')}
          backLabel="Document Types"
          currentPage="New"
          onPreview={handlePreview}
          onPublish={handlePublish}
          onSettings={handleOpenSettings}
          isPublishing={isPublishing}
          status={crudLoading ? 'Saving...' : status}
          isSaving={crudLoading}
        />
      </div>

      {/* Main Content Editor */}
      <div
        className={`px-14 py-8 transition-all duration-500 ease-out ${
          slidePanelOpen ? 'max-w-4xl mr-96' : 'max-w-4xl mx-auto'
        }`}
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <TitleInput
          placeholder="Untitled Form"
          value={title}
          onChange={setTitle}
          onBlur={value => handleSave({ ...documentType, title: value })}
        />
        <FormBuilder
          initialSchema={{ fields: documentType.fields || [] }}
          onChange={schema => {
            // Store the form schema in the document type
            setDocumentType({ ...documentType, fields: schema.fields });
          }}
        />
      </div>
      <SlidePanel
        title="Document Type Settings"
        open={slidePanelOpen}
        onClose={() => setSlidePanelOpen(false)}
        footer={
          <Button
            block
            appearance="ghost"
            color="red"
            icon={<Trash className="h-4 w-4 mr-2" />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        }
      >
        <DocumentTypeSettings
          documentType={documentType || {}}
          onChange={handleSave}
        />
      </SlidePanel>
    </div>
  );
}
