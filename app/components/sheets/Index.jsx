'use client';

import { useState, useEffect } from 'react';
import {
  Sheet as SheetIcon,
  Plus,
  Eye,
  Pencil,
  Download,
  Trash2,
  Loader,
} from 'lucide-react';
import Sidebar from '../sidebar';
import Header from '../header';
import SubHeader from '../sub-header';
import { Button } from '../ui/Button';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import SheetModal from './SheetModal';

// Convert rich-text HTML to plain text for .txt download
const htmlToPlainText = (html) => {
  if (typeof window === 'undefined') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
};

const downloadTxt = (filename, html) => {
  const text = htmlToPlainText(html);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'sheet'}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export default function Sheets() {
  const { role } = useLayoutData();
  const { user } = useAuth();
  const isAdmin = (user?.role || role) === 'admin';

  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all-time');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Modal state: { mode: 'create' | 'edit' | 'view', sheet }
  const [modal, setModal] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchQuery && searchQuery.trim()) filters.search = searchQuery.trim();
      if (isAdmin && selectedUser) filters.createdBy = selectedUser;
      if (selectedDateFilter && selectedDateFilter !== 'all-time')
        filters.dateFilter = selectedDateFilter;

      const response = await api.sheets.getAll(1, 100, filters);
      if (response.success) {
        setSheets(response.data.sheets || []);
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.users.getAll(1, 100);
      if (response.success) {
        const filtered =
          response.data.users?.filter((u) => u.role === 'user') || [];
        setUsers(filtered);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    fetchSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedUser, selectedDateFilter]);

  const handleSaved = () => {
    fetchSheets();
  };

  const handleDelete = async (sheet) => {
    if (
      !window.confirm(
        `Delete "${sheet.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const response = await api.sheets.delete(sheet._id);
      if (response.success) {
        setSheets((prev) => prev.filter((s) => s._id !== sheet._id));
      }
    } catch (error) {
      console.error('Error deleting sheet:', error);
    }
  };

  // For download we fetch the latest content (list may be trimmed in future)
  const handleDownload = async (sheet) => {
    try {
      setDownloadingId(sheet._id);
      let content = sheet.content;
      if (content === undefined) {
        const res = await api.sheets.getById(sheet._id);
        content = res?.data?.content || '';
      }
      downloadTxt(sheet.name, content);
    } catch (error) {
      console.error('Error downloading sheet:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const userDropdownOptions = users.map((u) => ({
    value: u._id,
    label: u.name || u.email,
    icon: '/user.png',
  }));

  const allUserDropdownOptions = usersLoading
    ? [{ value: '', label: 'Loading users...', icon: '/user.png' }]
    : [
        { value: '', label: 'All Agents', icon: '/user.png' },
        ...userDropdownOptions,
      ];

  return (
    <div className="min-h-screen bg-black flex relative !z-10 overflow-hidden">
      <Sidebar activeTab="Sheets" />

      <div className="flex-1 flex flex-col">
        <Header title="Sheets" icon={SheetIcon} />

        <SubHeader
          searchPlaceholder="Search sheets..."
          showUserDropdown={isAdmin}
          userDropdownOptions={isAdmin ? allUserDropdownOptions : []}
          defaultUser={selectedUser}
          defaultFilter={selectedDateFilter}
          onSearch={(q) => setSearchQuery(q)}
          onFilterChange={(v) => setSelectedDateFilter(v)}
          onUserChange={isAdmin ? (v) => setSelectedUser(v) : undefined}
          isAdmin={isAdmin}
        />

        <div className="px-8 pb-6 flex-1 flex flex-col">
          {/* Add Sheet control */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setModal({ mode: 'create', sheet: null })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sheet</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="flex items-center space-x-3 text-white">
                <Loader className="w-6 h-6 animate-spin" />
                <span>Loading sheets...</span>
              </div>
            </div>
          ) : sheets.length === 0 ? (
            /* Blank state */
            <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-center mb-6">
                <SheetIcon className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">
                No sheets yet
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Create your first sheet to start writing. Your sheets are private
                {isAdmin ? '' : ' to you'}.
              </p>
              <Button
                onClick={() => setModal({ mode: 'create', sheet: null })}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sheet</span>
              </Button>
            </div>
          ) : (
            /* Sheets table */
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                      <th className="px-6 py-4 font-medium">Name</th>
                      {isAdmin && (
                        <th className="px-6 py-4 font-medium">Agent</th>
                      )}
                      <th className="px-6 py-4 font-medium">Last Updated</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.map((sheet) => (
                      <tr
                        key={sheet._id}
                        className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-100 font-medium">
                          <button
                            onClick={() => setModal({ mode: 'view', sheet })}
                            className="hover:text-purple-400 transition-colors text-left"
                          >
                            {sheet.name}
                          </button>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-gray-300 text-sm">
                            {sheet.createdBy?.name ||
                              sheet.createdBy?.email ||
                              '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(sheet.updatedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="View"
                              onClick={() => setModal({ mode: 'view', sheet })}
                              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Edit"
                              onClick={() => setModal({ mode: 'edit', sheet })}
                              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              title="Download (.txt)"
                              onClick={() => handleDownload(sheet)}
                              disabled={downloadingId === sheet._id}
                              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/60 transition-colors disabled:opacity-50"
                            >
                              {downloadingId === sheet._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              title="Delete"
                              onClick={() => handleDelete(sheet)}
                              className="p-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <SheetModal
          mode={modal.mode}
          sheet={modal.sheet}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div
        className="absolute top-[50%] left-[-70%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60 z-[-1]"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)',
        }}
      ></div>
    </div>
  );
}
