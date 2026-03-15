'use client';

import { useState, useEffect, useContext } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Users,
  DollarSign,
  Clock,
  UserX,
} from 'lucide-react';
import Sidebar from '../sidebar';
import Header from '../header';
import SubHeader from '../sub-header';
import { useLayoutData } from '@/app/LayoutWrapper';
import api from '@/lib/api';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNote } from '@/contexts/NoteContext';

export default function Dashboard() {
  const { note, setNote } = useNote();
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Clients',
      value: '0',
      change: '+0.00%',
      positive: true,
      icon: Users,
    },
    {
      title: 'Paid Wire Transfer',
      value: '0',
      change: '+0.00%',
      positive: true,
      icon: DollarSign,
    },
    {
      title: 'Pending',
      value: '0',
      change: '+0.00%',
      positive: true,
      icon: Clock,
    },
    {
      title: 'Followup',
      value: '0',
      change: '+0.00%',
      positive: true,
      icon: RotateCcw,
    },
    {
      title: 'Deactivated',
      value: '0',
      change: '+0.00%',
      positive: false,
      icon: UserX,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [selectedDateFilter, setSelectedDateFilter] = useState('this-month');
  const { role } = useLayoutData();

  // Fetch dashboard metrics
  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedDateFilter]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedDateFilter) filters.dateFilter = selectedDateFilter;

      console.log('Fetching dashboard metrics with filters:', filters);
      const response = await api.clients.getDashboardMetrics(filters);
      console.log('Dashboard metrics fetched:', response.data);

      if (response.success) {
        const data = response.data;
        setMetrics([
          {
            title: 'Total Clients',
            value: data.totalClients?.toString() || '0',
            change: data.totalClientsChange || '+0.00%',
            positive: true,
            icon: Users,
          },
          {
            title: 'Paid Wire Transfer',
            value: data.paidWire?.toString() || '0',
            change: data.paidWireChange || '+0.00%',
            positive: true,
            icon: DollarSign,
          },
          {
            title: 'Pending',
            value: data.pending?.toString() || '0',
            change: data.pendingChange || '+0.00%',
            positive: true,
            icon: Clock,
          },
          {
            title: 'Followup',
            value: data.followup?.toString() || '0',
            change: data.followupChange || '+0.00%',
            positive: true,
            icon: RotateCcw,
          },
          {
            title: 'Deactivated',
            value: data.deactivated?.toString() || '0',
            change: data.deactivatedChange || '+0.00%',
            positive: false,
            icon: UserX,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedDateFilter(filter);
  };

  return (
    <div className="bg-black flex relative z-10 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <SubHeader
          welcomeMessage="Welcome to the Dashboard"
          onFilterChange={handleFilterChange}
          filterOptions={[
            { value: 'today', label: 'Today' },
            { value: 'this-week', label: 'This Week' },
            { value: 'this-month', label: 'This Month' },
            { value: 'last-month', label: 'Last Month' },
            { value: 'this-year', label: 'This Year' },
            { value: 'all-time', label: 'All Time' },
          ]}
          defaultFilter={selectedDateFilter}
        />

        <div className="px-10 pb-6 min-h-[80vh] flex flex-col">
          {/* Metrics */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading dashboard metrics...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-300 text-sm font-medium">
                      {metric.title}
                    </h3>
                    <metric.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-white text-2xl font-bold">
                      {metric.value}
                    </div>
                    <div
                      className={`flex items-center space-x-1 text-sm ${
                        metric.positive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {metric.positive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{metric.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Note Editor */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 mt-[auto]">
            <h2 className="text-white text-lg mb-2">Quick Note</h2>
            <ReactQuill
              theme="snow"
              value={note}
              onChange={setNote}
              className="bg-black rounded-lg"
              placeholder="Write a note..."
            />
          </div>
        </div>
      </div>

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
