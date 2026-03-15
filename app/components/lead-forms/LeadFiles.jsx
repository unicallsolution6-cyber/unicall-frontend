import { useEffect, useState } from 'react';
import { Loader, Trash2 } from 'lucide-react';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import FileModal from './FileModal';
import api from '@/lib/api';

export default function LeadFiles({
  searchQuery,
  selectedUser,
  selectedDateFilter,
  userFilter,
  loading,
  setLoading,
}) {
  const { role } = useLayoutData();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const filters = { type: 'file' };

      if (searchQuery && searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (role === 'admin') {
        if (selectedUser && selectedUser !== '') {
          filters.assignedTo = selectedUser;
        }
      } else {
        if (userFilter === 'mine') {
          filters.assignedTo = user._id;
        }
      }

      if (selectedDateFilter && selectedDateFilter !== 'all-time') {
        filters.dateFilter = selectedDateFilter;
      }

      const response = await api.leadForms.getUnstructured(
        currentPage,
        20,
        filters
      );

      if (response.success) {
        setFiles(response.data.unstructuredForms);
        setTotalPages(Math.ceil(response.data.total / 20));
      }
    } catch (error) {
      console.error('Error fetching lead files:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      console.log(fileId);
      await api.leadForms.deleteUnstructured(fileId);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPage, searchQuery, selectedUser, selectedDateFilter, userFilter]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-3 text-white">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading lead files...</span>
          </div>
        </div>
      ) : (
        <div className="bg-transparent rounded-lg flex flex-col flex-1 h-[calc(100vh-20rem)]">
          {/* File Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 overflow-y-auto">
            {files.length > 0 ? (
              files.map((file) => {
                return (
                  <div
                    key={file._id}
                    className="bg-[#252731] rounded-lg p-4 flex flex-col justify-between shadow-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="text-gray-200 text-sm font-medium truncate mb-4">
                      {file.fileName}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md py-2 text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        Open
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => deleteFile(file._id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-md px-3 py-2 text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 col-span-full">
                No lead files found
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Modal */}
      <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />
    </>
  );
}
