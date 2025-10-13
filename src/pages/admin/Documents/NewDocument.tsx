import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  EditorHeader,
  FeatureImageUpload,
  TitleInput,
  ContentEditor,
  WordCount,
} from '../../../components/admin';
import { useAuth } from '../../../hooks/useAuth';
import { Content } from '../../../services/admin.api';
import { generateSlugFromTitle } from '../../../lib/slug';

import '../../../styles/editor.css';
import { OutputData } from '@editorjs/editorjs';
import SlidePanel from '../../../components/ui/SlidePanel.tsx';
import DocumentSettings from '../../../components/admin/DocumentSettings.tsx';
import Button from '../../../components/ui/Button.tsx';
import { Trash } from 'lucide-react';
import {
  useApiCategories,
  useApiTags,
  useContentCrud,
} from '../../../hooks/useApiData';
import {
  ApiResponse,
  CreateContentDto,
  UpdateContentDto,
} from '../../../services/types';
import { Category, Tag } from '../../../services/types';

export default function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('auth_token') || '';
  const location = useLocation();
  const hash = location.hash.substring(1);
  const documentId = hash.split('/')[2];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<OutputData>({ blocks: [] });
  const [wordCount, setWordCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [document, setDocument] = useState<Content>({
    id: '',
    title: '',
    slug: '',
    content: { blocks: [] },
    categories: [],
    tags: [],
    publishedAt: undefined,
    excerpt: '',
    contentType: { id: '', name: '', slug: '' },
    media: [],
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const {
    createContent,
    updateContent,
    getContent,
    loading: crudLoading,
  } = useContentCrud(token || undefined);

  const { data: categoriesData } = useApiCategories({
    isAdmin: true,
    authToken: token || undefined,
  }) as ApiResponse<Category[]>;

  const { data: tagsData } = useApiTags({
    isAdmin: true,
    authToken: token || undefined,
  }) as ApiResponse<Tag[]>;

  const loadDocument = async () => {
    const document = (await getContent(documentId)) as unknown as Content;
    setDocument(document);
  };

  const filteredCategories = useMemo(() => {
    const apiResponse: ApiResponse<Category[]> =
      categoriesData as unknown as ApiResponse<Category[]>;
    const localCategories = apiResponse?.data || [];
    if (!apiResponse || !Array.isArray(localCategories)) return [];

    return localCategories;
  }, [categoriesData]);

  const filteredTags = useMemo(() => {
    const apiResponse: ApiResponse<Tag[]> = tagsData as unknown as ApiResponse<
      Tag[]
    >;
    const localTags = apiResponse?.data || [];
    if (!apiResponse || !Array.isArray(localTags)) return [];

    return localTags;
  }, [tagsData]);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleImageUpload = (file: File) => {
    // Handle image upload logic here
    console.log('Image uploaded:', file);
  };

  const handlePreview = () => {
    // Handle preview logic here
    console.log('Preview clicked');
  };

  const handleSave = async (document: Content) => {
    setError('');
    // Handle draft logic here

    if (!document.title?.trim()?.length) {
      setError('Please enter a title for your document');
      return;
    }

    const slug = generateSlugFromTitle(document.title);

    setStatus('Draft - Saving...');
    console.log('Draft clicked', document);
    setDocument(document);
    try {
      if (!documentId) {
        const createContentDto: CreateContentDto = {
          title: document.title.trim(),
          slug,
        };

        const createdDocument = (await createContent(
          createContentDto
        )) as unknown as ApiResponse<Content>;

        if (createdDocument?.data?.id) {
          window.location.hash = `#editor/document/${createdDocument.data.id}`;
        }
      } else {
        const updateContentDto: UpdateContentDto = {
          title: document.title,
          slug,
          content: document.content,
          status: document.status,
          categoryIds: document.categories?.map(c => c.id),
          tagIds: document.tags?.map(t => t.id),
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
    if (!document.title.trim()) {
      setError('Please enter a title for your document');
      return;
    }

    if (!content.blocks || content.blocks.length === 0) {
      setError('Please add some content to your document');
      return;
    }

    if (!token || !user) {
      setError('You must be logged in to create documents');
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const slug = generateSlugFromTitle(document.title);
      const createContentDto: CreateContentDto = {
        title: document.title.trim(),
        slug,
      };
      await createContent(createContentDto);
      // Navigate to the documents list or the created document
      navigate('/admin/documents');
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

  const converToWordCount = (content: OutputData) => {
    return content.blocks.reduce((acc, block) => {
      console.log('Block:', block.data.text);
      if (!block.data.text) return acc;
      return (
        acc +
        block.data.text.split(/\s+/).filter((word: string) => word.length > 0)
          .length
      );
    }, 0);
  };

  const onContentChange = (content: OutputData) => {
    const count = converToWordCount(content);
    setContent(content);
    setWordCount(count);
    const doc = {
      ...document,
      content: content as unknown as Record<string, unknown>,
    };
    handleSave(doc);
    setDocument(doc);
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
          onBack={() => navigate('/admin/documents')}
          backLabel="Documents"
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
        <FeatureImageUpload onUpload={handleImageUpload} />
        <TitleInput
          value={title}
          onChange={setTitle}
          onBlur={value => handleSave({ ...document, title: value })}
        />
        <ContentEditor onChange={onContentChange} />
        <WordCount count={wordCount} />
      </div>
      <SlidePanel
        title="Document Settings"
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
        <DocumentSettings
          document={document || {}}
          onChange={handleSave}
          availableCategories={filteredCategories}
          availableTags={filteredTags}
        />
      </SlidePanel>
    </div>
  );
}
