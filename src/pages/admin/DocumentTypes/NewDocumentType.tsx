import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditorHeader, TitleInput } from '../../../components/admin';
import { useAuth } from '../../../hooks/useAuth';
import { DocumentType } from '../../../services/admin.api';
import { generateSlugFromTitle } from '../../../lib/slug';

import '../../../styles/editor.css';
import SlidePanel from '../../../components/ui/SlidePanel.tsx';
import DocumentTypeSettings from '../../../components/admin/DocumentTypeSettings.tsx';
import Button from '../../../components/ui/Button.tsx';
import { Trash } from 'lucide-react';
import { useContentCrud } from '../../../hooks/useApiData';
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
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const {
    createContent,
    updateContent,
    getContent,
    loading: crudLoading,
  } = useContentCrud(token || undefined);

  const loadDocumentType = async () => {
    const documentType = (await getContent(
      documentId
    )) as unknown as DocumentType;
    setDocumentType(documentType);
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

    if (!documentType.title?.trim()?.length) {
      setError('Please enter a title for your document type');
      return;
    }

    const slug = generateSlugFromTitle(documentType.title);

    setStatus('Draft - Saving...');
    console.log('Draft clicked', documentType);
    setDocumentType(documentType);
    try {
      if (!documentId) {
        const createContentDto: CreateDocumentTypeDto = {
          title: documentType.title.trim(),
          slug,
        };

        const createdDocument = (await createContent(
          createContentDto
        )) as unknown as ApiResponse<DocumentType>;

        if (createdDocument?.data?.id) {
          window.location.hash = `#editor/document/${createdDocument.data.id}`;
        }
      } else {
        const updateContentDto: UpdateDocumentTypeDto = {
          title: documentType.title,
          slug,
        };
        await updateContent(documentId, updateContentDto);
      }
    } catch (err) {
      console.error('Error creating document:', err);
      // setError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setStatus('Draft - Saved');
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    if (!documentType.title.trim()) {
      setError('Please enter a title for your document');
      return;
    }

    if (!token || !user) {
      setError('You must be logged in to create documents');
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const slug = generateSlugFromTitle(documentType.title);
      const createContentDto: CreateDocumentTypeDto = {
        title: documentType.title.trim(),
        slug,
      };
      await createContent(createContentDto);
      // Navigate to the documents list or the created document
      navigate('/admin/document-types');
    } catch (err) {
      console.error('Error creating document:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create document'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenSettings = () => {
    // Handle settings logic here
    setSlidePanelOpen(true);
    console.log('Settings clicked');
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
          value={title}
          onChange={setTitle}
          onBlur={value => handleSave({ ...documentType, title: value })}
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
            onClick={() => setSlidePanelOpen(false)}
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
