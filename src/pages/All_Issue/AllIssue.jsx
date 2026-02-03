import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import {
    HiFilter,
    HiSearch,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineXCircle,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
    HiOutlineCalendar,
    HiOutlineDocumentText,
    HiOutlineArrowUp,
    HiOutlineLightningBolt,
    HiOutlineRefresh,
    HiOutlineExclamation,
    HiOutlineThumbUp,
    HiOutlineUser,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineChevronDoubleLeft,
    HiOutlineChevronDoubleRight
} from 'react-icons/hi';
import { AlertCircle } from 'lucide-react';

const AllIssue = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        priority: 'all',
        sort: 'newest'
    });
    const [upvoting, setUpvoting] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9); // Changed to 9 to fit 3 columns nicely

    // Fetch all issues (no user authentication required)
    const {
        data: allIssues = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => {
            const response = await axiosSecure.get('/allIssues');
            return response.data;
        }
    });

    // Fetch user data only if user is logged in
    const { data: singUser = {} } = useQuery({
        queryKey: ['userData', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const response = await axiosSecure.get(`/singleUser?email=${user?.email}`);
            return response.data;
        }
    });

    // Sort and filter issues
    const [filteredIssues, setFilteredIssues] = useState([]);

    // Paginated issues
    const [paginatedIssues, setPaginatedIssues] = useState([]);

    useEffect(() => {
        if (allIssues.length === 0) {
            setFilteredIssues([]);
            setPaginatedIssues([]);
            return;
        }

        let result = [...allIssues];

        // Sort boosted issues to top first
        result.sort((a, b) => {
            if (a.isBoosted && !b.isBoosted) return -1;
            if (!a.isBoosted && b.isBoosted) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Search filter
        if (searchTerm) {
            result = result.filter(issue =>
                issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filters.category !== 'all') {
            result = result.filter(issue => issue.category === filters.category);
        }

        // Status filter
        if (filters.status !== 'all') {
            result = result.filter(issue => issue.status === filters.status);
        }

        // Priority filter
        if (filters.priority !== 'all') {
            result = result.filter(issue => issue.priority === filters.priority);
        }

        // Additional sorting
        if (filters.sort === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filters.sort === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (filters.sort === 'upvotes') {
            result.sort((a, b) => (b.upVotes || 0) - (a.upVotes || 0));
        }

        setFilteredIssues(result);

        // Reset to first page when filters change
        setCurrentPage(1);
    }, [searchTerm, filters, allIssues]);

    // Calculate paginated issues whenever filteredIssues or pagination changes
    useEffect(() => {
        if (filteredIssues.length === 0) {
            setPaginatedIssues([]);
            return;
        }

        // Calculate start and end indices
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // Get paginated slice
        const paginated = filteredIssues.slice(startIndex, endIndex);
        setPaginatedIssues(paginated);
    }, [filteredIssues, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

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

    // Get status config
    const getStatusConfig = (status) => {
        const configs = {
            'Pending': {
                color: 'bg-linear-to-r from-orange-500 to-amber-500',
                icon: <HiOutlineClock className="w-4 h-4" />,
                text: 'Pending'
            },
            'In-Progress': {
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
        return configs[status] || configs.Pending;
    };

    // Get priority config
    const getPriorityConfig = (priority) => {
        const configs = {
            'High': {
                color: 'bg-linear-to-r from-orange-500 to-red-500',
                text: 'High',
                icon: <HiOutlineExclamationCircle className="w-4 h-4" />
            },
            'Normal': {
                color: 'bg-linear-to-r from-blue-500 to-blue-600',
                text: 'Normal',
                icon: <HiOutlineArrowUp className="w-4 h-4" />
            }
        };
        return configs[priority] || configs.Normal;
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
            'Electricity': '💡',
            'Road Maintenance': '🛣️',
            'Water Supply': '💧',
            'Sanitation': '🗑️',
            'Infrastructure': '🏗️',
            'Traffic Control': '🚦',
            'Drainage': '🌊',
            'Public Amenities': '🏛️',
            'other': '❓'
        };
        return icons[category] || '📋';
    };

    // Handle upvote
    const handleUpvote = async (issue) => {
        // Check if user is logged in
        if (!user) {
            toast.error('Please login to upvote issues');
            navigate('/login');
            return;
        }

        // Check if user is blocked to upvote  issue
        if (singUser?.isBlocked) {
            toast.error('Your account in blocked. You cannot upvote this issue.');
            return;
        }

        // Check if user is trying to upvote their own issue
        if (issue?.reportedByEmail === user.email) {
            toast.error('You cannot upvote your own issue');
            return;
        }

        // Check if already upvoted - ensure isUpvoted is an array
        const isUpvotedArray = Array.isArray(issue.isUpvoted) ? issue.isUpvoted : [];
        if (isUpvotedArray.includes(user.email)) {
            toast.error('You have already upvoted this issue');
            return;
        }

        setUpvoting(prev => ({ ...prev, [issue._id]: true }));

        try {
            // API call to upvote
            await axiosSecure.patch(`/upvoteIssue/${issue._id}`, {
                isUpvoted: [...isUpvotedArray, user.email],
                upVotes: (issue?.upVotes || 0) + 1,
            });

            refetch();
            toast.success('Issue upvoted successfully!');
        } catch (error) {
            toast.error('Failed to upvote. Please try again.');
            console.error('Upvote error:', error);
        } finally {
            setUpvoting(prev => ({ ...prev, [issue._id]: false }));
        }
    };

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            category: 'all',
            status: 'all',
            priority: 'all',
            sort: 'newest'
        });
        setCurrentPage(1);
    };

    // Get first image from array or default
    const getIssueImage = (issue) => {
        if (issue.images && issue.images.length > 0) {
            return issue.images[0];
        }

        // Default images based on category
        const defaultImages = {
            'Electricity': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Road Maintenance': 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Water Supply': 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Sanitation': 'https://images.unsplash.com/photo-1578558288136-7207e7747ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Infrastructure': 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Traffic Control': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Drainage': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'Public Amenities': 'https://images.unsplash.com/photo-1517799094725-e3453440724e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'default': 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        };

        return defaultImages[issue.category] || defaultImages.default;
    };

    // Get unique categories for filter dropdown
    const getUniqueCategories = () => {
        const categories = [...new Set(allIssues.map(issue => issue.category).filter(Boolean))];
        return categories;
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

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading all issues...</p>
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
                    {error?.message || 'An error occurred while loading issues.'}
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
                                All <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Reported Issues</span>
                            </h1>
                            <p className="text-gray-600">
                                Browse through all reported issues in the community. {user ? 'Upvote important issues and help prioritize community needs.' : 'Login to upvote and report issues.'}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard/reportIssue')}
                                    className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
                                >
                                    <HiOutlineLightningBolt className="w-5 h-5" />
                                    <span>Report New Issue</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
                                >
                                    <HiOutlineUser className="w-5 h-5" />
                                    <span>Login to Report Issue</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                            <div className="text-2xl font-bold text-blue-600">{allIssues.length}</div>
                            <div className="text-sm text-gray-600">Total Issues</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                            <div className="text-2xl font-bold text-orange-600">
                                {allIssues.filter(i => i.status === 'Pending').length}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                            <div className="text-2xl font-bold text-green-600">
                                {allIssues.filter(i => i.status === 'Resolved').length}
                            </div>
                            <div className="text-sm text-gray-600">Resolved</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                            <div className="text-2xl font-bold text-purple-600">
                                {allIssues.filter(i => i.isBoosted).length}
                            </div>
                            <div className="text-sm text-gray-600">Boosted</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                        {/* Search Bar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Issues
                            </label>
                            <div className="relative">
                                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, description, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="upvotes">Most Upvoted</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                            >
                                <option value="all">All Categories</option>
                                {getUniqueCategories().map(category => (
                                    <option key={category} value={category}>
                                        {getCategoryIcon(category)} {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">⏳ Pending</option>
                                <option value="In-Progress">🚧 In Progress</option>
                                <option value="Resolved">✅ Resolved</option>
                                <option value="Closed">🔒 Closed</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                            >
                                <option value="all">All Priorities</option>
                                <option value="High">🔴 High</option>
                                <option value="Normal">🟡 Normal</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors duration-300 border border-gray-300"
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || filters.category !== 'all' || filters.status !== 'all' || filters.priority !== 'all') && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {searchTerm && (
                                <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                    Search: "{searchTerm}"
                                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                            )}
                            {filters.category !== 'all' && (
                                <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                    Category: {filters.category}
                                    <button onClick={() => handleFilterChange('category', 'all')} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                            )}
                            {filters.status !== 'all' && (
                                <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                    Status: {filters.status}
                                    <button onClick={() => handleFilterChange('status', 'all')} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                            )}
                            {filters.priority !== 'all' && (
                                <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                                    Priority: {filters.priority}
                                    <button onClick={() => handleFilterChange('priority', 'all')} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count and Pagination Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <p className="text-gray-600">
                            Showing <span className="font-semibold">
                                {filteredIssues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                                {Math.min(currentPage * itemsPerPage, filteredIssues.length)}
                            </span> of{' '}
                            <span className="font-semibold">{filteredIssues.length}</span> issues
                            {searchTerm && ` matching "${searchTerm}"`}
                        </p>
                        <div className="text-sm text-gray-500 mt-1">
                            {filteredIssues.filter(issue => issue.isBoosted).length} boosted issues
                        </div>
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white text-sm"
                        >
                            <option value="6">6 per page</option>
                            <option value="9">9 per page</option>
                            <option value="12">12 per page</option>
                            <option value="15">15 per page</option>
                        </select>
                    </div>
                </div>

                {/* Issues Grid */}
                <AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedIssues.length > 0 ? (
                            paginatedIssues.map((issue, index) => {
                                const statusConfig = getStatusConfig(issue.status);
                                const priorityConfig = getPriorityConfig(issue.priority);
                                const isOwnIssue = user && issue.reportedByEmail === user?.email;
                                const isUpvotedArray = Array.isArray(issue.isUpvoted) ? issue.isUpvoted : [];
                                const hasUpvoted = user ? isUpvotedArray.includes(user?.email) : false;

                                return (
                                    <motion.div
                                        key={issue._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className={`relative hover:-translate-y-2 duration-300 ${issue.isBoosted ? 'ring-2 ring-yellow-400 ring-offset-2 rounded-2xl' : ''}`}
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

                                        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-500 h-full border border-gray-200 overflow-hidden">
                                            {/* Issue Image */}
                                            <div className="h-48 relative overflow-hidden">
                                                <img
                                                    src={getIssueImage(issue)}
                                                    alt={issue.title}
                                                    className="w-full h-full"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <span className={`${statusConfig.color} text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg`}>
                                                        {statusConfig.icon}
                                                        <span>{statusConfig.text}</span>
                                                    </span>
                                                </div>
                                                {/* Category Badge */}
                                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center">
                                                    <span className="text-lg mr-2">{getCategoryIcon(issue.category)}</span>
                                                    <span className="text-sm font-medium text-gray-800">{issue.category}</span>
                                                </div>
                                                <div className="absolute top-4 left-4">
                                                    <span className={`${priorityConfig.color} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg`}>
                                                        {priorityConfig.icon}
                                                        <span>{priorityConfig.text}</span>
                                                    </span>
                                                </div>
                                                {issue.images && issue.images.length > 0 && (
                                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1">
                                                        <HiOutlinePhotograph className="w-3 h-3" />
                                                        <span>{issue.images.length}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-6">
                                                {/* Category */}
                                                <div className="flex justify-between items-center gap-2 mb-3">
                                                    {/* Title */}
                                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                        {issue.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {issue?.description ? issue.description.slice(0, 45) : ""} ...
                                                </p>


                                                {/* Location */}
                                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                    <HiOutlineLocationMarker className="w-4 h-4" />
                                                    <span className="line-clamp-1">{issue.location}</span>
                                                </div>

                                                {/* Reporter Info */}
                                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                    <HiOutlineUser className="w-4 h-4" />
                                                    <span>Reported by: {issue?.reportedByName || 'Anonymous'}</span>
                                                </div>

                                                {/* Footer - Upvote and Actions */}
                                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                    {/* Upvote Button */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpvote(issue)}
                                                            data-tooltip-id={`upvote-tooltip-${issue._id}`}
                                                            data-tooltip-content={
                                                                singUser?.isBlocked ? "Account Blocked" : !user ? "Login to upvote" : isOwnIssue ? "Cannot upvote your own issue" : hasUpvoted ? "Already upvoted" : "Upvote this issue"
                                                            }
                                                            // disabled={upvoting[issue._id] || isOwnIssue || hasUpvoted || !user || singUser?.isBlocked}
                                                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${hasUpvoted
                                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                : user
                                                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
                                                                } ${!user ? 'cursor-pointer' : ''} ${isOwnIssue ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            {upvoting[issue._id] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                                                            ) : (
                                                                <HiOutlineThumbUp className="w-5 h-5" />
                                                            )}
                                                            <span className="font-medium">{issue.upVotes || 0} upvotes</span>
                                                        </button>
                                                        <Tooltip id={`upvote-tooltip-${issue._id}`} />
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
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                                        <HiOutlineDocumentText className="w-12 h-12 text-blue-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Issues Found</h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchTerm
                                            ? `No issues found matching "${searchTerm}". Try different search terms or clear filters.`
                                            : "No issues match the selected filters. Try clearing some filters."}
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </AnimatePresence>

                {/* Pagination */}
                {filteredIssues.length > 0 && totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
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
        </div>
    );
};

export default AllIssue;