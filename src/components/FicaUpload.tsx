'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  // Create preview when value changes externally
  useEffect(() => {
    if (value && value.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(value);
    } else if (!value) {
      setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      
      // Handle rejected files
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorCode = rejection.errors?.[0]?.code;
        
        if (errorCode === 'file-too-large') {
          setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        } else if (errorCode === 'file-invalid-type') {
          setError('Invalid file type. Please upload a valid image file.');
        } else {
          setError(rejection.errors?.[0]?.message || 'File upload failed');
        }
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      console.log('File selected:', file.name, file.type, file.size);
      
      // Call the parent's onFileSelect
      onFileSelect(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.onerror = () => {
          console.error('Failed to read file for preview');
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onFileSelect, maxSize]
  );

  // Build accept object for react-dropzone
  const acceptObject = acceptedTypes.reduce((acc, type) => {
    // Map MIME types to extensions for better browser support
    const extensions: { [key: string]: string[] } = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/jpg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    };
    return { ...acc, [type]: extensions[type] || [] };
  }, {});

  const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxSize,
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
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

      {/* Custom error display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* React-dropzone rejections */}
      {fileRejections.length > 0 && !error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">
            {fileRejections[0].errors[0].message}
          </p>
        </div>
      )}

      {/* Manual file input fallback for browsers with dropzone issues */}
      <div className="mt-2">
        <button
          type="button"
          onClick={open}
          className="text-xs text-primary-600 hover:text-primary-700 underline"
        >
          Click here if drag & drop doesn't work
        </button>
      </div>
    </div>
  );
}
