"use client"

import { useState, useEffect } from "react"
import { FileText, Upload, Plus, X, Calendar, User, Building, Phone, Mail, Save, ArrowLeft, Loader } from "lucide-react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Select } from "../ui/Select"
import Sidebar from "../sidebar"
import Header from "../header"
import SubHeader from "../sub-header"
import api from "@/lib/api"

export default function AddLeadFile() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bank: "",
    category: "",
    priority: "",
    assignee: "",
    dueDate: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    company: "",
  })

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const banks = [
    { value: "citi", label: "Citi Bank", icon: null },
    { value: "boa", label: "Bank Of America", icon: null },
    { value: "chase", label: "Chase Bank", icon: null },
    { value: "wells", label: "Wells Fargo Bank", icon: null },
    { value: "mixed", label: "Mixed Banks", icon: null },
  ]

  const categories = [
    { value: "sales", label: "Sales" },
  ]

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        // Fetch more users for the dropdown (or all users by setting a high limit)
        const response = await api.users.getAll(1, 100) // Fetch up to 100 users
        if (response.success && response.data.users) {
          // Filter to only include users with role 'user' (not admin)
          const userOptions = response.data.users
            .filter(user => user.role === 'user') // Only include users, not admins
            .map(user => ({
              value: user._id,
              label: user.name
            }))
          setUsers(userOptions)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (files) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported file type`)
        return false
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is larger than 5MB`)
        return false
      }
      return true
    })

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add basic form fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('bank', formData.bank)
      formDataToSend.append('category', formData.category)
      
      if (formData.priority) formDataToSend.append('priority', formData.priority)
      if (formData.assignee) formDataToSend.append('assignee', formData.assignee)
      if (formData.dueDate) formDataToSend.append('dueDate', formData.dueDate)
      
      // Add client information if provided
      if (formData.clientName || formData.clientEmail || formData.clientPhone || formData.company) {
        const clientInfo = {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          company: formData.company
        }
        formDataToSend.append('clientInfo', JSON.stringify(clientInfo))
      }

      // Add uploaded files
      uploadedFiles.forEach((fileData) => {
        formDataToSend.append('files', fileData.file)
      })

      // Submit to API
      const response = await api.leadForms.create(formDataToSend)
      
      if (response.success) {
        // Success - redirect to lead forms page
        window.location.href = '/admin/lead-forms'
      } else {
        setSubmitError(response.error || 'Failed to create lead form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('An error occurred while creating the lead form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = (query) => {
    console.log("Search query:", query)
  }

  const handleFilterChange = (filter) => {
    console.log("Filter changed:", filter)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-black flex relative !z-10 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar activeTab="Leads Forms" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Component */}
        <Header title="Add Lead File" icon={FileText} />

        {/* Sub Header Component */}
        {/* <SubHeader
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        /> */}

        {/* Main Add Lead File Content */}
        <div className="px-8 pb-6 flex-1 z-20 mt-12">
          {submitError && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{submitError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">Lead Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter lead title"
                        className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter lead description"
                        className="flex w-full rounded-md border border-white/20 bg-black/30 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bank" className="text-gray-300">Bank *</Label>
                        <Select
                          options={banks}
                          value={formData.bank}
                          onChange={(value) => handleInputChange('bank', value)}
                          placeholder="Select bank"
                          variant="dark"
                          className="bg-black/30 border-white/20"
                          zIndex={30}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-gray-300">Category *</Label>
                        <Select
                          options={categories}
                          value={formData.category}
                          onChange={(value) => handleInputChange('category', value)}
                          placeholder="Select category"
                          variant="dark"
                          className="bg-black/30 border-white/20"
                          zIndex={20}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* <div>
                        <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                        <Select
                          options={priorities}
                          value={formData.priority}
                          onChange={(value) => handleInputChange('priority', value)}
                          placeholder="Select priority"
                          variant="dark"
                          className="bg-black/30 border-white/20"
                        />
                      </div> */}

                      <div>
                        <Label htmlFor="assignee" className="text-gray-300">Assignee</Label>
                        <Select
                          options={users}
                          value={formData.assignee}
                          onChange={(value) => handleInputChange('assignee', value)}
                          placeholder={loadingUsers ? "Loading users..." : "Select assignee"}
                          variant="dark"
                          className="bg-black/30 border-white/20"
                          disabled={loadingUsers}
                          zIndex={10}
                        />
                      </div>
                    </div>

                    {/* <div>
                      <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className="bg-black/30 border-white/20 text-white focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                      />
                    </div> */}
                  </div>
                </div>

                {/* Client Information */}
                {/* <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Client Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName" className="text-gray-300">Client Name</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        placeholder="Enter client name"
                        className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company" className="text-gray-300">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Enter company name"
                        className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientEmail" className="text-gray-300">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                          placeholder="Enter email address"
                          className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                        />
                      </div>

                      <div>
                        <Label htmlFor="clientPhone" className="text-gray-300">Phone</Label>
                        <Input
                          id="clientPhone"
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                          placeholder="Enter phone number"
                          className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 focus-visible:ring-offset-black"
                        />
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Right Column - File Upload */}
              <div className="space-y-6">
                {/* File Upload Section */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Documents
                  </h3>

                  {/* Drag and Drop Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">
                      Drag and drop files here, or{' '}
                      <label className="text-purple-400 hover:text-purple-300 cursor-pointer font-medium">
                        browse
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-400">
                      Support for PDF, DOC, DOCX, TXT, JPG, PNG files
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">
                        Uploaded Files ({uploadedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-200">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  
                  <div className="border border-white/20 rounded-lg p-4 bg-black/30 backdrop-blur-sm">
                    <h4 className="font-semibold text-white mb-2 text-sm">
                      {formData.title || "Lead Title"}
                    </h4>
                    <p className="text-gray-300 text-xs mb-4">
                      {formData.description || "Lead description will appear here"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formData.category === 'sales' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {formData.category || "Category"}
                      </span>
                      <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{uploadedFiles.length}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            {formData.assignee 
                              ? users.find(user => user.value === formData.assignee)?.label || "Unknown User"
                              : "Unassigned"
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formData.dueDate || "No due date"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-2"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !formData.title || !formData.bank || !formData.category}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Lead File</span>
                  </>
                )}
              </Button>
            </div>
          </form>
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
