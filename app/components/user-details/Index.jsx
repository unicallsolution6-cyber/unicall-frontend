"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { UserCheck, ImageIcon, Loader, Trash2 } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Select } from "../ui/Select"
import Sidebar from "../sidebar"
import Header from "../header"
import { useLayoutData } from "@/app/LayoutWrapper"
import api from "@/lib/api"

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath // Already full URL
  if (imagePath.startsWith('/uploads')) {
    // Backend uploaded image - remove /api from the base URL since /uploads is served directly
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')
    return `${baseUrl}${imagePath}`
  }
  // Public folder image (like /user.png)
  return imagePath
}

export default function UserDetails() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('id')
  const { role: currentUserRole, user: currentUser } = useLayoutData()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    isActive: true,
    profileImage: null
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Determine if this is editing own profile or another user
  const isEditingOwnProfile = !userId || (currentUser && userId === currentUser._id)
  const isAdmin = currentUserRole === 'admin'

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" }
  ]

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" }
  ]

  // Fetch user details on component mount
  useEffect(() => {
    if (userId) {
      // Editing another user (admin functionality)
      fetchUserDetails()
    } else {
      // Editing own profile - fetch current user data from API
      fetchOwnProfile()
    }
  }, [userId])

  // Additional effect to handle profile image loading from context
  useEffect(() => {
    if (!imagePreview && user?.avatar) {
      setImagePreview(getImageUrl(user.avatar))
    }
  }, [user, imagePreview])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await api.users.getById(userId)
      
      if (response.success) {
        const userData = response.data.user
        setUser(userData)
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          password: "", // Don't populate password field
          role: userData.role || "user",
          phone: userData.phone || "",
          isActive: userData.isActive ?? true,
          profileImage: null
        })
        
        // Set image preview if user has profile image
        if (userData.avatar) {
          setImagePreview(getImageUrl(userData.avatar))
        }
      } else {
        setError("Failed to fetch user details")
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setError("Error fetching user details")
    } finally {
      setLoading(false)
    }
  }

  const fetchOwnProfile = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch current user's profile from API
      const response = await api.auth.getCurrentUser()
      
      if (response.success) {
        const userData = response.data.user || response.data
        setUser(userData)
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          password: "", // Don't populate password field
          role: userData.role || "user",
          phone: userData.phone || "",
          isActive: userData.isActive ?? true,
          profileImage: null
        })
        
        // Set image preview if user has profile image
        if (userData.avatar) {
          setImagePreview(getImageUrl(userData.avatar))
        }
      } else {
        // Fallback to context data if API fails
        if (currentUser) {
          setUser(currentUser)
          setFormData({
            name: currentUser.name || "",
            email: currentUser.email || "",
            password: "", 
            role: currentUser.role || "user",
            phone: currentUser.phone || "",
            isActive: currentUser.isActive ?? true,
            profileImage: null
          })
          
          // Set image preview if user has profile image
          if (currentUser.avatar) {
            setImagePreview(getImageUrl(currentUser.avatar))
          }
        } else {
          setError("Failed to fetch profile data")
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to context data if API fails
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          name: currentUser.name || "",
          email: currentUser.email || "",
          password: "", 
          role: currentUser.role || "user",
          phone: currentUser.phone || "",
          isActive: currentUser.isActive ?? true,
          profileImage: null
        })
        
        // Set image preview if user has profile image
        if (currentUser.avatar) {
          setImagePreview(getImageUrl(currentUser.avatar))
        }
      } else {
        setError("Error loading profile")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }))
    
    // If user has an existing profile image, show that, otherwise clear preview
    if (user?.avatar) {
      setImagePreview(getImageUrl(user.avatar))
    } else {
      setImagePreview(null)
    }
    
    // Reset file input
    const fileInput = document.getElementById('profileImage')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsEditing(true)
    setError("")
    setSuccess("")

    try {
      let response;
      
      if (isEditingOwnProfile) {
        // Use profile update API for own profile
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('phone', formData.phone)

        // Handle profile image
        if (formData.profileImage) {
          // New image selected
          formDataToSend.append('avatar', formData.profileImage)
        } else if (!imagePreview || imagePreview !== getImageUrl(user?.avatar)) {
          // Image was removed (no preview or preview doesn't match original)
          formDataToSend.append('removeImage', 'true')
        }

        response = await api.auth.updateProfile(formDataToSend)
      } else {
        // Use admin users API for editing other users
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name)
        formDataToSend.append('email', formData.email)
        formDataToSend.append('phone', formData.phone)

        // Include role and isActive for admin editing other users
        if (isAdmin) {
          formDataToSend.append('role', formData.role)
          formDataToSend.append('isActive', formData.isActive)
        }

        // Only include password if it's provided
        if (formData.password.trim()) {
          formDataToSend.append('password', formData.password)
        }

        // Handle profile image
        if (formData.profileImage) {
          // New image selected
          formDataToSend.append('avatar', formData.profileImage)
        } else if (!imagePreview || imagePreview !== getImageUrl(user?.avatar)) {
          // Image was removed (no preview or preview doesn't match original)
          formDataToSend.append('removeImage', 'true')
        }

        const targetUserId = userId
        response = await api.users.update(targetUserId, formDataToSend)
      }
      
      if (response.success) {
        setSuccess(isEditingOwnProfile ? "Profile updated successfully!" : "User updated successfully!")
        const updatedUser = response.data.user
        setUser(updatedUser)
        
        // Clear password field and uploaded file after successful update
        setFormData(prev => ({ ...prev, password: "", profileImage: null }))
        
        // Update image preview with the returned image URL from server
        if (updatedUser.avatar) {
          setImagePreview(getImageUrl(updatedUser.avatar))
        } else if (!formData.profileImage) {
          // If no image was uploaded and no existing image, clear preview
          setImagePreview(null)
        }
      } else {
        setError(response.message || (isEditingOwnProfile ? "Failed to update profile" : "Failed to update user"))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError(isEditingOwnProfile ? "Error updating profile" : "Error updating user")
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userId || isEditingOwnProfile) return
    
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${user?.name || user?.email}"? This action cannot be undone.`)
    if (!confirmDelete) return

    try {
      setIsDeleting(true)
      setError("")
      
      const response = await api.users.delete(userId)
      
      if (response.success) {
        setSuccess("User deleted successfully!")
        // Redirect to users list after a delay
        setTimeout(() => {
          router.push('/admin/unicall-users')
        }, 2000)
      } else {
        setError(response.message || "Failed to delete user")
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError("Error deleting user")
    } finally {
      setIsDeleting(false)
    }
  }

  // Only show error if we're in an invalid state after loading
  if (!loading && !user && !error) {
    return (
      <div className="min-h-screen bg-black flex z-10 overflow-hidden relative">
        <Sidebar activeTab="Unicall Users" />
        <div className="flex-1 flex flex-col">
          <Header title={isEditingOwnProfile ? "My Profile" : "User Details"} icon={UserCheck} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-xl mb-4">Unable to load user data</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex z-10 overflow-hidden relative">
        <Sidebar activeTab="Unicall Users" />
        <div className="flex-1 flex flex-col">
          <Header title={isEditingOwnProfile ? "My Profile" : "User Details"} icon={UserCheck} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-3 text-white">
              <Loader className="w-6 h-6 animate-spin" />
              <span>{isEditingOwnProfile ? "Loading profile..." : "Loading user details..."}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-black flex z-10 overflow-hidden relative">
      {/* Sidebar Component */}
      <Sidebar activeTab="Unicall Users" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header title={isEditingOwnProfile ? "My Profile" : "User Details"} icon={UserCheck} />

        {/* Main Content Area */}
        <div className="flex-1 p-10 px-12">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Personal Details Form */}
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white text-xl font-semibold">
                {isEditingOwnProfile ? "Personal details" : "User details"}
              </h2>
              {user && !isEditingOwnProfile && (
                <div className="text-sm text-gray-400">
                  User ID: {user._id}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Image Section */}
              <div className="flex items-start gap-6">
                <Label className="text-gray-300 text-sm block w-[20%] pt-2">
                  Profile Image
                </Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('profileImage').click()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {imagePreview && (
                        <Button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          {imagePreview === getImageUrl(user?.avatar) ? 'Remove Current Image' : 'Cancel Upload'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Supported formats: JPEG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <div className="flex items-center gap-6">
                <Label htmlFor="name" className="text-gray-300 text-sm block w-[20%]">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg w-full max-w-lg focus:ring-0 focus:outline-none"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="flex items-center gap-6">
                <Label htmlFor="email" className="text-gray-300 text-sm block w-[20%]">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg w-full max-w-lg focus:ring-0 focus:outline-none"
                  required
                />
              </div>

              {/* Password Field - Only show for admins editing other users */}
              {!isEditingOwnProfile && (
                <div className="flex items-center gap-6">
                  <Label htmlFor="password" className="text-gray-300 text-sm block w-[20%]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Leave empty to keep current password"
                    className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg w-full max-w-lg focus:ring-0 focus:outline-none"
                  />
                </div>
              )}

              {/* Role Field - Only show for admins editing other users */}
              {!isEditingOwnProfile && isAdmin && (
                <div className="flex items-center gap-6">
                  <Label htmlFor="role" className="text-gray-300 text-sm block w-[20%]">
                    Role *
                  </Label>
                  <div className="w-full max-w-lg">
                    <Select
                      options={roleOptions}
                      value={formData.role}
                      onChange={(value) => handleInputChange('role', value)}
                      placeholder="Select role"
                      variant="dark"
                      className="bg-gray-900 border-none h-12"
                    />
                  </div>
                </div>
              )}

              {/* Phone Number Field */}
              {/* <div className="flex items-center gap-6">
                <Label htmlFor="phone" className="text-gray-300 text-sm block w-[20%]">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-900 border-none text-white placeholder-gray-500 h-12 rounded-lg w-full max-w-lg focus:ring-0 focus:outline-none"
                />
              </div> */}

              {/* Status Field - Only show for admins editing other users */}
              {!isEditingOwnProfile && isAdmin && (
                <div className="flex items-center gap-6">
                  <Label htmlFor="status" className="text-gray-300 text-sm block w-[20%]">
                    Status *
                  </Label>
                  <div className="w-full max-w-lg">
                    <Select
                      options={statusOptions}
                      value={formData.isActive}
                      onChange={(value) => handleInputChange('isActive', value)}
                      placeholder="Select status"
                      variant="dark"
                      className="bg-gray-900 border-none h-12"
                    />
                  </div>
                </div>
              )}

              {/* User Info Display */}
              {user && (
                <div className="flex items-center gap-6">
                  <Label className="text-gray-300 text-sm block w-[20%]">
                    Created
                  </Label>
                  <div className="text-gray-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6 flex gap-4">
                <Button
                  type="submit"
                  disabled={isEditing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isEditing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{isEditingOwnProfile ? "Updating..." : "Updating..."}</span>
                    </>
                  ) : (
                    <span>{isEditingOwnProfile ? "Update Profile" : "Update User"}</span>
                  )}
                </Button>
                
                {/* Delete Button - Only show for admins editing other users */}
                {!isEditingOwnProfile && isAdmin && (
                  <Button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete User</span>
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-10 py-3 rounded-lg font-medium"
                >
                  Go Back
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="absolute top-[50%] left-[-70%] translate-y-[-50%] w-[1600px] h-[1200px] rounded-full opacity-60 z-[-1]" style={{ background: "radial-gradient(50% 50% at 50% 50%, #C45647 0%, rgba(210, 90, 99, 0.00) 100%)" }}></div>
    </div>
  )
}