'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../sidebar';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../header';
import { Upload, Eye, Download, Trash2, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { userFiles } from '@/lib/api';

export default function PersonalImages() {
  const { role } = useLayoutData();
  const { user } = useAuth();

  const [files, setFiles] = useState([]);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const getFileUrl = (file) =>
    `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`;

  const handleDownload = async (file) => {
    try {
      setDownloadingId(file._id);
      await userFiles.download(file._id, file.fileName);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.fileName}"? This cannot be undone.`)) return;
    try {
      setDeletingId(file._id);
      const res = await userFiles.delete(file._id);
      if (res?.success) {
        setFiles((prev) => prev.filter((f) => f._id !== file._id));
      } else {
        alert(res?.message || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch user files
  useEffect(() => {
    if (user?._id) fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const res = await userFiles.getFiles(user.id);
      setFiles(res?.data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const images = picked.filter((file) => file.type.startsWith('image/'));

    if (images.length !== picked.length) {
      alert('Only image files are allowed. Non-image files were skipped.');
    }

    // Append to any previously selected files, de-duplicating by name + size
    setSelectedFiles((prev) => {
      const merged = [...prev];
      images.forEach((file) => {
        const exists = merged.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists) merged.push(file);
      });
      return merged;
    });

    // Allow re-selecting the same file again after removal
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      await userFiles.upload(user._id, selectedFiles);
      setSelectedFiles([]);
      setFileUploadOpen(false);
      await fetchFiles();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  console.log(files);

  return (
    <div className="min-h-screen bg-black flex relative z-10 overflow-hidden relative">
      {/* Sidebar Component */}
      <Sidebar activeTab="Leads Forms" />

      <div className="flex-1 flex flex-col p-6">
        <Header title="Images" />

        {/* Open Upload Modal Button */}
        <div className="mt-4">
          <button
            onClick={() => setFileUploadOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Upload Images
          </button>
        </div>

        {/* Images grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file._id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg group"
            >
              <div className="relative">
                <img
                  src={getFileUrl(file)}
                  alt={file.fileName}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setPreviewFile(file)}
                />
                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewFile(file)}
                    title="View"
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file._id}
                    title="Download"
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {downloadingId === file._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deletingId === file._id}
                    title="Delete"
                    className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {deletingId === file._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-2 text-sm text-gray-300 truncate">
                {file.fileName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {fileUploadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-[400px] shadow-lg">
            {/* Header */}
            <h3 className="text-white text-xl font-bold mb-2">Upload Images</h3>
            <p className="text-gray-400 text-sm mb-6">
              Please upload one or more{' '}
              <span className="font-medium text-gray-200">image files</span>.
            </p>

            {/* File upload area */}
            <div className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 mb-4">
              <Upload className="w-8 h-8 mb-3 text-gray-500" />

              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Browse Files
              </label>

              <input
                type="file"
                accept="image/*"
                id="file-upload"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="mb-6 max-h-40 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-gray-300 truncate mr-2">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      title="Remove"
                      className="text-gray-400 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedFiles([]);
                  setFileUploadOpen(false);
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFiles.length || uploading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {uploading
                  ? 'Uploading...'
                  : `Upload${
                      selectedFiles.length ? ` (${selectedFiles.length})` : ''
                    }`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm truncate">
                {previewFile.fileName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  disabled={downloadingId === previewFile._id}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <img
              src={getFileUrl(previewFile)}
              alt={previewFile.fileName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Background radial */}
      <div
        className="absolute top-[50%] left-[-70%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)',
        }}
      ></div>
    </div>
  );
}
