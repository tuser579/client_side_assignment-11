import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch, HiOutlineFilter, HiOutlineX,
  HiOutlineBan, HiOutlineCheckCircle, HiOutlineUser,
  HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineStar,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

/* ═══════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════ */
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
);

const StatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center justify-between mb-3">
      <Shimmer className="h-3 w-20 rounded-md" />
      <Shimmer className="w-10 h-10 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-16 rounded-md mb-1" />
    <Shimmer className="h-3 w-24 rounded-md" />
  </div>
);

const RowSkeleton = () => (
  <tr className="border-b border-gray-100 dark:border-gray-700/60">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5">
          <Shimmer className="h-3.5 w-32 rounded-md" />
          <Shimmer className="h-3 w-20 rounded-md" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4 hidden sm:table-cell"><Shimmer className="h-3.5 w-44 rounded-md" /></td>
    <td className="px-5 py-4 hidden md:table-cell"><Shimmer className="h-6 w-20 rounded-full" /></td>
    <td className="px-5 py-4 hidden lg:table-cell"><Shimmer className="h-3.5 w-24 rounded-md" /></td>
    <td className="px-5 py-4 hidden lg:table-cell"><Shimmer className="h-6 w-14 rounded-full" /></td>
    <td className="px-5 py-4"><Shimmer className="h-9 w-28 rounded-xl" /></td>
  </tr>
);

const MobileCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-start gap-3 mb-3">
      <Shimmer className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-4 w-32 rounded-md" />
        <Shimmer className="h-3 w-40 rounded-md" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <Shimmer className="h-6 w-20 rounded-full" />
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
    <Shimmer className="h-9 w-full rounded-xl" />
  </div>
);

