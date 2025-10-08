import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EditorHeader,
  FeatureImageUpload,
  TitleInput,
  ContentEditor,
  WordCount,
  BlockType,
} from '../../../components/admin';

export default function NewDocument() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (text: string) => {
    setContent(text);
    setWordCount(
      text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length
    );
  };

  const handleImageUpload = (file: File) => {
    // Handle image upload logic here
    console.log('Image uploaded:', file);
  };

  const handleBlockSelect = (blockType: BlockType) => {
    // Handle block insertion logic here
    console.log('Block selected:', blockType);
  };

  const handlePreview = () => {
    // Handle preview logic here
    console.log('Preview clicked');
  };

  const handlePublish = () => {
    // Handle publish logic here
    console.log('Publish clicked');
  };

  const handleSettings = () => {
    // Handle settings logic here
    console.log('Settings clicked');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <div>
        <EditorHeader
          onBack={() => navigate('/admin/documents')}
          backLabel="Documents"
          currentPage="New"
          onPreview={handlePreview}
          onPublish={handlePublish}
          onSettings={handleSettings}
        />
      </div>

      {/* Main Content Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <FeatureImageUpload onUpload={handleImageUpload} />

        <TitleInput
          value={title}
          onChange={setTitle}
          placeholder="Post title"
        />

        <ContentEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Begin writing your post..."
          onBlockSelect={handleBlockSelect}
        />

        <WordCount count={wordCount} />
      </div>
    </div>
  );
}
