import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EditorHeader,
  FeatureImageUpload,
  TitleInput,
  ContentEditor,
  WordCount,
} from '../../../components/admin';

import '../../../styles/editor.css';
import { OutputData } from '@editorjs/editorjs';

export default function NewDocument() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<OutputData>({ blocks: [] });
  const [wordCount, setWordCount] = useState(0);

  const handleImageUpload = (file: File) => {
    // Handle image upload logic here
    console.log('Image uploaded:', file);
  };

  const handlePreview = () => {
    // Handle preview logic here
    console.log('Preview clicked');
  };

  const handlePublish = () => {
    // Handle publish logic here
    console.log('Publish clicked', content);
  };

  const handleSettings = () => {
    // Handle settings logic here
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
      <div className="max-w-4xl mx-auto px-14 py-8">
        <FeatureImageUpload onUpload={handleImageUpload} />
        <TitleInput
          value={title}
          onChange={setTitle}
          placeholder="Post title"
        />
        <ContentEditor onChange={onContentChange} />
        <WordCount count={wordCount} />
      </div>
    </div>
  );
}