/* ═══════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════ */
const StatCard = ({ label, value, icon: Icon, gradient, iconBg, textColor, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${gradient} border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className={`text-3xl font-bold ${textColor} mb-0.5`}>
      {isLoading ? <span className="opacity-40">—</span> : value.toLocaleString()}
    </div>
    <div className="text-xs opacity-60 font-medium">matching current filters</div>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════ */
const Badge = ({ children, variant }) => {
  const variants = {
    premium:   'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
    regular:   'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
    blocked:   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    unblocked: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════ */
const Avatar = ({ user }) => {
  const colors = [
    'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500', 'from-indigo-500 to-blue-500',
  ];
  const idx = (user.name || '').charCodeAt(0) % colors.length;
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden flex-shrink-0`}>
      {user.photoURL ? (
        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        user.name?.charAt(0)?.toUpperCase() || 'U'
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const MySwal = withReactContent(Swal);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [blockedFilter, setBlockedFilter] = useState('all');

  const USERS_PER_PAGE = 10;

  /* ── Data fetching ── */
  const { data: usersData, isLoading, isError, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await axiosSecure.get('/allUsers');
      return res.data;
    },
  });

  /* ── Client-side filter ── */
  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter(user => {
      if (searchTerm) {
        const sl = searchTerm.toLowerCase();
        if (!(user.name?.toLowerCase().includes(sl) || user.email?.toLowerCase().includes(sl))) return false;
      }
      if (subscriptionFilter !== 'all') {
        if (user.isPremium !== (subscriptionFilter === 'premium')) return false;
      }
      if (blockedFilter !== 'all') {
        if (user.isBlocked !== (blockedFilter === 'blocked')) return false;
      }
      return true;
    });
  }, [usersData, searchTerm, subscriptionFilter, blockedFilter]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  /* ── Reset page on filter change ── */
  useEffect(() => { setCurrentPage(1); }, [searchTerm, subscriptionFilter, blockedFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:   filteredUsers.length,
    blocked: filteredUsers.filter(u => u.isBlocked).length,
    premium: filteredUsers.filter(u => u.isPremium).length,
    active:  filteredUsers.filter(u => !u.isBlocked).length,
  }), [filteredUsers]);

  /* ── Mutation ── */
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ _id, isBlocked }) => {
      const res = await axiosSecure.patch(`/updateUser/${_id}`, { isBlocked: !isBlocked });
      return res.data;
    },
    onMutate: async ({ _id, isBlocked }) => {
      await queryClient.cancelQueries({ queryKey: ['allUsers'] });
      const prev = queryClient.getQueryData(['allUsers']);
      queryClient.setQueryData(['allUsers'], old =>
        old.map(u => u._id === _id ? { ...u, isBlocked: !isBlocked } : u)
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['allUsers'], ctx.prev);
      MySwal.fire({ title: 'Error!', text: 'Failed to update user.', icon: 'error', confirmButtonColor: '#ef4444', customClass: { popup: 'rounded-2xl' } });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      MySwal.fire({ title: 'Done!', text: `User ${vars.isBlocked ? 'unblocked' : 'blocked'} successfully.`, icon: 'success', timer: 2000, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['allUsers'] }),
  });

  /* ── Toggle block ── */
  const handleToggleBlock = async (user) => {
    const result = await MySwal.fire({
      title: `${user.isBlocked ? 'Unblock' : 'Block'} User?`,
      html: `<div class="text-left space-y-3">
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">${user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div><div class="font-semibold text-gray-900">${user.name || 'Unknown'}</div><div class="text-xs text-gray-500">${user.email || 'N/A'}</div></div>
        </div>
        <p class="text-sm text-gray-600">Are you sure you want to <strong>${user.isBlocked ? 'unblock' : 'block'}</strong> this user? ${user.isBlocked ? 'They will regain full access.' : 'They will lose access to most features.'}</p>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.isBlocked ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${user.isBlocked ? 'Unblock' : 'Block'}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: { popup: 'rounded-2xl' },
    });
    if (result.isConfirmed) {
      updateUserStatusMutation.mutate({ _id: user._id, isBlocked: user.isBlocked });
    }
  };

  /* ── Helpers ── */
  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid'; }
  };

  const clearFilters = () => { setSearchTerm(''); setSubscriptionFilter('all'); setBlockedFilter('all'); };
  const hasFilters = searchTerm || subscriptionFilter !== 'all' || blockedFilter !== 'all';

  /* ── Pagination renderer ── */
  const renderPagination = () => {
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
      <div className="flex items-center gap-1.5">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <HiOutlineChevronLeft className="w-4 h-4" />
        </button>

        {start > 1 && <>
          <button onClick={() => setCurrentPage(1)} className="w-9 h-9 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">1</button>
          {start > 2 && <span className="text-gray-400 dark:text-gray-500 px-1">…</span>}
        </>}

        {pages.map(p => (
          <button key={p} onClick={() => setCurrentPage(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === p ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
            {p}
          </button>
        ))}

        {end < totalPages && <>
          {end < totalPages - 1 && <span className="text-gray-400 dark:text-gray-500 px-1">…</span>}
          <button onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">{totalPages}</button>
        </>}

        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <HiOutlineChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
              <HiOutlineUserGroup className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Users</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage citizen users and their subscriptions</p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"    value={stats.total}   icon={HiOutlineUserGroup}   isLoading={isLoading}
              gradient="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 text-blue-900 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800 dark:text-blue-100"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-500" textColor="text-blue-800 dark:text-blue-100" />
            <StatCard label="Active Users"   value={stats.active}  icon={HiOutlineShieldCheck} isLoading={isLoading}
              gradient="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800 dark:text-emerald-100"
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-500" textColor="text-emerald-800 dark:text-emerald-100" />
            <StatCard label="Premium Users"  value={stats.premium} icon={HiOutlineStar}        isLoading={isLoading}
              gradient="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 text-violet-900 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800 dark:text-violet-100"
              iconBg="bg-gradient-to-br from-violet-500 to-purple-500" textColor="text-violet-800 dark:text-violet-100" />
            <StatCard label="Blocked Users"  value={stats.blocked} icon={HiOutlineBan}         isLoading={isLoading}
              gradient="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-900 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800 dark:text-red-100"
              iconBg="bg-gradient-to-br from-red-500 to-rose-500" textColor="text-red-800 dark:text-red-100" />
          </div>
        )}

        {/* ── Main Card ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors overflow-hidden">

          {/* ── Filter Bar ── */}
          <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selects */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                {[
                  { value: subscriptionFilter, setter: setSubscriptionFilter, options: [['all','All Plans'],['premium','Premium'],['regular','Regular']] },
                  { value: blockedFilter,       setter: setBlockedFilter,       options: [['all','All Users'],['unblocked','Active'],['blocked','Blocked']] },
                ].map(({ value, setter, options }, i) => (
                  <div key={i} className="relative flex-1 min-w-[120px]">
                    <select value={value} onChange={e => setter(e.target.value)} disabled={isLoading}
                      className="w-full pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50">
                      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <HiOutlineFilter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                ))}

                {hasFilters && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all whitespace-nowrap">
                    <HiOutlineX className="w-3.5 h-3.5" />Clear
                  </button>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            <AnimatePresence>
              {hasFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest self-center">Filters:</span>
                  {searchTerm && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800"><HiOutlineSearch className="w-3 h-3" />"{searchTerm}"<button onClick={() => setSearchTerm('')} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button></span>}
                  {subscriptionFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold rounded-full border border-violet-100 dark:border-violet-800"><HiOutlineStar className="w-3 h-3" />{subscriptionFilter === 'premium' ? 'Premium' : 'Regular'}<button onClick={() => setSubscriptionFilter('all')} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button></span>}
                  {blockedFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full border border-red-100 dark:border-red-800"><HiOutlineBan className="w-3 h-3" />{blockedFilter === 'blocked' ? 'Blocked' : 'Active'}<button onClick={() => setBlockedFilter('all')} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button></span>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════════ ERROR ════════ */}
          {isError && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HiOutlineX className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Failed to load users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error?.message || 'Unknown error'}</p>
            </div>
          )}

          {/* ════════ DESKTOP TABLE ════════ */}
          {!isError && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                    {[
                      { label: 'User',         cls: '' },
                      { label: 'Email',        cls: 'hidden sm:table-cell' },
                      { label: 'Plan',         cls: 'hidden md:table-cell' },
                      { label: 'Joined',       cls: 'hidden lg:table-cell' },
                      { label: 'Status',       cls: 'hidden lg:table-cell' },
                      { label: 'Action',       cls: '' },
                    ].map(({ label, cls }) => (
                      <th key={label} className={`px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ${cls}`}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading ? (
                    Array.from({ length: USERS_PER_PAGE }).map((_, i) => <RowSkeleton key={i} />)
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <HiOutlineFilter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No users found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, idx) => (
                      <motion.tr key={user._id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: idx * 0.03 }}
                        className={`hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors ${user.isBlocked ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>

                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[140px]">{user.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">ID: {user._id?.substring(0, 8) || 'N/A'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] block">{user.email || 'N/A'}</span>
                        </td>

                        {/* Plan */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <Badge variant={user.isPremium ? 'premium' : 'regular'}>
                            {user.isPremium ? <><HiOutlineStar className="w-3 h-3" />Premium</> : 'Regular'}
                          </Badge>
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(user.memberSince)}</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <Badge variant={user.isBlocked ? 'blocked' : 'unblocked'}>
                            {user.isBlocked ? <><HiOutlineBan className="w-3 h-3" />Blocked</> : <><HiOutlineCheckCircle className="w-3 h-3" />Active</>}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={updateUserStatusMutation.isPending}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isBlocked
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200 dark:shadow-emerald-900/30'
                                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-red-200 dark:shadow-red-900/30'
                            }`}
                          >
                            {updateUserStatusMutation.isPending ? (
                              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : user.isBlocked ? (
                              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <HiOutlineBan className="w-3.5 h-3.5" />
                            )}
                            {updateUserStatusMutation.isPending ? 'Processing…' : user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ════════ MOBILE CARDS ════════ */}
          {!isError && (
            <div className="md:hidden p-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <MobileCardSkeleton key={i} />)
              ) : paginatedUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <HiOutlineFilter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No users found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <motion.div key={user._id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: idx * 0.04 }}
                    className={`rounded-xl border shadow-sm p-4 transition-colors ${user.isBlocked ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>

                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar user={user} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{user.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || 'N/A'}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Joined: {formatDate(user.memberSince)}</div>
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={user.isPremium ? 'premium' : 'regular'}>
                        {user.isPremium ? <><HiOutlineStar className="w-3 h-3" />Premium</> : 'Regular'}
                      </Badge>
                      <Badge variant={user.isBlocked ? 'blocked' : 'unblocked'}>
                        {user.isBlocked ? <><HiOutlineBan className="w-3 h-3" />Blocked</> : <><HiOutlineCheckCircle className="w-3 h-3" />Active</>}
                      </Badge>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => handleToggleBlock(user)}
                      disabled={updateUserStatusMutation.isPending}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isBlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
                      }`}
                    >
                      {updateUserStatusMutation.isPending ? (
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : user.isBlocked ? (
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <HiOutlineBan className="w-3.5 h-3.5" />
                      )}
                      {updateUserStatusMutation.isPending ? 'Processing…' : user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ── Footer / Pagination ── */}
          {!isLoading && !isError && filteredUsers.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}–{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> users
              </p>
              {totalPages > 1 && renderPagination()}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default ManageUsers;