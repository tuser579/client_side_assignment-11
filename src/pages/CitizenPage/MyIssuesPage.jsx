import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import {
  HiFilter, HiSearch, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineEye,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle,
  HiOutlineXCircle, HiOutlinePhotograph, HiOutlineLocationMarker,
  HiOutlineCalendar, HiOutlineDocumentText, HiOutlineLightningBolt,
  HiOutlineRefresh, HiOutlineExclamation, HiOutlineBookmark,
  HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight,
  HiOutlineCog, HiOutlineLockClosed, HiOutlineThumbUp, HiOutlineUser
} from 'react-icons/hi';
import { AlertCircle, Zap } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import MyIssuesPageSkeleton from '../../Components/MyIssuesPageSkeleton';

const ITEMS_PER_PAGE = 12;

const MyIssuesPage = () => {
  const axiosSecure  = useAxiosSecure();
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { user }     = useAuth();

  const [filters,        setFilters]        = useState({ status: 'all', category: 'all', priority: 'all', search: '' });
  const [editingIssue,   setEditingIssue]   = useState(null);
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [formData,       setFormData]       = useState({ title: '', description: '', category: '', priority: '', location: '', images: [] });
  const [currentPage,    setCurrentPage]    = useState(1);

  /* ── fetch ── */
  const { data = {}, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userData', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const [issuesRes, userRes] = await Promise.all([
        axiosSecure.get(`/myIssues?email=${user?.email}`),
        axiosSecure.get(`/singleUser?email=${user?.email}`)
      ]);
      return { issues: issuesRes.data, users: userRes.data };
    }
  });
  const { issues = [], users: singUser = {} } = data;

  /* ── mutations ── */
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

  const deleteIssueMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/myIssueDelete/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['myIssues', user?.email])
  });

  /* ── filter / paginate ── */
  const filteredIssues = issues.filter(issue => {
    if (filters.status   !== 'all' && issue.status   !== filters.status)   return false;
    if (filters.category !== 'all' && issue.category !== filters.category) return false;
    if (filters.priority !== 'all' && issue.priority !== filters.priority) return false;
    if (filters.search && !issue.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const totalPages     = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const startIndex     = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(2, currentPage - 1);
      let end   = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 2)              { start = 2; end = 4; }
      if (currentPage >= totalPages - 1) { start = totalPages - 3; end = totalPages - 1; }
      pages.push(1);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── config helpers ── */
  const statusConfigs = {
    'Pending':     { gradient: 'from-amber-500 to-orange-500',   icon: <HiOutlineClock className="w-3.5 h-3.5" />,           text: 'Pending'     },
    'In-Progress': { gradient: 'from-blue-500 to-cyan-500',      icon: <HiOutlineRefresh className="w-3.5 h-3.5" />,         text: 'In-Progress' },
    'Working':     { gradient: 'from-violet-500 to-purple-500',  icon: <HiOutlineCog className="w-3.5 h-3.5" />,             text: 'Working'     },
    'Resolved':    { gradient: 'from-emerald-500 to-teal-500',   icon: <HiOutlineCheckCircle className="w-3.5 h-3.5" />,     text: 'Resolved'    },
    'Closed':      { gradient: 'from-gray-500 to-gray-600',      icon: <HiOutlineLockClosed className="w-3.5 h-3.5" />,      text: 'Closed'      },
    'Rejected':    { gradient: 'from-red-500 to-pink-500',       icon: <HiOutlineXCircle className="w-3.5 h-3.5" />,         text: 'Rejected'    },
  };

  const getStatusConfig = (status) => {
    const key = Object.keys(statusConfigs).find(k => k.toLowerCase() === (status || '').toLowerCase());
    return statusConfigs[key] || statusConfigs['Pending'];
  };

  const getPriorityConfig = (priority) => priority === 'High'
    ? { gradient: 'from-orange-500 to-red-500',  label: 'High',   icon: <HiOutlineExclamationCircle className="w-3.5 h-3.5" /> }
    : { gradient: 'from-blue-500 to-blue-600',   label: 'Normal', icon: <HiOutlineBookmark className="w-3.5 h-3.5" /> };

  const getCategoryIcon = (cat) => ({
    'Streetlight': '💡', 'Road_Damage': '🛣️', 'Garbage': '🗑️', 'Footpath': '🚶',
    'Drainage': '🌊', 'Traffic': '🚦', 'Parks': '🌳', 'Public_Toilet': '🚻',
    'Noise': '🔇', 'Electricity': '⚡', 'Water_Supply': '💧', 'Sanitation': '♻️',
    'Infrastructure': '🏗️', 'Other': '❓'
  })[cat] || '📋';

  const defaultImages = {
    'Electricity':  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&q=80',
    'Water_Supply': 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5c0?w=600&q=80',
    'Road_Damage':  'https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=600&q=80',
    'default':      'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=600&q=80'
  };
  const getIssueImage = (issue) => issue?.images?.[0] || defaultImages[issue?.category] || defaultImages.default;

  /* ── stat cards ── */
  const statCards = [
    { label: 'Total',       value: issues.length,                                         color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { label: 'Pending',     value: issues.filter(i => i.status === 'Pending').length,     color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'In-Progress', value: issues.filter(i => i.status === 'In-Progress').length, color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { label: 'Working',     value: issues.filter(i => i.status === 'Working').length,     color: 'text-violet-600 dark:text-violet-400',bg: 'bg-violet-50 dark:bg-violet-900/20'},
    { label: 'Resolved',    value: issues.filter(i => i.status === 'Resolved').length,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Closed',      value: issues.filter(i => i.status === 'Closed').length,      color: 'text-gray-600 dark:text-gray-400',    bg: 'bg-gray-100 dark:bg-gray-700/40'  },
    { label: 'Rejected',    value: issues.filter(i => i.status === 'Rejected').length,    color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20'     },
    { label: 'Boosted',     value: issues.filter(i => i.isBoosted).length,               color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
  ];

  /* ── handlers ── */
  const handleEdit = (issue) => {
    if (singUser?.isBlocked) { toast.error('Your account is blocked.'); return; }
    if (!issue || issue.status !== 'Pending') { toast.error('Only pending issues can be edited.'); return; }
    setEditingIssue(issue);
    setFormData({ title: issue.title || '', description: issue.description || '', category: issue.category || '', priority: issue.priority || 'Normal', location: issue.location || '', images: issue.images || [] });
    setShowEditModal(true);
  };

  const handleDelete = (issueId) => {
    if (singUser?.isBlocked) { toast.error('Your account is blocked.'); return; }
    Swal.fire({
      title: 'Delete this issue?', text: 'This action cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete', reverseButtons: true
    }).then(result => {
      if (result.isConfirmed) {
        deleteIssueMutation.mutate(issueId, {
          onSuccess: () => Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false }),
          onError:   (e) => Swal.fire({ title: 'Error!',   text: e.message, icon: 'error' })
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingIssue) return;
    Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await updateIssueMutation.mutateAsync({ id: editingIssue._id, data: formData });
      Swal.fire({ title: 'Updated!', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: 'Error!', text: e.message, icon: 'error' });
    }
  };

  const inputCls  = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50";
  const selectCls = "px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

  /* ── loading / error ── */
  if (isLoading) return <MyIssuesPageSkeleton />;

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamation className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Failed to load issues</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{error?.message || 'Something went wrong.'}</p>
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg">
          <HiOutlineRefresh className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

      <div className="max-w-8xl mx-auto">

        {/* ── Blocked Warning ── */}
        {singUser?.isBlocked && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                Contact <a href="tel:+8809609333222" className="underline font-semibold">+880 9609 333222</a> or{' '}
                <a href="mailto:support@infra.gov" className="underline font-semibold">support@infra.gov</a>
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="flex justify-center sm:justify-start text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              My Reported{' '}
              <span className=" ml-1.5 text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Issues</span>
            </h1>
            <p className="flex justify-center sm:justify-start text-gray-500 dark:text-gray-400 text-sm mt-1">
              Track and manage all issues you've submitted
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/reportIssue')}
            className="flex justify-center sm:justify-start items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Zap className="w-4 h-4" /> Report New Issue
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-6">
          {statCards.map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-3 sm:p-4 border border-gray-300/50 dark:border-gray-700/50 text-center`}>
              <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search issues..."
                value={filters.search}
                onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setCurrentPage(1); }}
                className={`${inputCls} pl-10`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }} className={selectCls}>
                <option value="all">All Status</option>
                {['Pending','In-Progress','Working','Resolved','Closed','Rejected'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={filters.priority} onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setCurrentPage(1); }} className={selectCls}>
                <option value="all">All Priority</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Result count ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredIssues.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredIssues.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-900 dark:text-white">{filteredIssues.length}</span> issues
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Page {currentPage} / {totalPages || 1} · 12 per page
          </p>
        </div>

        {/* ══ ISSUE GRID — AllIssue card style ══════════════════════════ */}
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {paginatedIssues.length > 0 ? paginatedIssues.map((issue, index) => {
              if (!issue) return null;
              const sc = getStatusConfig(issue.status);
              const pc = getPriorityConfig(issue.priority);

              return (
                <motion.div
                  key={issue._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className={`relative hover:-translate-y-1 duration-300
                    ${issue.isBoosted
                      ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900 rounded-2xl'
                      : ''}`}
                >
                  {/* Boosted badge — floats above card like AllIssue */}
                  {issue.isBoosted && (
                    <div className="absolute -top-3 left-3 z-10">
                      <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <HiOutlineLightningBolt className="w-3 h-3" /> Boosted
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">

                    {/* ── Image ── */}
                    <div className="h-40 sm:h-44 relative overflow-hidden shrink-0">
                      <img
                        src={getIssueImage(issue)}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                      {/* dark overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                      {/* Status — top-right */}
                      <div className="absolute top-3 right-3">
                        <span className={`bg-linear-to-r ${sc.gradient} text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg`}>
                          {sc.icon} {sc.text}
                        </span>
                      </div>

                      {/* Priority — top-left */}
                      <div className="absolute top-3 left-3">
                        <span className={`bg-linear-to-r ${pc.gradient} text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                          {pc.icon} {pc.label}
                        </span>
                      </div>

                      {/* Category chip — bottom-left */}
                      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <span className="text-sm">{getCategoryIcon(issue.category)}</span>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{issue.category || 'Other'}</span>
                      </div>

                      {/* Image count — bottom-right */}
                      {issue.images?.length > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <HiOutlinePhotograph className="w-3 h-3" /> {issue.images.length}
                        </div>
                      )}
                    </div>

                    {/* ── Body ── */}
                    <div className="p-4 flex flex-col flex-1">

                      {/* Title + date */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                          {issue.title || 'Untitled Issue'}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                          {issue.createdAt
                            ? new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-3 flex-1">
                        {issue.description?.slice(0, 80) || 'No description.'}...
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-2">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{issue.location || 'Not specified'}</span>
                      </div>

                      {/* Reporter */}
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mb-4">
                        <HiOutlineUser className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{issue.reportedByName || user?.displayName || 'You'}</span>
                      </div>

                      {/* ── Footer ── */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 gap-2 mt-auto">

                        {/* Left: upvotes + edit/delete (pending only) */}
                        <div className="flex items-center gap-1.5">
                          {/* Upvote count (read-only display) */}
                          <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <HiOutlineThumbUp className="w-3.5 h-3.5" />
                            {issue.upVotes || 0}
                          </div>

                          {/* Edit / Delete — only for Pending */}
                          {issue.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleEdit(issue)}
                                title="Edit"
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                              >
                                <HiOutlinePencilAlt className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(issue._id)}
                                title="Delete"
                                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              >
                                <HiOutlineTrash className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* View Details — matches AllIssue exactly */}
                        <button
                          onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                          className="inline-flex items-center px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group/btn shadow-md hover:shadow-lg text-xs font-semibold"
                        >
                          View
                          <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              /* ── Empty State ── */
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 mx-auto mb-5 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl flex items-center justify-center">
                  <HiOutlineDocumentText className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  {issues.length === 0 ? 'No Issues Yet' : 'No Matching Issues'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  {issues.length === 0
                    ? 'Start by reporting your first community issue.'
                    : 'Try adjusting your search or filters.'}
                </p>
                {issues.length === 0 && (
                  <button
                    onClick={() => navigate('/dashboard/reportIssue')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <Zap className="w-4 h-4" /> Report First Issue
                  </button>
                )}
              </div>
            )}
          </div>
        </AnimatePresence>

        {/* ── Pagination ── */}
        {filteredIssues.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              {[
                { icon: <HiOutlineChevronDoubleLeft className="w-4 h-4" />, action: () => goToPage(1),              disabled: currentPage === 1          },
                { icon: <HiOutlineChevronLeft className="w-4 h-4" />,       action: () => goToPage(currentPage - 1), disabled: currentPage === 1          },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className={`p-2 rounded-lg transition-colors ${btn.disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  {btn.icon}
                </button>
              ))}

              {generatePageNumbers().map((p, i) => p === '...'
                ? <span key={`e${i}`} className="px-2 text-gray-400 dark:text-gray-500 text-sm">…</span>
                : (
                  <button key={p} onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === p
                      ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                    {p}
                  </button>
                )
              )}

              {[
                { icon: <HiOutlineChevronRight className="w-4 h-4" />,       action: () => goToPage(currentPage + 1), disabled: currentPage === totalPages },
                { icon: <HiOutlineChevronDoubleRight className="w-4 h-4" />, action: () => goToPage(totalPages),      disabled: currentPage === totalPages },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled}
                  className={`p-2 rounded-lg transition-colors ${btn.disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ Edit Modal ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-t-3xl" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Issue</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Only pending issues can be modified</p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <HiOutlineXCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title</label>
                    <input type="text" name="title" value={formData.title}
                      onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                      disabled={updateIssueMutation.isLoading} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea name="description" value={formData.description} rows={4}
                      onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                      disabled={updateIssueMutation.isLoading} className={inputCls} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                      <select name="category" value={formData.category}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        disabled={updateIssueMutation.isLoading} className={`${inputCls} appearance-none`}>
                        <option value="">Select Category</option>
                        {['Road_Damage','Streetlight','Garbage','Footpath','Drainage','Traffic','Parks','Public_Toilet','Noise','Electricity','Water_Supply','Sanitation','Infrastructure','Other'].map(c => (
                          <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Location</label>
                    <input type="text" name="location" value={formData.location}
                      onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                      disabled={updateIssueMutation.isLoading} className={inputCls} required />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={() => setShowEditModal(false)} disabled={updateIssueMutation.isLoading}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={updateIssueMutation.isLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {updateIssueMutation.isLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                        : 'Update Issue'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyIssuesPage;