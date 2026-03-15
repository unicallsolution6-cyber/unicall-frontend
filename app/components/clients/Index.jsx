'use client';

import { useState, useEffect } from 'react';
import { Users, MoreHorizontal } from 'lucide-react';
import Sidebar from '../sidebar';
import Header from '../header';
import SubHeader from '../sub-header';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { clients } from '@/lib/api';
import api from '@/lib/api';

export default function Clients() {
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('this-month');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { role } = useLayoutData();
  const router = useRouter();

  const banks = [
    {
      name: 'Citi Bank',
      logo: 'C',
      logoColor: 'bg-blue-600',
      borderColor: 'border-blue-500',
      value: 'citi',
    },
    {
      name: 'Bank Of America',
      logo: 'B',
      logoColor: 'bg-red-600',
      borderColor: 'border-blue-500',
      value: 'bofa',
    },
    {
      name: 'Chase Bank',
      logo: 'C',
      logoColor: 'bg-blue-800',
      borderColor: 'border-blue-500',
      value: 'chase',
    },
    {
      name: 'Wells Fargo Bank',
      logo: 'WF',
      logoColor: 'bg-orange-600',
      borderColor: 'border-orange-500',
      value: 'wells',
    },
    {
      name: 'Mixed Banks',
      logo: 'M',
      logoColor: 'bg-gray-600',
      borderColor: 'border-blue-500',
      value: 'mixed',
    },
  ];

  useEffect(() => {
    console.log('useEffect triggered with dependencies:', {
      currentPage,
      searchQuery,
      selectedUser,
      selectedDateFilter,
    });
    fetchClients();
  }, [currentPage, searchQuery, selectedUser, selectedDateFilter]);

  // Fetch users for dropdown (admin only)
  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.users.getAll(1, 100); // Get all users
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const filters = {};

      console.log('Current state before building filters:', {
        searchQuery,
        selectedUser,
        selectedDateFilter,
      });

      // Add search filter
      if (searchQuery && searchQuery.trim()) {
        filters.search = searchQuery.trim();
        console.log('Added search filter:', filters.search);
      }

      // Add user filter (for admin)
      if (selectedUser && selectedUser !== '') {
        filters.createdBy = selectedUser;
        console.log('Added user filter:', filters.createdBy);
      }

      // Add date filter
      if (selectedDateFilter && selectedDateFilter !== 'all-time') {
        filters.dateFilter = selectedDateFilter;
        console.log('Added date filter:', filters.dateFilter);
      }

      console.log('Final filters being sent to API:', filters);
      const response = await clients.getAll(currentPage, 20, filters);
      console.log('API response:', response);

      if (response.success) {
        console.log(
          'Clients received:',
          response.data.clients?.length || 0,
          'items'
        );
        const flattenedClients = response.data.clients.flatMap((client) => {
          if (client.cards && client.cards.length > 0) {
            return client.cards.map((card) => ({
              ...client,
              card,
            }));
          } else {
            return [
              {
                ...client,
                card: null,
              },
            ];
          }
        });
        console.log(response.data.clients);
        console.log(123, flattenedClients);
        setClientsData(flattenedClients);
        setTotalPages(Math.ceil(response.data.total / 20));
      } else {
        console.error('API returned unsuccessful response:', response);
        setError('Failed to fetch clients');
      }
    } catch (error) {
      setError('Failed to fetch clients');
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group clients by bank
  const groupClientsByBank = () => {
    const grouped = banks.map((bank) => ({
      ...bank,
      clients: clientsData.filter((client) => client.bank === bank.value),
    }));
    return grouped;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid-wire':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-400 text-gray-800';
      case 'followup':
        return 'bg-blue-500 text-white';
      case 'deactivated':
        return 'bg-red-500 text-white';
      default:
        return 'bg-white text-gray-800';
    }
  };

  const ClientCard = ({ client }) => (
    <div
      onClick={() => router.push(`/view-client/${client._id}`)}
      className={`${getStatusColor(
        client.status
      )} rounded-lg p-4 shadow-sm !z-10 cursor-pointer hover:shadow-lg transition-shadow`}
    >
      <h3 className="font-semibold mb-1">
        {client.firstName} {client.lastName}
      </h3>
      <p className="text-sm opacity-80">
        Created Date: {new Date(client.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  const handleSearch = (query) => {
    console.log('Search query received:', query);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    console.log('Date filter changed to:', filter);
    setSelectedDateFilter(filter);
    setCurrentPage(1);
  };

  const handleUserChange = (userId) => {
    console.log('User filter changed to:', userId);
    setSelectedUser(userId);
    setCurrentPage(1);
  };

  // Transform users data for dropdown
  const userDropdownOptions = users.map((user) => ({
    value: user._id,
    label: user.name || user.email,
    icon: '/user.png', // Default icon, you can customize based on user data
  }));

  // Add "All Users" option at the beginning
  const allUserDropdownOptions = usersLoading
    ? [{ value: '', label: 'Loading users...', icon: '/user.png' }]
    : [
        { value: '', label: 'All Users', icon: '/user.png' },
        ...userDropdownOptions,
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const groupedClients = groupClientsByBank();

  return (
    <div className="min-h-screen bg-black flex relative !z-10 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar activeTab="Clients" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[100vh]">
        {/* Header Component */}
        <Header title="Clients" icon={Users} />

        {/* Sub Header Component */}
        {role == 'admin' ? (
          <SubHeader
            searchPlaceholder="Search clients..."
            filterOptions={[
              { value: 'today', label: 'Today' },
              { value: 'this-week', label: 'This Week' },
              { value: 'this-month', label: 'This Month' },
              { value: 'last-month', label: 'Last Month' },
              { value: 'this-year', label: 'This Year' },
              { value: 'all-time', label: 'All Time' },
            ]}
            showUserDropdown={true}
            userDropdownOptions={allUserDropdownOptions}
            defaultUser={selectedUser}
            defaultFilter={selectedDateFilter}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onUserChange={handleUserChange}
            // showLinkButton={true}
            // linkButtonText="Add New Client"
            // onLinkButtonClick={() => router.push('/add-client')}
            isAdmin={role === 'admin'}
          />
        ) : (
          <SubHeader
            searchPlaceholder="Search clients..."
            filterOptions={[
              { value: 'today', label: 'Today' },
              { value: 'this-week', label: 'This Week' },
              { value: 'this-month', label: 'This Month' },
              { value: 'last-month', label: 'Last Month' },
              { value: 'this-year', label: 'This Year' },
              { value: 'all-time', label: 'All Time' },
            ]}
            defaultFilter={selectedDateFilter}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            showLinkButton={true}
            linkButtonText="Add New Client"
            onLinkButtonClick={() => router.push('/add-client')}
          />
        )}

        {/* Main Clients Content */}
        <div className="px-8 pb-6 flex-1 flex flex-col">
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

          <div className="flex flex-col flex-1 h-[calc(100vh-15rem)]">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold min-w-[800px] rounded-lg shadow-lg overflow-hidden">
              <div className="border-r border-white/20 pr-4">Client Name</div>
              <div className="border-r border-white/20 pr-4">Cell Number</div>
              <div className="border-r border-white/20 pr-4">
                Credit Card Number
              </div>
              <div className="border-r border-white/20 pr-4">Zip Code</div>
              <div className="border-r border-white/20 pr-4">Bank Name</div>
              <div>Status</div>
            </div>

            {/* Data Rows */}
            <div className="space-y-3 py-3 flex-1 min-h-0 overflow-y-auto">
              {clientsData.length > 0 ? (
                clientsData.map((client, idx) => (
                  <div
                    key={client._id || idx}
                    onClick={() => router.push(`/view-client/${client._id}`)}
                    className="grid grid-cols-6 gap-4 p-4 text-gray-300 text-sm hover:bg-gray-800/50 transition-colors 
                      bg-[#252731] rounded-lg items-center"
                  >
                    <div className="border-r border-white/10 pr-4">{`${client.firstName} ${client.lastName}`}</div>
                    <div className="border-r border-white/10 pr-4">
                      {client.phone}
                    </div>
                    <div className="border-r border-white/10 pr-4">
                      {client.card ? client.card.cardNumber : 'No card'}
                    </div>
                    <div className="border-r border-white/10 pr-4">
                      {client.phone}
                    </div>

                    {/* Status column with button */}
                    <div className="border-r border-white/10 pr-4">
                      <span>{client.bank}</span>
                    </div>

                    <div className="">
                      <span className={`px-2 py-1 rounded-full text-xs mx-4`}>
                        {client.status}
                      </span>
                      <button className="px-3 py-1 text-xs font-semibold bg-blue-500 rounded hover:bg-blue-600 transition-colors">
                        Action
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-400 text-sm">
                  No clients found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-80 h-80 absolute bottom-0 right-0 z-[-1]">
        <img
          src="/agent.svg"
          alt="Chart Placeholder"
          className="w-full h-full object-contain"
        />
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
