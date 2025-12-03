import React, { useState } from 'react';
import { api } from '../services/api';

const VideoUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please drop a valid video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a video file');
      return;
    }

    setUploading(true);
    setMessage('Uploading...');

    try {
      const response = await api.uploadVideo(selectedFile);
      setUploading(false);
      setMessage('Video uploaded successfully!');
      
      if (onUploadSuccess) onUploadSuccess(response);
      
      setTimeout(() => {
        setSelectedFile(null);
        setMessage('');
      }, 2000);
      
    } catch (error) {
      setMessage(`Upload failed: ${error.response?.data?.message || error.message}`);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="stat-card h-full flex flex-col p-4">
      <h3 className="text-lg font-bold mb-3 text-white">Upload Video</h3>
      
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <label
          htmlFor="video-upload"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-full
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800/70'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
            <svg 
              className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            
            {selectedFile ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-green-400 mb-1">
                  ✓ {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  MP4, AVI, MOV, MKV (MAX. 500MB)
                </p>
              </>
            )}
          </div>
          
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`
            mt-4 w-full font-semibold py-2.5 px-4 rounded-lg 
            transition-all duration-300 text-sm
            ${selectedFile && !uploading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {uploading ? 'Uploading...' : 'Upload & Process'}
        </button>

        {message && (
          <div className={`
            mt-3 p-2 rounded-lg text-xs text-center font-medium
            ${message.includes('failed') || message.includes('Please') 
              ? 'bg-red-500/10 text-red-400' 
              : 'bg-green-500/10 text-green-400'
            }
          `}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
