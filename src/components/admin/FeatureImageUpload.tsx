import { Plus, Image } from 'lucide-react';
import { useState } from 'react';

interface FeatureImageUploadProps {
  onUpload?: (file: File) => void;
  className?: string;
}

export default function FeatureImageUpload({
  onUpload,
  className = '',
}: FeatureImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      if (onUpload) {
        onUpload(file);
      }
    }
  };

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  };

  return (
    <div className={`mb-8 ${className}`}>
      {!uploadedImage ? (
        <label className="flex items-center justify-start cursor-pointer">
          <div className="flex items-center">
            <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Add feature image
            </span>
            <Image className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Feature image"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
          >
            <Plus className="h-4 w-4 rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
}
