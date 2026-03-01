import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import {
    HiSearch,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePhotograph,
    HiOutlineLocationMarker,
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
    HiOutlineChevronDoubleRight,
    HiOutlineCog,
    HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { AlertCircle } from 'lucide-react';
import AllIssuesSkeleton from '../../Components/AllIssuesSkeleton';

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const { data: allIssues = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => {
            const response = await axiosSecure.get('/allIssues');
            return response.data;
        }
    });

    const { data: singUser = {} } = useQuery({
        queryKey: ['userData', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const response = await axiosSecure.get(`/singleUser?email=${user?.email}`);
            return response.data;
        }
    });

    const [filteredIssues, setFilteredIssues] = useState([]);
    const [paginatedIssues, setPaginatedIssues] = useState([]);

    useEffect(() => {
        if (allIssues.length === 0) { setFilteredIssues([]); setPaginatedIssues([]); return; }
        let result = [...allIssues];
        result.sort((a, b) => {
            if (a.isBoosted && !b.isBoosted) return -1;
            if (!a.isBoosted && b.isBoosted) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        if (searchTerm) result = result.filter(issue =>
            issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filters.category !== 'all') result = result.filter(i => i.category === filters.category);
        if (filters.status !== 'all') result = result.filter(i => i.status === filters.status);
        if (filters.priority !== 'all') result = result.filter(i => i.priority === filters.priority);
        if (filters.sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (filters.sort === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (filters.sort === 'upvotes') result.sort((a, b) => (b.upVotes || 0) - (a.upVotes || 0));
        setFilteredIssues(result);
        setCurrentPage(1);
    }, [searchTerm, filters, allIssues]);

    useEffect(() => {
        if (filteredIssues.length === 0) { setPaginatedIssues([]); return; }
        const start = (currentPage - 1) * itemsPerPage;
        setPaginatedIssues(filteredIssues.slice(start, start + itemsPerPage));
    }, [filteredIssues, currentPage]);

    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'Pending': { color: 'bg-linear-to-r from-orange-500 to-amber-500', icon: <HiOutlineClock className="w-3.5 h-3.5" />, text: 'Pending' },
            'In-Progress': { color: 'bg-linear-to-r from-blue-500 to-cyan-500', icon: <HiOutlineClock className="w-3.5 h-3.5" />, text: 'In-Progress' },
            'Working': { color: 'bg-linear-to-r from-purple-500 to-indigo-500', icon: <HiOutlineCog className="w-3.5 h-3.5" />, text: 'Working' },
            'Resolved': { color: 'bg-linear-to-r from-green-500 to-emerald-500', icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" />, text: 'Resolved' },
            'Closed': { color: 'bg-linear-to-r from-gray-500 to-gray-600', icon: <HiOutlineXCircle className="w-3.5 h-3.5" />, text: 'Closed' },
            'Rejected': { color: 'bg-linear-to-r from-red-500 to-pink-500', icon: <HiOutlineXCircle className="w-3.5 h-3.5" />, text: 'Rejected' },
        };
        return configs[status] || configs.Pending;
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            'High': { color: 'bg-linear-to-r from-orange-500 to-red-500', text: 'High', icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> },
            'Normal': { color: 'bg-linear-to-r from-blue-500 to-blue-600', text: 'Normal', icon: <HiOutlineArrowUp className="w-3.5 h-3.5" /> },
        };
        return configs[priority] || configs.Normal;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Streetlight': '💡', 'Road_Damage': '🛣️', 'Garbage': '🗑️',
            'Footpath': '🚶', 'Drainage': '🌊', 'Traffic': '🚦',
            'Parks': '🌳', 'Public_Toilet': '🚻', 'Noise': '🔇',
            'Electricity': '💡', 'Water_Supply': '💧', 'Sanitation': '🗑️',
            'Infrastructure': '🏗️', 'Other': '❓'
        };
        return icons[category] || '📋';
    };

    const handleUpvote = async (issue) => {
        if (!user) { toast.error('Please login to upvote issues'); navigate('/login'); return; }
        if (singUser?.isBlocked) { toast.error('Your account is blocked.'); return; }
        if (issue?.reportedByEmail === user.email) { toast.error('You cannot upvote your own issue'); return; }
        const isUpvotedArray = Array.isArray(issue.isUpvoted) ? issue.isUpvoted : [];
        if (isUpvotedArray.includes(user.email)) { toast.error('Already upvoted'); return; }
        setUpvoting(prev => ({ ...prev, [issue._id]: true }));
        try {
            await axiosSecure.patch(`/upvoteIssue/${issue._id}`, {
                isUpvoted: [...isUpvotedArray, user.email],
                upVotes: (issue?.upVotes || 0) + 1,
            });
            refetch();
            toast.success('Issue upvoted successfully!');
        } catch (e) {
            toast.error('Failed to upvote.');
        } finally {
            setUpvoting(prev => ({ ...prev, [issue._id]: false }));
        }
    };

    const handleFilterChange = (type, value) => setFilters(prev => ({ ...prev, [type]: value }));

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ category: 'all', status: 'all', priority: 'all', sort: 'newest' });
        setCurrentPage(1);
    };

    const getIssueImage = (issue) => {
        if (issue.images?.length > 0) return issue.images[0];
        const defaults = {
            'Electricity': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
            'Water_Supply': 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5c0?auto=format&fit=crop&w=600&q=80',
            'Road_Damage': 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?auto=format&fit=crop&w=600&q=80',
            'Streetlight': 'https://images.unsplash.com/photo-1517322048670-4fba75cbbb62?auto=format&fit=crop&w=600&q=80',
            'Traffic': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
            'Parks': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
        };
        return defaults[issue.category] || 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=600&q=80';
    };

    const getUniqueCategories = () => [...new Set(allIssues.map(i => i.category).filter(Boolean))];

    const generatePageNumbers = () => {
        const pages = [];
        const max = 5;
        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            if (currentPage <= 2) { start = 2; end = 4; }
            if (currentPage >= totalPages - 1) { start = totalPages - 3; end = totalPages - 1; }
            pages.push(1);
            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const statCards = [
        { label: 'Total', value: allIssues.length, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Pending', value: allIssues.filter(i => i.status === 'Pending').length, color: 'text-yellow-600 dark:text-yellow-400' },
        { label: 'In-Progress', value: allIssues.filter(i => i.status === 'In-Progress').length, color: 'text-blue-500 dark:text-blue-300' },
        { label: 'Working', value: allIssues.filter(i => i.status === 'Working').length, color: 'text-purple-600 dark:text-purple-400' },
        { label: 'Resolved', value: allIssues.filter(i => i.status === 'Resolved').length, color: 'text-green-600 dark:text-green-400' },
        { label: 'Closed', value: allIssues.filter(i => i.status === 'Closed').length, color: 'text-gray-500 dark:text-gray-400' },
        { label: 'Rejected', value: allIssues.filter(i => i.status === 'Rejected').length, color: 'text-red-600 dark:text-red-400' },
        { label: 'Boosted', value: allIssues.filter(i => i.isBoosted).length, color: 'text-pink-600 dark:text-pink-400' },
    ];

    if (isLoading) return (
        <AllIssuesSkeleton></AllIssuesSkeleton>
    );

    if (isError) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineExclamation className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load issues</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">{error?.message || 'An error occurred.'}</p>
            <button onClick={() => refetch()} className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-2xl flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all">
                <HiOutlineRefresh className="w-5 h-5" /> Try Again
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 md:p-6 lg:px-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' } }} />

            {/* Blocked Warning */}
            {singUser?.isBlocked && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
                        <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                            Contact{' '}
                            <a href="tel:+8809609333222" className="underline font-semibold">+880 9609 333222</a>
                            {' '}or{' '}
                            <a href="mailto:support@infra.gov" className="underline font-semibold">support@infra.gov</a>
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-screen-2xl mx-auto">

                {/* Header */}
                <div className="mb-6 sm:pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="flex justify-center sm:justify-start text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 pt-8 sm:pt-0">
                                All <span className="ml-2.5 text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600"> Reported Issues</span>
                            </h1>
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                {user ? 'Upvote important issues and help prioritize community needs.' : 'Login to upvote and report issues.'}
                            </p>
                        </div>
                        <div className="shrink-0 flex justify-center sm:justify-start">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard/reportIssue')}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium flex items-center gap-2 text-sm sm:text-base"
                                >
                                    <HiOutlineLightningBolt className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Report New Issue
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium flex items-center gap-2 text-sm sm:text-base"
                                >
                                    <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Login to Report
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-6">
                        {statCards.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700 text-center">
                                <div className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Search</label>
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Title, description, location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">✕</button>
                                )}
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Sort By</label>
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="upvotes">Most Upvoted</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            >
                                <option value="all">All Categories</option>
                                {getUniqueCategories().map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>)}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">⏳ Pending</option>
                                <option value="In-Progress">🚧 In-Progress</option>
                                <option value="Working">🛠️ Working</option>
                                <option value="Resolved">✅ Resolved</option>
                                <option value="Closed">🔒 Closed</option>
                                <option value="Rejected">❌ Rejected</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                            >
                                <option value="all">All Priorities</option>
                                <option value="High">🔴 High</option>
                                <option value="Normal">🟡 Normal</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Active filters */}
                        <div className="flex flex-wrap gap-2">
                            {searchTerm && (
                                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs flex items-center gap-1.5 border border-blue-200 dark:border-blue-700">
                                    "{searchTerm}" <button onClick={() => setSearchTerm('')}>✕</button>
                                </span>
                            )}
                            {filters.category !== 'all' && (
                                <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs flex items-center gap-1.5 border border-purple-200 dark:border-purple-700">
                                    {filters.category} <button onClick={() => handleFilterChange('category', 'all')}>✕</button>
                                </span>
                            )}
                            {filters.status !== 'all' && (
                                <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs flex items-center gap-1.5 border border-green-200 dark:border-green-700">
                                    {filters.status} <button onClick={() => handleFilterChange('status', 'all')}>✕</button>
                                </span>
                            )}
                            {filters.priority !== 'all' && (
                                <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs flex items-center gap-1.5 border border-orange-200 dark:border-orange-700">
                                    {filters.priority} <button onClick={() => handleFilterChange('priority', 'all')}>✕</button>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors border border-gray-300 dark:border-gray-600 text-xs font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">
                            {filteredIssues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredIssues.length)}
                        </span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredIssues.length}</span> issues
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">12 per page</p>
                </div>

                {/* Issues Grid */}
                <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-7">
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
                                        transition={{ duration: 0.3, delay: index * 0.04 }}
                                        className={`relative hover:-translate-y-1 duration-300 ${issue.isBoosted ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900 rounded-xl' : ''}`}
                                    >
                                        {issue.isBoosted && (
                                            <div className="absolute -top-3 left-3 z-10">
                                                <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-xl flex items-center gap-1 shadow-lg">
                                                    <HiOutlineLightningBolt className="w-3 h-3" /> Boosted
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                                            {/* Image */}
                                            <div className="h-40 sm:h-44 relative overflow-hidden shrink-0">
                                                <img src={getIssueImage(issue)} alt={issue.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                                                <div className="absolute top-3 right-3">
                                                    <span className={`${statusConfig.color} text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg`}>
                                                        {statusConfig.icon} {statusConfig.text}
                                                    </span>
                                                </div>
                                                <div className="absolute top-3 left-3">
                                                    <span className={`${priorityConfig.color} text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                                                        {priorityConfig.icon} {priorityConfig.text}
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                    <span className="text-sm">{getCategoryIcon(issue.category)}</span>
                                                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{issue.category}</span>
                                                </div>
                                                {issue.images?.length > 0 && (
                                                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                        <HiOutlinePhotograph className="w-3 h-3" /> {issue.images.length}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                                                        {issue.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3 flex-1">
                                                    {issue?.description?.slice(0, 80) || ''}...
                                                </p>

                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-2">
                                                    <HiOutlineLocationMarker className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="line-clamp-1">{issue.location}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-4">
                                                    <HiOutlineUser className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="line-clamp-1">{issue?.reportedByName || 'Anonymous'}</span>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2 mt-auto">
                                                    <button
                                                        onClick={() => handleUpvote(issue)}
                                                        data-tooltip-id={`upvote-${issue._id}`}
                                                        data-tooltip-content={
                                                            !user ? "Login to upvote" :
                                                                singUser?.isBlocked ? "Account Blocked" :
                                                                    isOwnIssue ? "Can't upvote own issue" :
                                                                        hasUpvoted ? "Already upvoted" : "Upvote"
                                                        }
                                                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${hasUpvoted ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                            isOwnIssue ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' :
                                                                'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                                            }`}
                                                    >
                                                        {upvoting[issue._id]
                                                            ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-blue-600" />
                                                            : <HiOutlineThumbUp className="w-3.5 h-3.5" />
                                                        }
                                                        {issue.upVotes || 0}
                                                    </button>
                                                    <Tooltip id={`upvote-${issue._id}`} />

                                                    <Link
                                                        to={`/issueDetailsPage/${issue._id}`}
                                                        className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group/btn shadow-md hover:shadow-lg"
                                                    >
                                                        View Details
                                                        <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                                    <HiOutlineDocumentText className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Issues Found</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                                    {searchTerm ? `No results for "${searchTerm}". Try different terms.` : 'No issues match the selected filters.'}
                                </p>
                                <button onClick={clearFilters} className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg">
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </AnimatePresence>

                {/* Pagination */}
                {filteredIssues.length > 0 && totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                            Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                        </p>

                        <div className="flex items-center gap-1 order-1 sm:order-2">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            >
                                <HiOutlineChevronDoubleLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>

                            {generatePageNumbers().map((p, i) =>
                                p === '...' ? (
                                    <span key={`e-${i}`} className="px-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => goToPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === p
                                            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            >
                                <HiOutlineChevronDoubleRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssue;