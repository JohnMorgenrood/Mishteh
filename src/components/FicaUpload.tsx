'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader, Camera, Image as ImageIcon } from 'lucide-react';

interface FicaUploadProps {
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  required?: boolean;
  value?: File | null;
  icon?: 'camera' | 'document' | 'image';
}

export default function FicaUpload({
  label,
  description,
  onFileSelect,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  maxSize = 5242880, // 5MB
  required = false,
  value,
  icon = 'document',
}: FicaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onFileSelect(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
  });

  const getIcon = () => {
    switch (icon) {
      case 'camera':
        return <Camera className="w-8 h-8 text-primary-500" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-primary-500" />;
      default:
        return <File className="w-8 h-8 text-primary-500" />;
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-xs text-gray-500 mb-2">{description}</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : value
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {value ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
              )}
              <p className="text-sm font-medium text-green-700">{value.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(value.size / 1024).toFixed(2)} KB
              </p>
              <p className="text-xs text-primary-600 mt-2">Click to replace</p>
            </>
          ) : (
            <>
              {getIcon()}
              <p className="text-sm font-medium text-gray-700 mt-2">
                {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, or PDF (max {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-600">
            {fileRejections[0].errors[0].message}
          </p>
        </div>
      )}
    </div>
  );
}
