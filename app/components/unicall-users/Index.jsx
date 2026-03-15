"use client"

import { useState, useEffect } from "react"
import { UserCheck, Plus, Loader, Mail, Phone, LogOut } from "lucide-react"
import { Button } from "../ui/Button"
import Sidebar from "../sidebar"
import Header from "../header"
import SubHeader from "../sub-header"
import Link from "next/link"
import { useLayoutData } from "@/app/LayoutWrapper"
import api from "@/lib/api"

export default function UnicallUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [logoutAllLoading, setLogoutAllLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedDateFilter, setSelectedDateFilter] = useState("this-month")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { role } = useLayoutData()

  // Fetch users from API
  useEffect(() => {
    console.log("useEffect triggered with dependencies:", {
      currentPage,
      searchQuery,
      selectedRole,
      selectedDateFilter
    })
    fetchUsers()
  }, [currentPage, searchQuery, selectedRole, selectedDateFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Build filters object
      const filters = {}
      if (searchQuery.trim()) filters.search = searchQuery.trim()
      if (selectedRole) filters.role = selectedRole
      if (selectedDateFilter) filters.dateFilter = selectedDateFilter

      console.log("Fetching users with filters:", filters)
      
      const response = await api.users.getAll(currentPage, 20, filters)
      console.log("Users fetched:", response.data)
      
      if (response.success) {
        setUsers(response.data.users || response.data || [])
        setTotalPages(Math.ceil((response.data.total || response.data.length || 0) / 20))
      } else {
        console.error('API returned error:', response.error)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const UserCard = ({ user }) => {
    const roleDisplay = user.role === 'admin' ? 'Administrator' : 'User'
    const statusColor = user.isActive ? 'text-green-600' : 'text-red-600'
    const statusText = user.isActive ? 'Active' : 'Inactive'

    return (
      <div className="bg-white rounded-lg shadow-sm flex flex-col items-center text-center overflow-hidden min-w-0 z-10">
        {/* Main Card Content */}
        <div className="p-4 flex flex-col items-center text-center w-full">
          {/* Profile Image */}
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-gray-200 flex-shrink-0">
            <img 
              src={user.avatar || "/user2.png"} 
              alt={user.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.src = "/user2.png"
              }}
            />
          </div>

          {/* User Info */}
          <h3 className="text-gray-800 font-semibold text-lg mb-1 truncate w-full">
            {user.name || 'Unknown User'}
          </h3>
          <p className="text-gray-500 text-sm mb-2 truncate w-full">
            {roleDisplay}
          </p>
          <div className="flex items-center justify-center mb-2">
            <Mail className="w-3 h-3 text-gray-400 mr-1" />
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-xs ${statusColor}`}>{statusText}</span>
          </div>

          {/* View Details Button */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
            onClick={() => window.location.href = `/admin/user-details?id=${user._id}`}
          >
            View Details
          </Button>
        </div>

        {/* Gradient Bottom Border */}
        <div className="w-full h-[6px] bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </div>
    )
  }

  const handleSearch = (query) => {
    console.log("Search query received:", query)
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (filter) => {
    console.log("Date filter changed to:", filter)
    setSelectedDateFilter(filter)
    setCurrentPage(1)
  }

  const handleRoleChange = (roleValue) => {
    console.log("Role filter changed to:", roleValue)
    setSelectedRole(roleValue)
    setCurrentPage(1)
  }

  const handleLogoutAllUsers = async () => {
    if (!confirm('Are you sure you want to logout all users? This will invalidate all active sessions except yours.')) {
      return
    }

    try {
      setLogoutAllLoading(true)
      const response = await api.users.logoutAll()
      
      if (response.success) {
        alert(`Successfully logged out ${response.data.loggedOutCount} users at ${new Date(response.data.timestamp).toLocaleString()}`)
      }
    } catch (error) {
      console.error('Error logging out all users:', error)
      alert('Failed to logout all users. Please try again.')
    } finally {
      setLogoutAllLoading(false)
    }
  }

  // Transform role options for dropdown
  const roleDropdownOptions = [
    { value: "", label: "All Roles" },
    { value: "admin", label: "Administrators" },
    { value: "user", label: "Users" }
  ]

  return (
    <div className="min-h-screen bg-black flex relative z-10 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar activeTab="Unicall Users" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header title="Unicall Users" icon={UserCheck} />

        {/* Sub Header Component */}
        {role === "admin" ? (
          <SubHeader
            searchPlaceholder="Search users..."
            filterOptions={[
              { value: "today", label: "Today" },
              { value: "this-week", label: "This Week" },
              { value: "this-month", label: "This Month" },
              { value: "last-month", label: "Last Month" },
              { value: "this-year", label: "This Year" },
              { value: "all-time", label: "All Time" },
            ]}
            showUserDropdown={true}
            userDropdownOptions={roleDropdownOptions}
            defaultUser={selectedRole}
            defaultFilter={selectedDateFilter}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onUserChange={handleRoleChange}
          />
        ) : (
          <SubHeader
            searchPlaceholder="Search users..."
            filterOptions={[
              { value: "today", label: "Today" },
              { value: "this-week", label: "This Week" },
              { value: "this-month", label: "This Month" },
              { value: "last-month", label: "Last Month" },
              { value: "this-year", label: "This Year" },
              { value: "all-time", label: "All Time" },
            ]}
            defaultFilter={selectedDateFilter}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-6 px-10">
          {/* Admin Action Buttons */}
          {role === 'admin' && (
            <div className="flex justify-end gap-4 mb-8 -mt-10">
              <Button 
                onClick={handleLogoutAllUsers}
                disabled={logoutAllLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logoutAllLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{logoutAllLoading ? 'Logging Out...' : 'Logout All Users'}</span>
              </Button>
              <Link href={"/admin/add-user"}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Add New User</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Users Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3 text-white">
                <Loader className="w-6 h-6 animate-spin" />
                <span>Loading users...</span>
              </div>
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard key={user._id || user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No Users Found</h3>
              <p className="text-gray-400 mb-4">There are no users to display.</p>
              {role === 'admin' && (
                <Link href={"/admin/user-details"}>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg">
                    Add First User
                  </Button>
                </Link>
              )}
            </div>
          )}
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

      <div className="absolute top-[50%] left-[-70%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60 z-[-1]" style={{ background: "radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)" }}></div>
    </div>
  )
}
