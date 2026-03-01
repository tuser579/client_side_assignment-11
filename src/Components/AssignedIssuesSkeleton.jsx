import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaTasks, FaFilter, FaSearch, FaExclamationTriangle, FaClock,
    FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown,
    FaChevronRight, FaChevronLeft, FaCalendarAlt, FaTag, FaEdit,
    FaChevronDown, FaSyncAlt, FaCog, FaEye, FaArrowUp, FaTimes,
    FaCalendarDay, FaClipboardList, FaIdCard, FaHashtag
} from 'react-icons/fa';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';

/* ═══════════════════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════════════════ */

/** Base shimmer block — all skeleton pieces use this */
const Shimmer = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

/** Skeleton for one stat card */
const StatCardSkeleton = () => (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <Shimmer className="h-6 w-8 rounded-md" />
                <Shimmer className="h-3 w-14 rounded-md" />
            </div>
            <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
        </div>
    </div>
);

/** Skeleton for one desktop table row */
const TableRowSkeleton = ({ index }) => (
    <tr className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/40 dark:bg-gray-800/40'}>
        {/* Issue Details */}
        <td className="py-4 px-5">
            <div className="flex items-start gap-3">
                <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                    <Shimmer className="h-4 w-48 max-w-full rounded-md" />
                    <div className="flex gap-3">
                        <Shimmer className="h-3 w-28 rounded-md" />
                        <Shimmer className="h-3 w-28 rounded-md" />
                    </div>
                </div>
            </div>
        </td>
        {/* Category */}
        <td className="py-4 px-5"><Shimmer className="h-6 w-24 rounded-full" /></td>
        {/* Status */}
        <td className="py-4 px-5"><Shimmer className="h-6 w-20 rounded-full" /></td>
        {/* Priority */}
        <td className="py-4 px-5"><Shimmer className="h-6 w-16 rounded-full" /></td>
        {/* Actions */}
        <td className="py-4 px-5">
            <div className="flex items-center gap-2">
                <Shimmer className="h-8 w-20 rounded-xl" />
                <Shimmer className="h-8 w-24 rounded-xl" />
            </div>
        </td>
    </tr>
);

/** Skeleton for one mobile card */
const MobileCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
            <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-3/4 rounded-md" />
                <Shimmer className="h-3 w-1/2 rounded-md" />
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                    <Shimmer className="h-5 w-16 rounded-full" />
                    <Shimmer className="h-5 w-14 rounded-full" />
                    <Shimmer className="h-5 w-20 rounded-full" />
                </div>
            </div>
        </div>
        <div className="flex gap-4 mb-4">
            <Shimmer className="h-3 w-24 rounded-md" />
            <Shimmer className="h-3 w-24 rounded-md" />
        </div>
        <div className="flex gap-2">
            <Shimmer className="flex-1 h-9 rounded-xl" />
            <Shimmer className="flex-1 h-9 rounded-xl" />
        </div>
    </div>
);

/**
 * Full-page skeleton that mirrors the real page layout exactly.
 * Shown while issuesLoading === true.
 */
const AssignedIssuesSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-6">
        <div className="max-w-7xl mx-auto">

            {/* ── Header skeleton ── */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    {/* Icon box */}
                    <Shimmer className="w-14 h-14 rounded-2xl shrink-0" />
                    <div className="space-y-2.5">
                        <Shimmer className="h-8 w-52 rounded-lg" />
                        <Shimmer className="h-4 w-72 rounded-md" />
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* ── Filter bar skeleton ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                {/* Search row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-5">
                    <Shimmer className="flex-1 h-10 rounded-xl" />
                    <Shimmer className="h-10 w-28 rounded-xl shrink-0" />
                </div>
                {/* Dropdown row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <Shimmer className="h-3 w-16 rounded-md" />
                            <Shimmer className="h-10 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Desktop table skeleton ── */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                {/* Fake thead */}
                <div className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700 px-5 py-3.5 flex items-center gap-8">
                    <Shimmer className="h-3 w-24 rounded-md" />
                    <Shimmer className="h-3 w-16 rounded-md" />
                    <Shimmer className="h-3 w-12 rounded-md" />
                    <Shimmer className="h-3 w-14 rounded-md" />
                    <Shimmer className="h-3 w-16 rounded-md ml-auto" />
                </div>
                <table className="w-full">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRowSkeleton key={i} index={i} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile card skeletons ── */}
            <div className="md:hidden space-y-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <MobileCardSkeleton key={i} />
                ))}
            </div>

            {/* ── Pagination skeleton ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                <Shimmer className="h-4 w-40 rounded-md" />
                <div className="flex items-center gap-1.5">
                    <Shimmer className="w-9 h-9 rounded-xl" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Shimmer key={i} className="w-9 h-9 rounded-xl" />
                    ))}
                    <Shimmer className="w-9 h-9 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════ */
const StatCard = ({ value, label, linear, iconBg, Icon }) => (
    <div className={`${linear} border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs font-semibold mt-0.5 opacity-80">{label}</div>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const AssignedIssues = () => {
    const queryClient = useQueryClient();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortField, setSortField] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);

    const { data: allIssues = [], isLoading: issuesLoading, error: issuesError, refetch } = useQuery({
        queryKey: ['assignedIssues'],
        queryFn: async () => {
            const response = await axiosSecure.get('/allIssues');
            return response.data || [];
        },
        refetchOnWindowFocus: false
    });

    const assignedIssues = useMemo(() => {
        if (!Array.isArray(allIssues) || !user?.email) return [];
        return allIssues.filter(issue => {
            if (!issue || !issue.assignedStaffEmail) return false;
            return issue.assignedStaffEmail.toLowerCase() === user.email.toLowerCase();
        });
    }, [allIssues, user]);

    const STATUS_CONFIG = {
        'Pending':     { label: 'Pending',     color: 'bg-amber-100 text-amber-800 border-amber-200',      darkColor: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',      icon: FaClock,        next: ['In-Progress'] },
        'In-Progress': { label: 'In-Progress', color: 'bg-blue-100 text-blue-800 border-blue-200',          darkColor: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',          icon: FaSyncAlt,      next: ['Working'] },
        'Working':     { label: 'Working',     color: 'bg-purple-100 text-purple-800 border-purple-200',    darkColor: 'dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',    icon: FaCog,          next: ['Resolved'] },
        'Resolved':    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700', icon: FaCheckCircle,  next: ['Closed'] },
        'Closed':      { label: 'Closed',      color: 'bg-gray-100 text-gray-700 border-gray-200',          darkColor: 'dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',          icon: FaTimesCircle,  next: [] },
    };

    const PRIORITY_CONFIG = {
        'High':   { label: 'High',   color: 'bg-orange-100 text-orange-800 border-orange-200', darkColor: 'dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700', icon: FaExclamationTriangle, order: 2 },
        'Normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800 border-blue-200',        darkColor: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',        icon: FaExclamationTriangle, order: 5 },
    };

    const categories = useMemo(() => {
        return [...new Set(assignedIssues.map(i => i.category).filter(Boolean))];
    }, [assignedIssues]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ issueId, newStatus, currentStatus }) => {
            const timelineEntry = { action: 'Status_Changed', timestamp: new Date(), by: user?.email, note: `Status changed from ${currentStatus} to ${newStatus}` };
            const existingIssue = assignedIssues.find(i => i._id === issueId);
            const existingTimeline = existingIssue?.timelineEntry || [];
            const updateData = { status: newStatus, updatedAt: new Date(), timelineEntry: [...existingTimeline, timelineEntry] };
            if (newStatus === 'Resolved') updateData.resolvedData = new Date();
            const response = await axiosSecure.patch(`/myIssueUpdate/${issueId}`, updateData);
            return response.data;
        },
        onMutate: async ({ issueId, newStatus }) => {
            await queryClient.cancelQueries(['assignedIssues']);
            const previousIssues = queryClient.getQueryData(['assignedIssues']);
            queryClient.setQueryData(['assignedIssues'], old => {
                if (!old) return old;
                return old.map(issue =>
                    issue._id === issueId
                        ? { ...issue, status: newStatus, updatedAt: new Date().toISOString(), timelineEntry: [...(issue.timelineEntry || []), { action: 'status_changed', timestamp: new Date(), changedBy: user?.email, note: `Status changed from ${issue.status} to ${newStatus}` }] }
                        : issue
                );
            });
            return { previousIssues };
        },
        onError: (err, _, context) => {
            if (context?.previousIssues) queryClient.setQueryData(['assignedIssues'], context.previousIssues);
            toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`, { position: 'top-right', autoClose: 5000 });
        },
        onSuccess: (_, variables) => {
            toast.success(`Status updated to "${STATUS_CONFIG[variables.newStatus]?.label || variables.newStatus}"`, { position: 'top-center', autoClose: 3000 });
        },
        onSettled: () => queryClient.invalidateQueries(['assignedIssues'])
    });

    const handleStatusChange = async (issue, newStatus) => {
        setSelectedIssue(issue);
        const result = await Swal.fire({
            title: 'Confirm Status Change',
            html: `<div class="text-left">
                <div class="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl border">
                    <div class="w-9 h-9 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    </div>
                    <div><div class="font-semibold text-gray-900">${issue.title}</div><div class="text-xs text-gray-500">ID: ${issue._id?.slice(-8)}</div></div>
                </div>
                <div class="flex items-center justify-center gap-4 mb-5">
                    <span class="px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_CONFIG[issue.status]?.color}">${STATUS_CONFIG[issue.status]?.label || issue.status}</span>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    <span class="px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_CONFIG[newStatus]?.color}">${STATUS_CONFIG[newStatus]?.label || newStatus}</span>
                </div>
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">This action will be recorded in the issue timeline.</div>
            </div>`,
            icon: 'question', showCancelButton: true,
            confirmButtonText: 'Update Status', cancelButtonText: 'Cancel',
            confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280',
            reverseButtons: true, customClass: { popup: 'rounded-2xl' }
        });
        if (result.isConfirmed) {
            updateStatusMutation.mutate({ issueId: issue._id, currentStatus: issue.status, newStatus });
            setStatusDropdownOpen(null);
            setSelectedIssue(null);
        }
    };

    const getNextStatuses = (currentStatus) => STATUS_CONFIG[currentStatus]?.next || [];

    const filteredAndSortedIssues = useMemo(() => {
        const filterFn = (arr) => arr.filter(issue => {
            if (!issue) return false;
            const matchesSearch = (issue.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (issue.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (issue._id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            return matchesSearch && (statusFilter === 'all' || issue.status === statusFilter) && (priorityFilter === 'all' || issue.priority === priorityFilter) && (categoryFilter === 'all' || issue.category === categoryFilter);
        });
        const sortFn = (arr) => [...arr].sort((a, b) => {
            let aV = a[sortField], bV = b[sortField];
            if (sortField === 'priority') { aV = PRIORITY_CONFIG[a.priority]?.order || 999; bV = PRIORITY_CONFIG[b.priority]?.order || 999; }
            else if (['createdAt', 'updatedAt', 'dueDate'].includes(sortField)) { aV = new Date(aV || 0); bV = new Date(bV || 0); }
            return sortOrder === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
        });
        return [...sortFn(filterFn(assignedIssues.filter(i => i.isBoosted))), ...sortFn(filterFn(assignedIssues.filter(i => !i.isBoosted)))];
    }, [assignedIssues, searchTerm, statusFilter, priorityFilter, categoryFilter, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedIssues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedIssues = filteredAndSortedIssues.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const toggleSort = (field) => { if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortOrder('desc'); } };
    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="w-3 h-3 text-gray-400 dark:text-gray-500" />;
        return sortOrder === 'asc' ? <FaSortUp className="w-3 h-3 text-blue-500" /> : <FaSortDown className="w-3 h-3 text-blue-500" />;
    };
    const formatDate = (d) => { if (!d) return 'N/A'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return 'Invalid Date'; } };

    const stats = useMemo(() => ({
        showing: filteredAndSortedIssues.length,
        total: assignedIssues.length,
        pending: assignedIssues.filter(i => i.status === 'Pending').length,
        inProgress: assignedIssues.filter(i => i.status === 'In-Progress').length,
        working: assignedIssues.filter(i => i.status === 'Working').length,
        resolved: assignedIssues.filter(i => i.status === 'Resolved').length,
        closed: assignedIssues.filter(i => i.status === 'Closed').length,
        boosted: assignedIssues.filter(i => i.isBoosted).length,
    }), [assignedIssues, filteredAndSortedIssues]);

    /* ── Badges ── */
    const StatusBadge = ({ status }) => {
        const cfg = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', darkColor: 'dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600', icon: FaClock, label: status };
        const Icon = cfg.icon;
        return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.darkColor}`}><Icon className="w-3 h-3" />{cfg.label}</span>;
    };

    const PriorityBadge = ({ priority }) => {
        const cfg = PRIORITY_CONFIG[priority] || { color: 'bg-gray-100 text-gray-700 border-gray-200', darkColor: 'dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600', icon: FaExclamationTriangle, label: priority };
        const Icon = cfg.icon;
        return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.darkColor}`}><Icon className="w-3 h-3" />{cfg.label}</span>;
    };

    const CategoryBadge = ({ category }) => {
        const palettes = [
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
            'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
            'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
            'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
            'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
        ];
        const idx = Math.abs((category || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palettes.length;
        return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${palettes[idx]}`}><FaTag className="w-3 h-3" />{category || 'Uncategorized'}</span>;
    };

    /* ── Skeleton loading ── */
    if (issuesLoading) return <AssignedIssuesSkeleton />;

    /* ── Error ── */
    if (issuesError) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Issues</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{issuesError.message}</p>
                <button onClick={() => refetch()} className="px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">Try Again</button>
            </div>
        </div>
    );

    /* ── Main render ── */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6">
            <ToastContainer theme="colored" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                                    <FaClipboardList className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow">
                                    {stats.total}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                    Assigned <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Issues</span>
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and update status of issues assigned to you</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                        <StatCard value={stats.showing}    label="Showing"     linear="bg-linear-to-br from-cyan-50 to-blue-50 border-cyan-200 text-cyan-900 dark:from-cyan-900/20 dark:to-blue-900/20 dark:border-cyan-800 dark:text-cyan-100"               iconBg="bg-linear-to-br from-cyan-500 to-blue-500"     Icon={FaFilter} />
                        <StatCard value={stats.pending}    label="Pending"     linear="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-900 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-800 dark:text-amber-100"       iconBg="bg-linear-to-br from-amber-500 to-amber-400"   Icon={FaClock} />
                        <StatCard value={stats.inProgress} label="In-Progress" linear="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800 dark:text-blue-100"               iconBg="bg-linear-to-br from-blue-500 to-blue-400"     Icon={FaSyncAlt} />
                        <StatCard value={stats.working}    label="Working"     linear="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-900 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-800 dark:text-purple-100" iconBg="bg-linear-to-br from-purple-500 to-purple-400" Icon={FaCog} />
                        <StatCard value={stats.resolved}   label="Resolved"    linear="bg-linear-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-800 dark:text-emerald-100" iconBg="bg-linear-to-br from-emerald-500 to-emerald-400" Icon={FaCheckCircle} />
                        <StatCard value={stats.closed}     label="Closed"      linear="bg-linear-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-900 dark:from-gray-800/60 dark:to-gray-700/40 dark:border-gray-700 dark:text-gray-100"               iconBg="bg-linear-to-br from-gray-500 to-gray-400"     Icon={FaTimesCircle} />
                        <StatCard value={stats.boosted}    label="Boosted"     linear="bg-linear-to-br from-purple-50 to-pink-50 border-purple-200 text-purple-900 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800 dark:text-purple-100"     iconBg="bg-linear-to-br from-purple-500 to-pink-500"   Icon={FaArrowUp} />
                    </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            <input type="text" placeholder="Search by title, description, or ID…" value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-11 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                            <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedIssues.length}</span> of <span className="font-bold text-gray-900 dark:text-white">{assignedIssues.length}</span> issues
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Status',   value: statusFilter,   setter: v => { setStatusFilter(v);          setCurrentPage(1); }, Icon: FaClock,              options: [['all','All Status'],      ...Object.entries(STATUS_CONFIG).map(([v,c])=>[v,c.label])] },
                            { label: 'Priority', value: priorityFilter, setter: v => { setPriorityFilter(v);        setCurrentPage(1); }, Icon: FaExclamationTriangle, options: [['all','All Priority'],     ...Object.entries(PRIORITY_CONFIG).sort(([,a],[,b])=>a.order-b.order).map(([v,c])=>[v,c.label])] },
                            { label: 'Category', value: categoryFilter, setter: v => { setCategoryFilter(v);        setCurrentPage(1); }, Icon: FaTag,                 options: [['all','All Categories'],  ...categories.map(c=>[c,c])] },
                            { label: 'Per Page', value: itemsPerPage,   setter: v => { setItemsPerPage(Number(v));  setCurrentPage(1); }, Icon: FaEdit,               options: [[5,'5 / page'],[10,'10 / page'],[15,'15 / page'],[20,'20 / page'],[25,'25 / page']] },
                        ].map(({ label, value, setter, Icon, options }) => (
                            <div key={label}>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 pl-1">{label}</label>
                                <div className="relative">
                                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                    <select value={value} onChange={e => setter(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                                        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
                        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Filters:</span>
                            {searchTerm && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800"><FaSearch className="w-3 h-3" />"{searchTerm}"<button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="ml-0.5 hover:opacity-70"><FaTimes className="w-3 h-3" /></button></span>}
                            {statusFilter !== 'all' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-100 dark:border-amber-800"><FaClock className="w-3 h-3" />{STATUS_CONFIG[statusFilter]?.label}<button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className="ml-0.5 hover:opacity-70"><FaTimes className="w-3 h-3" /></button></span>}
                            {priorityFilter !== 'all' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full border border-red-100 dark:border-red-800"><FaExclamationTriangle className="w-3 h-3" />{PRIORITY_CONFIG[priorityFilter]?.label}<button onClick={() => { setPriorityFilter('all'); setCurrentPage(1); }} className="ml-0.5 hover:opacity-70"><FaTimes className="w-3 h-3" /></button></span>}
                            {categoryFilter !== 'all' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full border border-green-100 dark:border-green-800"><FaTag className="w-3 h-3" />{categoryFilter}<button onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }} className="ml-0.5 hover:opacity-70"><FaTimes className="w-3 h-3" /></button></span>}
                            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); setCategoryFilter('all'); setCurrentPage(1); }} className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><FaTimes className="w-3 h-3" />Clear all</button>
                        </div>
                    )}
                </div>

                {/* ── Empty State ── */}
                {assignedIssues.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaTasks className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Issues Assigned</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">Issues assigned to you by an admin will appear here.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 transition-colors">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                                            {[
                                                { label: 'Issue Details', Icon: FaIdCard,              field: null },
                                                { label: 'Category',      Icon: FaTag,                 field: 'category' },
                                                { label: 'Status',        Icon: FaClock,               field: 'status' },
                                                { label: 'Priority',      Icon: FaExclamationTriangle, field: 'priority' },
                                                { label: 'Actions',       Icon: FaCalendarDay,         field: null },
                                            ].map(({ label, Icon, field }) => (
                                                <th key={label} className="py-3.5 px-5 text-left">
                                                    {field ? (
                                                        <button onClick={() => toggleSort(field)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                            <Icon className="w-3.5 h-3.5" />{label}{getSortIcon(field)}
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                                            <Icon className="w-3.5 h-3.5" />{label}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {paginatedIssues.map((issue, index) => {
                                            const nextStatuses = getNextStatuses(issue.status);
                                            const isOpen = statusDropdownOpen === issue._id;
                                            return (
                                                <motion.tr key={issue._id}
                                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}
                                                    className={`hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors ${issue.isBoosted ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}>
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${issue.isBoosted ? 'bg-linear-to-br from-purple-500 to-pink-500' : 'bg-linear-to-br from-blue-500 to-cyan-500'}`}>
                                                                <FaHashtag className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{issue.title}</h3>
                                                                    {issue.isBoosted && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-linear-to-r from-purple-500 to-pink-500 text-white flex-shrink-0"><FaArrowUp className="w-2.5 h-2.5" />Boosted</span>}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                                                                    <span className="flex items-center gap-1"><FaCalendarAlt className="w-3 h-3" />Created: {formatDate(issue.createdAt)}</span>
                                                                    <span className="flex items-center gap-1"><FaCalendarDay className="w-3 h-3" />Updated: {formatDate(issue.updatedAt)}</span>
                                                                    {issue.dueDate && <span className={`flex items-center gap-1 ${new Date(issue.dueDate) < new Date() ? 'text-red-500 font-semibold' : ''}`}><FaClock className="w-3 h-3" />Due: {formatDate(issue.dueDate)}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5"><CategoryBadge category={issue.category} /></td>
                                                    <td className="py-4 px-5"><StatusBadge status={issue.status} /></td>
                                                    <td className="py-4 px-5"><PriorityBadge priority={issue.priority} /></td>
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => navigate(`/issueDetailsPage/${issue._id}`)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                                                                <FaEye className="w-3.5 h-3.5" />Details
                                                            </button>
                                                            <div className="relative">
                                                                <button onClick={() => setStatusDropdownOpen(isOpen ? null : issue._id)} disabled={nextStatuses.length === 0 || updateStatusMutation.isPending}
                                                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${nextStatuses.length === 0 || updateStatusMutation.isPending ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed' : 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>
                                                                    <FaSyncAlt className={`w-3.5 h-3.5 ${updateStatusMutation.isPending && selectedIssue?._id === issue._id ? 'animate-spin' : ''}`} />
                                                                    Update
                                                                    <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {isOpen && nextStatuses.length > 0 && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                                                                        <div className="absolute right-0 mt-1.5 z-20 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5">
                                                                            <div className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Change To</div>
                                                                            {nextStatuses.map(status => {
                                                                                const Icon = STATUS_CONFIG[status]?.icon || FaSyncAlt;
                                                                                return (
                                                                                    <button key={status} onClick={() => handleStatusChange(issue, status)} disabled={updateStatusMutation.isPending}
                                                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center justify-between group transition-colors">
                                                                                        <div className="flex items-center gap-2.5">
                                                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${STATUS_CONFIG[status]?.color?.split(' ')[0] || 'bg-gray-100'}`}><Icon className="w-3 h-3" /></div>
                                                                                            <div>
                                                                                                <div className="font-semibold text-gray-900 dark:text-white text-xs">{STATUS_CONFIG[status]?.label}</div>
                                                                                                <div className="text-xs text-gray-400 dark:text-gray-500">Click to update</div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <FaChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors" />
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="md:hidden space-y-3 mb-6">
                            {paginatedIssues.map((issue, index) => {
                                const nextStatuses = getNextStatuses(issue.status);
                                const isOpen = statusDropdownOpen === issue._id;
                                return (
                                    <motion.div key={issue._id}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}
                                        className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden transition-colors ${issue.isBoosted ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700'}`}>
                                        {issue.isBoosted && (
                                            <div className="bg-linear-to-r from-purple-500 to-pink-500 px-4 py-1.5 flex items-center gap-1.5">
                                                <FaArrowUp className="w-3 h-3 text-white" />
                                                <span className="text-xs font-bold text-white tracking-wide">BOOSTED ISSUE</span>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${issue.isBoosted ? 'bg-linear-to-br from-purple-500 to-pink-500' : 'bg-linear-to-br from-blue-500 to-cyan-500'}`}>
                                                    <FaHashtag className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">{issue.title}</h3>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <StatusBadge status={issue.status} />
                                                        <PriorityBadge priority={issue.priority} />
                                                        <CategoryBadge category={issue.category} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
                                                <span className="flex items-center gap-1"><FaCalendarAlt className="w-3 h-3" />{formatDate(issue.createdAt)}</span>
                                                <span className="flex items-center gap-1"><FaCalendarDay className="w-3 h-3" />{formatDate(issue.updatedAt)}</span>
                                                {issue.dueDate && <span className={`flex items-center gap-1 ${new Date(issue.dueDate) < new Date() ? 'text-red-500 font-semibold' : ''}`}><FaClock className="w-3 h-3" />Due: {formatDate(issue.dueDate)}</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/issueDetailsPage/${issue._id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                                                    <FaEye className="w-3.5 h-3.5" />View Details
                                                </button>
                                                <div className="relative flex-1">
                                                    <button onClick={() => setStatusDropdownOpen(isOpen ? null : issue._id)} disabled={nextStatuses.length === 0 || updateStatusMutation.isPending}
                                                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${nextStatuses.length === 0 || updateStatusMutation.isPending ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed' : 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>
                                                        <FaSyncAlt className={`w-3.5 h-3.5 ${updateStatusMutation.isPending && selectedIssue?._id === issue._id ? 'animate-spin' : ''}`} />
                                                        Update Status
                                                        <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isOpen && nextStatuses.length > 0 && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                                                            <div className="absolute bottom-full left-0 right-0 mb-1.5 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5">
                                                                <div className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">Change To</div>
                                                                {nextStatuses.map(status => {
                                                                    const Icon = STATUS_CONFIG[status]?.icon || FaSyncAlt;
                                                                    return (
                                                                        <button key={status} onClick={() => handleStatusChange(issue, status)} disabled={updateStatusMutation.isPending}
                                                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center justify-between group transition-colors">
                                                                            <div className="flex items-center gap-2.5">
                                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${STATUS_CONFIG[status]?.color?.split(' ')[0] || 'bg-gray-100'}`}><Icon className="w-3 h-3" /></div>
                                                                                <span className="font-semibold text-gray-900 dark:text-white text-xs">{STATUS_CONFIG[status]?.label}</span>
                                                                            </div>
                                                                            <FaChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors" />
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAndSortedIssues.length)}</span> of{' '}
                                    <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedIssues.length}</span> issues
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let p;
                                        if (totalPages <= 5) p = i + 1;
                                        else if (currentPage <= 3) p = i + 1;
                                        else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                                        else p = currentPage - 2 + i;
                                        return (
                                            <button key={p} onClick={() => handlePageChange(p)}
                                                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === p ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                                {p}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && (
                                        <>
                                            <span className="px-1 text-gray-400 dark:text-gray-500 text-sm">…</span>
                                            <button onClick={() => handlePageChange(totalPages)}
                                                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === totalPages ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AssignedIssuesSkeleton;