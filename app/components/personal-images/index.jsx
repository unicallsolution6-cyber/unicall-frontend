'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../sidebar';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../header';
import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { userFiles } from '@/lib/api';

export default function PersonalImages() {
  const { role } = useLayoutData();
  const { user } = useAuth();

  const [files, setFiles] = useState([]);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Only image files are allowed');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await userFiles.upload(user._id, selectedFile);
      setSelectedFile(null);
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
            Upload Image
          </button>
        </div>

        {/* Images grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file._id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`}
                alt={file.fileName}
                className="w-full h-48 object-cover"
              />
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
            <h3 className="text-white text-xl font-bold mb-2">Upload Image</h3>
            <p className="text-gray-400 text-sm mb-6">
              Please upload an{' '}
              <span className="font-medium text-gray-200">image file</span>.
            </p>

            {/* File upload area */}
            <div className="border-2 border-dashed border-gray-600 hover:border-purple-500 transition rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 mb-6">
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
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile && (
                <p className="text-xs text-gray-300 mt-3">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  setFileUploadOpen(false);
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
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
