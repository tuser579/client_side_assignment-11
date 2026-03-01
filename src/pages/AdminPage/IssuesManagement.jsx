import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import {
    Search, Filter, UserPlus, CheckCircle2, XCircle, Eye,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, ChevronLeft,
    Tag, User, ChevronDown, AlertCircle, Clock, Shield, Ban,
    RefreshCw, Settings, Zap, X, ListFilter
} from 'lucide-react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';

/* ─── shared input cls ─── */
const selectCls = "w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

/* ─── status config ─── */
const STATUS_CFG = {
    'Pending':     { soft: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',     Icon: Clock       },
    'In-Progress': { soft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',             Icon: RefreshCw   },
    'Working':     { soft: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800', Icon: Settings    },
    'Resolved':    { soft: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', Icon: CheckCircle2 },
    'Closed':      { soft: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',            Icon: Shield      },
    'Rejected':    { soft: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',                   Icon: Ban         },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG['Pending'];
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.soft}`}>
            <Icon className="w-3 h-3" />{status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const isHigh = priority?.toLowerCase() === 'high';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            isHigh
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        }`}>
            <AlertCircle className="w-3 h-3" />{isHigh ? 'High' : 'Normal'}
        </span>
    );
};

/* ─── sort icon ─── */
const SortIcon = ({ field, sortField, sortOrder }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return sortOrder === 'asc'
        ? <ArrowUp className="w-3 h-3 text-blue-500" />
        : <ArrowDown className="w-3 h-3 text-blue-500" />;
};

/* ═══════════════════════ MAIN ═══════════════════════ */
const IssuesManagement = () => {
    const queryClient = useQueryClient();
    const { user }    = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate    = useNavigate();

    const [searchTerm,      setSearchTerm]      = useState('');
    const [categoryFilter,  setCategoryFilter]  = useState('all');
    const [statusFilter,    setStatusFilter]    = useState('all');
    const [priorityFilter,  setPriorityFilter]  = useState('all');
    const [sortField,       setSortField]       = useState('createdAt');
    const [sortOrder,       setSortOrder]       = useState('desc');
    const [currentPage,     setCurrentPage]     = useState(1);
    const [itemsPerPage,    setItemsPerPage]    = useState(10);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedIssue,   setSelectedIssue]   = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState('');

    /* ── queries ── */
    const { data: issues = [], isLoading: issuesLoading, error: issuesError, refetch: refetchIssues } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => { const r = await axiosSecure.get('/allIssues'); return r.data; },
    });

    const { data: staffs = [], isLoading: staffsLoading, error: staffsError } = useQuery({
        queryKey: ['staffs'],
        queryFn: async () => { const r = await axiosSecure.get('/staffs'); return r.data; },
    });

    /* ── mutations ── */
    const assignStaffMutation = useMutation({
        mutationFn: async ({ issueId, staffId, staffName, staffEmail, timelineEntry }) => {
            const timeline = { action: 'Staff_Assigned', timestamp: new Date(), note: `Assigned to ${staffEmail} by admin`, by: user.email };
            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                updatedAt: new Date(), assignedStaffId: staffId, assignedStaffName: staffName,
                assignedStaffEmail: staffEmail, timelineEntry: [...timelineEntry, timeline]
            });
            return { issueId, staffId, staffName };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['allIssues'] });
            setShowAssignModal(false); setSelectedIssue(null); setSelectedStaffId('');
            toast.success(`Assigned to ${data.staffName}!`);
        },
        onError: (err) => toast.error(`Failed to assign: ${err.message}`),
    });

    const rejectIssueMutation = useMutation({
        mutationFn: async ({ issueId, timelineEntry }) => {
            const entry = { action: 'Rejected', timestamp: new Date(), note: 'Rejected by admin', by: user.email };
            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                status: 'Rejected', updatedAt: new Date(), timelineEntry: [...timelineEntry, entry]
            });
            return issueId;
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allIssues'] }); toast.success('Issue rejected'); },
        onError: (err) => toast.error(`Failed to reject: ${err.message}`),
    });

    /* ── handlers ── */
    const handleAssignStaff = (issue) => { setSelectedIssue(issue); setSelectedStaffId(''); setShowAssignModal(true); };

    const handleConfirmAssignment = () => {
        if (!selectedStaffId) { toast.error('Please select a staff member'); return; }
        const staff = staffs.find(s => s._id === selectedStaffId);
        if (!staff) return;
        assignStaffMutation.mutate({ issueId: selectedIssue._id, staffId: staff._id, staffName: staff.name, staffEmail: staff.email, timelineEntry: selectedIssue.timelineEntry || [] });
    };

    const handleRejectIssue = (issue) => {
        Swal.fire({
            title: 'Reject this issue?',
            text: `"${issue.title}" — cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject',
            reverseButtons: true,
            customClass: { popup: 'rounded-2xl' },
        }).then(r => { if (r.isConfirmed) rejectIssueMutation.mutate({ issueId: issue._id, timelineEntry: issue.timelineEntry || [] }); });
    };

    const toggleSort = (field) => {
        if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('desc'); }
    };

    const clearAllFilters = () => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); setPriorityFilter('all'); setCurrentPage(1); };
    const hasActiveFilters = searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all';

    /* ── derived ── */
    const categories = useMemo(() => [...new Set(issues.map(i => i.category))].filter(Boolean), [issues]);

    const filteredAndSortedIssues = useMemo(() => {
        const filter = (arr) => arr.filter(issue => {
            const matchSearch   = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) || issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat      = categoryFilter === 'all' || issue.category === categoryFilter;
            const matchStatus   = statusFilter   === 'all' || issue.status   === statusFilter;
            const matchPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
            return matchSearch && matchCat && matchStatus && matchPriority;
        });

        const sort = (arr) => [...arr].sort((a, b) => {
            let av = a[sortField], bv = b[sortField];
            if (['createdAt', 'updatedAt'].includes(sortField)) { av = new Date(av); bv = new Date(bv); }
            return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });

        const boosted = filter(issues.filter(i => i.isBoosted));
        const normal  = filter(issues.filter(i => !i.isBoosted));
        return [...sort(boosted), ...sort(normal)];
    }, [issues, searchTerm, categoryFilter, statusFilter, priorityFilter, sortField, sortOrder]);

    const totalPages     = Math.ceil(filteredAndSortedIssues.length / itemsPerPage);
    const startIndex     = (currentPage - 1) * itemsPerPage;
    const paginatedIssues = filteredAndSortedIssues.slice(startIndex, startIndex + itemsPerPage);

    /* ════════════════════════ RENDER ════════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-center sm:text-start text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Issues{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-600">Management</span>
                            </h1>
                            <p className="text-center sm:text-start text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and assign issues to staff members</p>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end gap-4 shrink-0">
                            <div className="text-center sm:text-right">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{issues.length}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Total Issues</p>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{filteredAndSortedIssues.length}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Filtered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Filters ── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
                    <div className="p-4 sm:p-5 space-y-4">

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by title or description…"
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Filter dropdowns */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* Category */}
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                    <option value="all">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Status */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                    <option value="all">All Status</option>
                                    {['Pending','In-Progress','Working','Resolved','Closed','Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Priority */}
                            <div className="relative">
                                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                    <option value="all">All Priority</option>
                                    <option value="High">High</option>
                                    <option value="Normal">Normal</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Per page */}
                            <div className="relative">
                                <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={selectCls}>
                                    {[5,10,15,20].map(n => <option key={n} value={n}>{n} per page</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl">
                                        "{searchTerm}" <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }}><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                )}
                                {categoryFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl">
                                        {categoryFilter} <button onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                )}
                                {statusFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-xl">
                                        {statusFilter} <button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                )}
                                {priorityFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl">
                                        {priorityFilter} <button onClick={() => { setPriorityFilter('all'); setCurrentPage(1); }}><X className="w-2.5 h-2.5" /></button>
                                    </span>
                                )}
                                <button onClick={clearAllFilters}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-1">
                                    <XCircle className="w-3.5 h-3.5" /> Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Table / Loading / Error ── */}
                {issuesLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading issues…</p>
                    </div>
                ) : issuesError ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 shadow-sm p-12 text-center">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Error Loading Data</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{issuesError.message}</p>
                        <button onClick={() => refetchIssues()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                            {[
                                                { label: 'Issue Title', field: 'title' },
                                                { label: 'Category',    field: 'category' },
                                                { label: 'Status',      field: 'status' },
                                                { label: 'Priority',    field: 'priority' },
                                            ].map(col => (
                                                <th key={col.field} className="py-3 px-5 text-left">
                                                    <button onClick={() => toggleSort(col.field)}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        {col.label}
                                                        <SortIcon field={col.field} sortField={sortField} sortOrder={sortOrder} />
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Assigned Staff</th>
                                            <th className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedIssues.length > 0 ? paginatedIssues.map((issue, idx) => (
                                            <motion.tr
                                                key={issue._id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${issue.isBoosted ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}
                                            >
                                                <td className="py-4 px-5">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{issue.title}</p>
                                                    {issue.isBoosted && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                                            <Zap className="w-2.5 h-2.5" /> Boosted
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                        {issue.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5"><StatusBadge status={issue.status} /></td>
                                                <td className="py-4 px-5"><PriorityBadge priority={issue.priority} /></td>
                                                <td className="py-4 px-5">
                                                    {issue.assignedStaffId ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                {issue.assignedStaffName?.charAt(0) || 'S'}
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{issue.assignedStaffName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <button onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                                            <Eye className="w-3 h-3" /> View
                                                        </button>
                                                        {!issue.assignedStaffId && issue.status !== 'Rejected' && (
                                                            <button onClick={() => handleAssignStaff(issue)} disabled={assignStaffMutation.isPending}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                                                                <UserPlus className="w-3 h-3" /> Assign
                                                            </button>
                                                        )}
                                                        {!issue.assignedStaffId && issue.status === 'Pending' && (
                                                            <button onClick={() => handleRejectIssue(issue)} disabled={rejectIssueMutation.isPending}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50">
                                                                <XCircle className="w-3 h-3" /> Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                                            <Filter className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                            {hasActiveFilters ? 'No issues match your filters' : 'No issues found'}
                                                        </p>
                                                        {hasActiveFilters && (
                                                            <button onClick={clearAllFilters} className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">Clear filters</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                                {paginatedIssues.length > 0 ? paginatedIssues.map((issue, idx) => (
                                    <motion.div
                                        key={issue._id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className={`p-4 ${issue.isBoosted ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{issue.title}</p>
                                            {issue.isBoosted && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 shrink-0">
                                                    <Zap className="w-2.5 h-2.5" />Boosted
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            <StatusBadge status={issue.status} />
                                            <PriorityBadge priority={issue.priority} />
                                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">{issue.category}</span>
                                        </div>
                                        {issue.assignedStaffId && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                    {issue.assignedStaffName?.charAt(0) || 'S'}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{issue.assignedStaffName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <button onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl">
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                            {!issue.assignedStaffId && issue.status !== 'Rejected' && (
                                                <button onClick={() => handleAssignStaff(issue)} disabled={assignStaffMutation.isPending}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl disabled:opacity-50">
                                                    <UserPlus className="w-3 h-3" /> Assign
                                                </button>
                                            )}
                                            {!issue.assignedStaffId && issue.status === 'Pending' && (
                                                <button onClick={() => handleRejectIssue(issue)} disabled={rejectIssueMutation.isPending}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl disabled:opacity-50">
                                                    <XCircle className="w-3 h-3" /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="py-16 flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                            <Filter className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {hasActiveFilters ? 'No issues match your filters' : 'No issues found'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Pagination ── */}
                        {paginatedIssues.length > 0 && totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Showing <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredAndSortedIssues.length)}</span> of{' '}
                                    <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedIssues.length}</span> issues
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let p;
                                        if (totalPages <= 5) p = i + 1;
                                        else if (currentPage <= 3) p = i + 1;
                                        else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                                        else p = currentPage - 2 + i;
                                        return (
                                            <button key={p} onClick={() => setCurrentPage(p)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                                                    currentPage === p
                                                        ? 'bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                                                        : 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}>
                                                {p}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && (
                                        <>
                                            <span className="px-1 text-gray-400 dark:text-gray-500 text-xs">…</span>
                                            <button onClick={() => setCurrentPage(totalPages)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${
                                                    currentPage === totalPages
                                                        ? 'bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}>
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Assign Staff Modal ── */}
            <AnimatePresence>
                {showAssignModal && (
                    <>
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowAssignModal(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                                transition={{ duration: 0.2 }}
                                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="h-1 bg-linear-to-r from-emerald-500 to-teal-500" />

                                {/* Modal header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                            <UserPlus className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Assign Staff</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{selectedIssue?.title}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAssignModal(false)}
                                        className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Modal body */}
                                <div className="p-5 space-y-4">
                                    {staffsLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin" />
                                        </div>
                                    ) : staffsError ? (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-red-500 mb-3">Failed to load staff data</p>
                                            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold">Reload</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    Select Staff Member
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                    <select
                                                        value={selectedStaffId}
                                                        onChange={e => setSelectedStaffId(e.target.value)}
                                                        disabled={staffs.length === 0}
                                                        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                                                    >
                                                        <option value="">Choose a staff member…</option>
                                                        {staffs.map(s => <option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                                </div>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{staffs.length} staff available</p>
                                            </div>

                                            {/* Staff preview */}
                                            {selectedStaffId && (() => {
                                                const s = staffs.find(x => x._id === selectedStaffId);
                                                return s ? (
                                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                                        <div className="w-9 h-9 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                                            {s.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={() => setShowAssignModal(false)} disabled={assignStaffMutation.isPending}
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={handleConfirmAssignment} disabled={!selectedStaffId || assignStaffMutation.isPending}
                                                    className="flex-1 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                                                    {assignStaffMutation.isPending
                                                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Assigning…</>
                                                        : <><UserPlus className="w-4 h-4" />Confirm</>
                                                    }
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IssuesManagement;