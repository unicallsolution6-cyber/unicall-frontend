import { X } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function FileModal({ file, onClose }) {
  if (!file) return null;

  const fileUrl = `${BASE_URL}${file.link}`;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1e1f29] rounded-lg w-11/12 md:w-3/4 lg:w-2/3 h-5/6 flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-gray-200 font-semibold truncate">
            {file.fileName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Preview */}
        <div className="flex-1 overflow-hidden">
          {file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={fileUrl}
              alt={file.fileName}
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={fileUrl}
              title={file.fileName}
              className="w-full h-full border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
