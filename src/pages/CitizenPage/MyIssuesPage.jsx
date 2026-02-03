import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import {
  HiFilter,
  HiSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineFire,
  HiOutlinePhotograph,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineLightningBolt,
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineBookmark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight
} from 'react-icons/hi';
import { AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';


const MyIssuesPage = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });

  const [editingIssue, setEditingIssue] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Normal',
    location: '',
    images: []
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Changed to 9 to fit 3 columns nicely

  const {
    data = {},
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userData', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      // Execute both requests in parallel
      const [issuesRes, userRes] = await Promise.all([
        axiosSecure.get(`/myIssues?email=${user?.email}`),
        axiosSecure.get(`/singleUser?email=${user?.email}`)
      ]);

      return {
        issues: issuesRes.data,
        users: userRes.data
      };
    }
  });

  const { issues = [], users: singUser = {} } = data;

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/myIssueUpdate/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myIssues', user?.email]);
      setShowEditModal(false);
      setEditingIssue(null);
    }
  });

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/myIssueDelete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myIssues', user?.email]);
    }
  });

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (filters.status !== 'all' && issue.status !== filters.status) return false;
    if (filters.category !== 'all' && issue.category !== filters.category) return false;
    if (filters.priority !== 'all' && issue.priority !== filters.priority) return false;
    if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  // Calculate paginated issues
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        startPage = 2;
        endPage = 4;
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      pageNumbers.push(1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Get status config
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': {
        color: 'bg-linear-to-r from-orange-500 to-amber-500',
        icon: <HiOutlineClock className="w-4 h-4" />,
        text: 'Pending'
      },
      'In-progress': {
        color: 'bg-linear-to-r from-blue-500 to-cyan-500',
        icon: <HiOutlineClock className="w-4 h-4" />,
        text: 'In Progress'
      },
      'Resolved': {
        color: 'bg-linear-to-r from-green-500 to-emerald-500',
        icon: <HiOutlineCheckCircle className="w-4 h-4" />,
        text: 'Resolved'
      },
      'Closed': {
        color: 'bg-linear-to-r from-gray-500 to-gray-600',
        icon: <HiOutlineXCircle className="w-4 h-4" />,
        text: 'Closed'
      }
    };
    return configs[status] || configs.pending;
  };

  // Get priority config
  const getPriorityConfig = (priority) => {
    const configs = {
      'high': {
        color: 'bg-linear-to-r from-orange-500 to-red-500',
        text: 'High',
        icon: <HiOutlineExclamationCircle className="w-4 h-4" />
      },
      'normal': {
        color: 'bg-linear-to-r from-blue-500 to-blue-600',
        text: 'Normal',
        icon: <HiOutlineBookmark className="w-4 h-4" />
      }
    };
    return configs[priority] || configs.normal;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'streetlight': '💡',
      'water': '💧',
      'road_damage': '🛣️',
      'garbage': '🗑️',
      'footpath': '🚶',
      'drainage': '🌊',
      'traffic': '🚦',
      'parks': '🌳',
      'public_toilet': '🚻',
      'noise': '🔇',
      'other': '❓'
    };
    return icons[category] || '📋';
  };

  // Handle edit
  const handleEdit = (issue) => {
    // console.log("Issue", issue);

    // Check if user is blocked 
    if (singUser?.isBlocked) {
      toast.error('Your account is blocked. You cannot edit this issue.');
      return;
    }

    if (issue.status === 'Pending') {
      setEditingIssue(issue);
      setFormData({
        title: issue.title,
        description: issue.description,
        category: issue.category,
        priority: issue.priority,
        location: issue.location,
        images: issue.images || []
      });
      setShowEditModal(true);
    }
  };

  // Handle delete with SweetAlert2
  const handleDelete = (issueId) => {

    // Check if user is blocked 
    if (singUser?.isBlocked) {
      toast.error('Your account is blocked. You cannot delete this issue.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal2-confirm-btn',
        cancelButton: 'swal2-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteIssueMutation.mutate(issueId, {
          onSuccess: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The issue has been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              toast: true,
              position: 'center'
            });
          },
          onError: (error) => {
            Swal.fire({
              title: 'Error!',
              text: error.message || 'Failed to delete the issue.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  };


  // Handle form submit with SweetAlert2
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingIssue) {
      try {
        // Show loading indicator
        Swal.fire({
          title: 'Updating Issue...',
          text: 'Please wait while we update the issue.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Execute the mutation
        await updateIssueMutation.mutateAsync({
          id: editingIssue._id,
          data: formData
        });

        // Close loading and show success
        Swal.fire({
          title: 'Success!',
          text: 'Issue updated successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        });

      } catch (error) {
        // Close loading and show error
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to update the issue. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Try Again'
        });
      }
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Get first image from array or default
  const getIssueImage = (issue) => {
    // console.log("Issue", issue);
    if (issue.images && issue.images.length > 0) {
      return issue.images[0];
    }

    // Default images based on category
    const defaultImages = {
      'Electricity': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Water Supply': 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Road Maintenance': 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Sanitation': 'https://images.unsplash.com/photo-1578558288136-7207e7747ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'Infrastructure': 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'default': 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    };

    return defaultImages[issue.category] || defaultImages.default;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading your issues...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load issues</h3>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {error?.message || 'An error occurred while loading your issues.'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 lg:p-8">

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Blocked User Warning */}
      {singUser?.isBlocked && (
        <div className="mb-6">
          <div className="alert alert-error shadow-lg">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Account Blocked</h3>
              <div className="text-xs">
                Your account has been temporarily blocked by the administration.
                Please contact the authorities at{' '}
                <a href="tel:+8809609333222" className="font-semibold underline">
                  +880 9609 333222
                </a>{' '}
                or email{' '}
                <a href="mailto:support@infra.gov" className="font-semibold underline">
                  support@infra.gov
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                My Reported Issues
              </h1>
              <p className="text-gray-600">
                Track and manage all issues you've reported to the community
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard/reportIssue')}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
              >
                <HiOutlineLightningBolt className="w-5 h-5" />
                <span>Report New Issue</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{issues.length}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">
                {issues.filter(i => i.status === 'Pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {issues.filter(i => i.status === 'Resolved').length}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {issues.filter(i => i.isBoosted).length}
              </div>
              <div className="text-sm text-gray-600">Boosted</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your issues..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <HiFilter className="w-5 h-5 text-gray-500" />
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1); // Reset to first page when filtering
                }}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => {
                setFilters({ ...filters, priority: e.target.value });
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden md:inline">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm"
              >
                <option value="6">6 per page</option>
                <option value="9">9 per page</option>
                <option value="12">12 per page</option>
                <option value="15">15 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-semibold">
                {filteredIssues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredIssues.length)}
              </span> of{' '}
              <span className="font-semibold">{filteredIssues.length}</span> issues
              {filters.search && ` matching "${filters.search}"`}
            </p>
            <div className="text-sm text-gray-500 mt-1">
              {filteredIssues.filter(issue => issue.isBoosted).length} boosted issues
            </div>
          </div>

          {/* Page info for mobile */}
          <div className="md:hidden text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Issues Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedIssues.map((issue, index) => {
              const statusConfig = getStatusConfig(issue.status);
              const priorityConfig = getPriorityConfig(issue.priority);

              return (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative hover:-translate-y-2 duration-300 shadow-2xl rounded-lg ${issue.isBoosted ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                >
                  {/* Boosted Badge */}
                  {issue.isBoosted && (
                    <div className="absolute -top-3 left-4 z-10">
                      <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <HiOutlineLightningBolt className="w-3 h-3" />
                        Boosted
                      </div>
                    </div>
                  )}

                  {/* Issue Image */}
                  <div className="relative h-48 overflow-hidden rounded-lg">
                    <img
                      src={getIssueImage(issue)}
                      alt={issue.title}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 ${statusConfig.color} text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg`}>
                      {statusConfig.icon}
                      <span>{statusConfig.text}</span>
                    </div>

                    {/* Priority Badge */}
                    <div className={`absolute top-4 left-4 ${priorityConfig.color} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg`}>
                      {priorityConfig.icon}
                      <span>{priorityConfig.text}</span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center">
                      <span className="text-lg mr-2">{getCategoryIcon(issue.category)}</span>
                      <span className="text-sm font-medium text-gray-800">{issue.category}</span>
                    </div>

                    {/* Image Count */}
                    {issue.images && issue.images.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1">
                        <HiOutlinePhotograph className="w-3 h-3" />
                        <span>{issue.images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Issue Content */}
                  <div className="p-5">
                    {/* Title & Category */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {issue.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {issue.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700 text-sm">
                        <HiOutlineLocationMarker className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="truncate">{issue.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700 text-sm">
                          <HiOutlineCalendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <HiOutlineBookmark className="w-4 h-4 mr-1" />
                          <span>{issue.upVotes || 0} votes</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {/* Edit Button (only for pending issues) */}
                        {issue.status === 'Pending' && (
                          <button
                            onClick={() => handleEdit(issue)}
                            // disabled={updateIssueMutation.isLoading || singUser?.isBlocked}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-300 group/edit disabled:opacity-50 disabled:cursor-not-allowed"
                            title={singUser?.isBlocked ? "Account Blocked" : "Edit Issue"}
                          >
                            <HiOutlinePencilAlt className="w-5 h-5 group-hover/edit:scale-110 transition-transform" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(issue._id)}
                          // disabled={deleteIssueMutation.isLoading || singUser?.isBlocked}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-300 group/delete disabled:opacity-50 disabled:cursor-not-allowed"
                          title={singUser?.isBlocked ? "Account Blocked" : "Delete Issue"}
                        >
                          <HiOutlineTrash className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                        className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        <span className="font-medium">View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
              <HiOutlineDocumentText className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {issues.length === 0 ? 'No Issues Reported' : 'No Issues Match Filters'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {issues.length === 0
                ? 'Start by reporting your first community issue to help improve your neighborhood.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {issues.length === 0 && (
              <button
                onClick={() => navigate('/dashboard/reportIssue')}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Report Your First Issue
              </button>
            )}
          </div>
        )}

        {/* Pagination - Only show if there are multiple pages */}
        {filteredIssues.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 hidden md:block">
              Page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* First Page Button */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  } transition-colors duration-200`}
                title="First Page"
              >
                <HiOutlineChevronDoubleLeft className="w-5 h-5" />
              </button>

              {/* Previous Page Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  } transition-colors duration-200`}
                title="Previous Page"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {generatePageNumbers().map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1.5 min-w-[40px] rounded-lg font-medium transition-all duration-200 ${currentPage === pageNum
                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>

              {/* Next Page Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  } transition-colors duration-200`}
                title="Next Page"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  } transition-colors duration-200`}
                title="Last Page"
              >
                <HiOutlineChevronDoubleRight className="w-5 h-5" />
              </button>
            </div>

            {/* Items per page selector for mobile */}
            <div className="sm:hidden flex items-center gap-2 w-full justify-center">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm"
              >
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Issue</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={updateIssueMutation.isLoading}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <HiOutlineXCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={updateIssueMutation.isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      disabled={updateIssueMutation.isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={updateIssueMutation.isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50"
                      >
                        <option value="">Select Category</option>
                        <option value="road_damage">Road Damage (Potholes)</option>
                        <option value="streetlight">Broken Streetlight</option>
                        <option value="water">Water Leakage</option>
                        <option value="garbage">Garbage Overflow</option>
                        <option value="footpath">Damaged Footpath</option>
                        <option value="drainage">Blocked Drainage</option>
                        <option value="traffic">Traffic Signal Issue</option>
                        <option value="parks">Park Maintenance</option>
                        <option value="public_toilet">Public Toilet Issue</option>
                        <option value="noise">Noise Pollution</option>
                        <option value="other">Other Issue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={updateIssueMutation.isLoading}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={updateIssueMutation.isLoading}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateIssueMutation.isLoading}
                    className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateIssueMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Issue</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyIssuesPage;