'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, GradientSelect } from './ui/Select';
import { Search, ChevronDown, Plus } from 'lucide-react';

export default function SubHeader({
  welcomeMessage,
  searchPlaceholder,
  filterOptions = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'all-time', label: 'All Time' },
  ],
  defaultFilter = 'this-month',
  showUserDropdown = false,
  userDropdownOptions = [
    { value: 'sameer', label: 'Sameer Asif', icon: '/user.png' },
    { value: 'john', label: 'John Doe', icon: '/user2.png' },
    { value: 'jane', label: 'Jane Smith', icon: '/user.png' },
  ],
  defaultUser = 'sameer',
  showLinkButton = false,
  linkButtonText = 'Add New',
  linkButtonHref = '#',
  linkButtonIcon,
  onSearch,
  onFilterChange,
  onUserChange,
  onLinkButtonClick,
  isAdmin = false, // New prop to determine if user is admin
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [selectedUser, setSelectedUser] = useState(defaultUser);

  // Create user filter options for non-admin users
  const userFilterOptions = [
    { value: 'all', label: 'All Leads' },
    { value: 'mine', label: 'My Leads', icon: '/user.png' },
  ];

  // Sync state with props when they change
  useEffect(() => {
    setSelectedFilter(defaultFilter);
  }, [defaultFilter]);

  useEffect(() => {
    setSelectedUser(defaultUser);
  }, [defaultUser]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleSearchBlur = (e) => {
    const query = e.target.value;
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value;
      if (onSearch) {
        onSearch(query);
      }
    }
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const handleUserChange = (value) => {
    setSelectedUser(value);
    if (onUserChange) {
      onUserChange(value);
    }
  };

  const handleLinkButtonClick = (e) => {
    if (onLinkButtonClick) {
      e.preventDefault();
      onLinkButtonClick();
    }
  };

  return (
    <div className="p-6 px-10 z-10">
      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-8">
        {welcomeMessage && (
          <h2 className="text-white text-2xl font-semibold">
            {welcomeMessage}
          </h2>
        )}

        {showLinkButton && (
          <div className="flex items-center space-x-4">
            <Button
              variant="default"
              size="md"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
              onClick={handleLinkButtonClick}
            >
              {linkButtonIcon || <Plus className="w-4 h-4 mr-2" />}
              {linkButtonText}
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* User Filter Dropdown - shows different options based on isAdmin */}
          {showUserDropdown && (
            <GradientSelect
              options={isAdmin ? userDropdownOptions : userFilterOptions}
              value={selectedUser}
              onChange={handleUserChange}
              placeholder={isAdmin ? 'Select user' : 'Filter leads'}
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Input */}
          {searchPlaceholder && (
            <div className="relative flex-1 min-w-sm max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 pl-10 h-10 rounded-lg focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Date Filter */}
          <div className="w-48">
            <Select
              options={filterOptions}
              value={selectedFilter}
              onChange={handleFilterChange}
              placeholder="Select period"
              variant="dark"
              className="bg-gray-800/50 border-gray-700 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
