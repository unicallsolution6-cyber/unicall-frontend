'use client';

import { useState, useEffect } from 'react';
import {
  UserCheck,
  ImageIcon,
  Loader,
  Upload,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import Sidebar from '../sidebar';
import Header from '../header';
import SubHeader from '../sub-header';
import api from '@/lib/api';

export default function AddUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true,
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate unique email and password on component mount
  useEffect(() => {
    generateUniqueCredentials();
  }, []);

  const generateUniqueCredentials = () => {
    // Generate unique email with timestamp
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const uniqueEmail = `user${timestamp}${randomNum}@unicall.com`;

    // Generate simple unique password (8 characters: letters + numbers)
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setFormData((prev) => ({
      ...prev,
      email: uniqueEmail,
      password: password,
    }));
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Administrator' },
  ];

  const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear any existing errors when user starts typing
    if (submitError) setSubmitError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image size must be less than 5MB');
      return;
    }

    setFormData((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('avatar');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Basic validation
      if (!formData.name.trim()) {
        setSubmitError('Name is required');
        return;
      }
      if (!formData.email.trim()) {
        setSubmitError('Email is required');
        return;
      }
      if (!formData.password.trim()) {
        setSubmitError('Password is required');
        return;
      }

      const userData = new FormData();
      userData.append('name', formData.name.trim());
      userData.append('email', formData.email.trim());
      userData.append('password', formData.password);
      userData.append('role', formData.role);
      userData.append('isActive', formData.isActive);

      // Direct multer upload to the backend uploads folder
      if (formData.profileImage) {
        userData.append('avatar', formData.profileImage);
      }

      const response = await api.users.create(userData);

      if (response.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
          isActive: true,
          profileImage: null,
        });
        setImagePreview(null);

        // Generate new credentials for next user
        generateUniqueCredentials();

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin/unicall-users';
        }, 1500);
      } else {
        setSubmitError(
          response.error || response.message || 'Failed to create user'
        );
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSubmitError('An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  const handleFilterChange = (filter) => {
    console.log('Filter changed:', filter);
  };
  return (
    <div className="min-h-screen bg-black flex z-10 overflow-hidden relative">
      {/* Sidebar Component */}
      <Sidebar activeTab="Unicall Users" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header title="Add New User" icon={UserCheck} />

        {/* Sub Header Component */}
        {/* <SubHeader
          showUserDropdown={true}
          userDropdownLabel="Admin User"
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        /> */}

        {/* Main Content Area */}
        <div className="flex-1 p-10 px-12">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                User created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{submitError}</p>
            </div>
          )}

          {/* Personal Details Form */}
          <div className="max-w-2xl">
            <h2 className="text-white text-xl font-semibold mb-8">
              Personal details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="flex items-center gap-6">
                <Label
                  htmlFor="name"
                  className="text-gray-300 text-sm block w-[20%]"
                >
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg w-full max-w-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div className="flex items-center gap-6">
                <Label
                  htmlFor="email"
                  className="text-gray-300 text-sm block w-[20%]"
                >
                  Email *
                </Label>
                <div className="w-full max-w-lg flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg flex-1 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={generateUniqueCredentials}
                    disabled={isSubmitting}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                  >
                    Generate New
                  </Button>
                </div>
              </div>

              {/* Password Field */}
              <div className="flex items-center gap-6">
                <Label
                  htmlFor="password"
                  className="text-gray-300 text-sm block w-[20%]"
                >
                  Password *
                </Label>
                <div className="w-full max-w-lg flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder="Enter password"
                    className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg flex-1 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={generateUniqueCredentials}
                    disabled={isSubmitting}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                  >
                    Generate New
                  </Button>
                </div>
              </div>

              {/* Role Field */}
              <div className="flex items-center gap-6">
                <Label
                  htmlFor="role"
                  className="text-gray-300 text-sm block w-[20%]"
                >
                  Role
                </Label>
                <div className="w-full max-w-lg">
                  <Select
                    options={roleOptions}
                    value={formData.role}
                    onChange={(value) => handleInputChange('role', value)}
                    placeholder="Select role"
                    variant="dark"
                    className="bg-gray-900 border-none h-12 rounded-lg"
                    disabled={isSubmitting}
                    zIndex={2}
                  />
                </div>
              </div>

              {/* Status Field */}
              <div className="flex items-center gap-6">
                <Label
                  htmlFor="status"
                  className="text-gray-300 text-sm block w-[20%]"
                >
                  Status
                </Label>
                <div className="w-full max-w-lg">
                  <Select
                    options={statusOptions}
                    value={formData.isActive}
                    onChange={(value) => handleInputChange('isActive', value)}
                    placeholder="Select status"
                    variant="dark"
                    className="bg-gray-900 border-none h-12 rounded-lg"
                    disabled={isSubmitting}
                    zIndex={1}
                  />
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="flex items-start gap-6">
                <Label
                  htmlFor="avatar"
                  className="text-gray-300 text-sm block w-[20%] pt-2"
                >
                  Profile Image
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('avatar').click()}
                        disabled={isSubmitting}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {imagePreview && (
                        <Button
                          type="button"
                          onClick={removeImage}
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Supported formats: JPEG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 py-3"
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.email ||
                    !formData.password
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Creating User...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Add New User</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="absolute top-[50%] left-[-80%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60 !z-[-1]"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)',
        }}
      ></div>
    </div>
  );
}
