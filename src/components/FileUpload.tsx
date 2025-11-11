'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, XCircle, Loader } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess?: (document: any) => void;
  requestId?: string;
  documentType?: string;
  maxSize?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({
  onUploadSuccess,
  requestId,
  documentType = 'general',
  maxSize = 5242880, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
}: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadStatus('uploading');
      setError('');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        if (requestId) {
          formData.append('requestId', requestId);
        }

        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload file');
        }

        setUploadStatus('success');
        setUploadedFile(data.document);
        
        if (onUploadSuccess) {
          onUploadSuccess(data.document);
        }
      } catch (err: any) {
        setUploadStatus('error');
        setError(err.message || 'Failed to upload file');
      }
    },
    [documentType, requestId, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {uploadStatus === 'idle' && (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-base font-medium text-gray-700 mb-1">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm text-gray-500">or click to select a file</p>
              <p className="text-xs text-gray-400 mt-2">
                Accepted: JPG, PNG, PDF (max {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}

          {uploadStatus === 'uploading' && (
            <>
              <Loader className="w-12 h-12 text-primary-600 mb-3 animate-spin" />
              <p className="text-base font-medium text-gray-700">Uploading...</p>
            </>
          )}

          {uploadStatus === 'success' && uploadedFile && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
              <p className="text-base font-medium text-gray-700 mb-1">Upload successful!</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <File className="w-4 h-4" />
                <span>{uploadedFile.fileName}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadStatus('idle');
                  setUploadedFile(null);
                }}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Upload another file
              </button>
            </>
          )}

          {uploadStatus === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mb-3" />
              <p className="text-base font-medium text-gray-700 mb-1">Upload failed</p>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadStatus('idle');
                  setError('');
                }}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {fileRejections[0].errors[0].message}
          </p>
        </div>
      )}
    </div>
  );
}
