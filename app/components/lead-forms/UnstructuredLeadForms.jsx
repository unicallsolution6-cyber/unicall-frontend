import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLayoutData } from '@/app/LayoutWrapper';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function UnstructuredLeadForms({
  searchQuery,
  selectedUser,
  selectedDateFilter,
  userFilter,
  loading,
  setLoading,
}) {
  const { role } = useLayoutData();
  const { user } = useAuth();
  const [leadForms, setLeadForms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeadForms = async () => {
    try {
      setLoading(true);
      const filters = { type: 'row' };

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

      console.log(response);

      if (response.success) {
        setLeadForms(response.data.unstructuredForms);
        setTotalPages(Math.ceil(response.data.total / 20));
      }
    } catch (error) {
      console.error('Error fetching unstructured lead forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadForms();
  }, [currentPage, searchQuery, selectedUser, selectedDateFilter, userFilter]);

  const handleViewDetails = async (leadForm) => {
    try {
      if (role === 'user') {
        const response = await api.leadForms.updateUnstructured(leadForm._id, {
          assignee: user._id,
          status: 'active',
        });

        if (response.success) {
          await fetchLeadForms();
          console.log('Successfully assigned unstructured lead to yourself');
        }
      }
      console.log('View details for unstructured:', leadForm._id);
    } catch (error) {
      console.error('Error assigning unstructured lead:', error);
    }
  };

  const handleDialingStatusChange = async (leadFormId, newStatus) => {
    try {
      const response = await api.leadForms.updateUnstructured(leadFormId, {
        dialingStatus: newStatus,
      });

      if (response.success) {
        setLeadForms((prevForms) =>
          prevForms.map((form) =>
            form._id === leadFormId
              ? { ...form, dialingStatus: newStatus }
              : form
          )
        );
      } else {
        console.error('Failed to update dialing status:', response.message);
      }
    } catch (error) {
      console.error('Error updating dialing status:', error);
    }
  };

  console.log(leadForms);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-3 text-white">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading unstructured lead forms...</span>
          </div>
        </div>
      ) : (
        <div className="bg-transparent rounded-lg flex flex-col flex-1 h-[calc(100vh-20rem)]">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs xl:text-sm font-semibold min-w-[600px] rounded-lg shadow-lg overflow-hidden">
            <div className="border-r border-white/20 md:pr-4">Raw Data</div>
            <div className="border-r border-white/20 md:pr-4">
              Dialing Status
            </div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="space-y-3 py-3 flex-1 min-h-0 overflow-y-auto">
            {leadForms.length > 0 ? (
              leadForms.map((leadForm) => {
                const canSee =
                  role === 'admin' || user?._id === leadForm?.assignee?._id;

                return (
                  <div
                    key={leadForm._id}
                    className="grid grid-cols-3 gap-4 p-4 text-gray-300 text-xs xl:text-sm hover:bg-gray-800/50 transition-colors 
                              bg-[#252731] rounded-lg items-center"
                  >
                    <div className="border-r border-white/10 pr-4 break-all">
                      {JSON.stringify(leadForm.rawData?.line, null, 2)}
                    </div>

                    <div className="border-r border-white/10 pr-4">
                      <select
                        value={leadForm.dialingStatus || 'not_dialed'}
                        onChange={(e) =>
                          handleDialingStatusChange(
                            leadForm._id,
                            e.target.value
                          )
                        }
                        disabled={!canSee}
                        className={`text-xs rounded px-2 py-1 w-full ${
                          leadForm.dialingStatus === 'dialed'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        } border`}
                      >
                        <option value="not_dialed">Not Dialed</option>
                        <option value="dialed">Dialed</option>
                      </select>
                    </div>

                    <div className="flex justify-center items-center">
                      <Button
                        onClick={() => {
                          handleViewDetails(leadForm);
                          console.log('Action for unstructured:', leadForm._id);
                        }}
                        disabled={
                          user?._id === leadForm?.assignee?._id ||
                          role === 'admin'
                        }
                        className="text-white text-xs px-3 py-1 bg-gradient-to-r from-[#9C3FE4] to-[#C65647] hover:from-[#8B36D0] hover:to-[#B54A3A] transition-all"
                      >
                        Assign & View
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400">
                No unstructured lead forms found
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
