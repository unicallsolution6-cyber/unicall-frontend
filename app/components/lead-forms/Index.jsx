'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import Sidebar from '../sidebar';
import Header from '../header';
import SubHeader from '../sub-header';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import LeadForms from './LeadForms';
import UnstructuredLeadForms from './UnstructuredLeadForms';
import LeadFiles from './LeadFiles';

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [leadForms, setLeadForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('this-month');
  const [userFilter, setUserFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const { role } = useLayoutData();
  const { user } = useAuth();

  // Fetch users for dropdown (admin only)
  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.users.getAll(1, 100);
      if (response.success) {
        const filteredUsers =
          response.data.users?.filter((user) => user.role === 'user') || [];
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setSelectedDateFilter(filter);
    setCurrentPage(1);
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    setCurrentPage(1);
  };

  const handleBulkUpload = async (file) => {
    try {
      setLoading(true);

      const response = await api.leadForms.bulkUpload(file);

      if (response.success) {
        alert(`${response.data.message} ${response.data.total}`);
        // fetchLeadForms(); // Refresh the list
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Bulk upload failed');
    } finally {
      setLoading(false);
      setFileUploadOpen(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      console.log(file);
      const response = await api.leadForms.uploadFile(file);
      console.log(response);
      if (response.success) {
        alert(`${response.data.message} ${response.data.total}`);
        // fetchLeadForms(); // Refresh the list
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Bulk upload failed');
    } finally {
      setLoading(false);
      setFileUploadOpen(false);
    }
  };

  // Transform users data for dropdown
  const userDropdownOptions = users.map((user) => ({
    value: user._id,
    label: user.name || user.email,
    icon: '/user.png',
  }));

  const allUserDropdownOptions = usersLoading
    ? [{ value: '', label: 'Loading users...', icon: '/user.png' }]
    : [
        { value: '', label: 'All Users', icon: '/user.png' },
        ...userDropdownOptions,
      ];

  return (
    <div className="min-h-screen bg-black flex relative !z-10 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar activeTab="Leads Forms" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header title="Lead Forms" icon={FileText} />

        {/* Sub Header Component */}

        <SubHeader
          searchPlaceholder="Search lead forms..."
          filterOptions={[
            { value: 'today', label: 'Today' },
            { value: 'this-week', label: 'This Week' },
            { value: 'this-month', label: 'This Month' },
            { value: 'last-month', label: 'Last Month' },
            { value: 'this-year', label: 'This Year' },
            { value: 'all-time', label: 'All Time' },
          ]}
          showUserDropdown={true}
          userDropdownOptions={
            role == 'admin'
              ? allUserDropdownOptions
              : [
                  { value: 'all', label: 'All Leads', icon: '/users.png' },
                  { value: user._id, label: 'My Leads', icon: '/user.png' },
                ]
          }
          defaultUser={role === 'admin' ? selectedUser : 'all'}
          defaultFilter={selectedDateFilter}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onUserChange={
            role === 'admin'
              ? handleUserChange
              : (value) => {
                  setUserFilter(value);
                  setCurrentPage(1);
                }
          }
          isAdmin={role == 'admin'}
        />

        {/* Main Lead Forms Content */}
        <div className="px-8 pb-6 flex-1">
          {/* File Upload Modal */}
          {fileUploadOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-6 rounded-2xl w-[400px] shadow-lg">
                {/* Header */}
                <h3 className="text-white text-xl font-bold mb-2">
                  Upload Lead File
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Please upload a{' '}
                  <span className="font-medium text-gray-200">
                    {activeTab !== 2 ? '.txt' : '.txt, .pdf or any image'}
                  </span>{' '}
                  file with lead data in the correct format.
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
                    accept=".txt,.pdf,image/*"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        if (activeTab !== 2)
                          handleBulkUpload(e.target.files[0]);
                        else handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <p className="text-xs text-gray-500 mt-3">
                    {activeTab !== 2
                      ? 'Only .txt files are supported'
                      : 'Upload any file'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setFileUploadOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {role === 'admin' && (
            <div className="flex justify-end gap-4">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setFileUploadOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{activeTab !== 2 ? 'Bulk Upload' : 'File upload'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchQuery ||
            selectedUser ||
            selectedDateFilter !== 'this-month') && (
            <div className="mb-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedUser && (
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                  User:{' '}
                  {users.find((u) => u._id === selectedUser)?.name || 'Unknown'}
                </span>
              )}
              {selectedDateFilter !== 'this-month' && (
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                  Period:{' '}
                  {selectedDateFilter
                    .replace('-', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
            </div>
          )}

          <div className="px-8 mb-6">
            {['Lead Forms', 'Leads w/o Format', 'Lead Files'].map(
              (tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === index
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Tabs Content */}
          {activeTab === 0 && (
            <LeadForms
              searchQuery={searchQuery}
              selectedUser={selectedUser}
              selectedDateFilter={selectedDateFilter}
              userFilter={userFilter}
              loading={loading}
              setLoading={setLoading}
            />
          )}

          {activeTab === 1 && (
            <UnstructuredLeadForms
              searchQuery={searchQuery}
              selectedUser={selectedUser}
              selectedDateFilter={selectedDateFilter}
              userFilter={userFilter}
              loading={loading}
              setLoading={setLoading}
            />
          )}

          {activeTab === 2 && (
            <LeadFiles
              searchQuery={searchQuery}
              selectedUser={selectedUser}
              selectedDateFilter={selectedDateFilter}
              userFilter={userFilter}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </div>
      </div>

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
