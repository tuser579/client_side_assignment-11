// src/pages/AdminPage/StaffManagement.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import axios from 'axios';
import {
  FaUserPlus, FaEdit, FaTrash, FaSearch, FaUser,
  FaEnvelope, FaPhone, FaCamera, FaLock, FaEye, FaEyeSlash,
  FaChevronRight, FaChevronLeft, FaPlus, FaUsers,
  FaUserCheck, FaUserTie
} from 'react-icons/fa';
import { HiOutlineX } from 'react-icons/hi';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

/* ═══════════════════════════════════════════════
   SKELETON PRIMITIVES
═══════════════════════════════════════════════ */
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center justify-between mb-3">
      <Shimmer className="h-3 w-20 rounded-md" />
      <Shimmer className="w-10 h-10 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-16 rounded-md mb-1.5" />
    <Shimmer className="h-3 w-24 rounded-md" />
  </div>
);

const DesktopRowSkeleton = ({ index }) => (
  <tr className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/40 dark:bg-gray-800/40'}>
    <td className="py-4 px-5"><Shimmer className="w-11 h-11 rounded-xl flex-shrink-0" /></td>
    <td className="py-4 px-5">
      <div className="space-y-1.5">
        <Shimmer className="h-3.5 w-32 rounded-md" />
        <Shimmer className="h-3 w-20 rounded-md" />
      </div>
    </td>
    <td className="py-4 px-5 hidden sm:table-cell"><Shimmer className="h-3.5 w-44 rounded-md" /></td>
    <td className="py-4 px-5 hidden md:table-cell"><Shimmer className="h-3.5 w-28 rounded-md" /></td>
    <td className="py-4 px-5 hidden lg:table-cell"><Shimmer className="h-3.5 w-24 rounded-md" /></td>
    <td className="py-4 px-5">
      <div className="flex gap-2">
        <Shimmer className="h-8 w-16 rounded-xl" />
        <Shimmer className="h-8 w-20 rounded-xl" />
      </div>
    </td>
  </tr>
);

const MobileCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-start gap-3 mb-3">
      <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-32 rounded-md" />
        <Shimmer className="h-3 w-44 rounded-md" />
        <Shimmer className="h-3 w-28 rounded-md" />
      </div>
    </div>
    <div className="flex gap-2">
      <Shimmer className="flex-1 h-9 rounded-xl" />
      <Shimmer className="flex-1 h-9 rounded-xl" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════ */
const StatCard = ({ label, value, gradient, iconBg, textColor, Icon, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${gradient} border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs dark:text-white font-bold uppercase tracking-widest opacity-70">{label}</span>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className={`text-3xl font-bold ${textColor} mb-0.5`}>{value}</div>
    <div className="text-xs dark:text-white opacity-60 font-medium">{sub}</div>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════ */
const Avatar = ({ staff, size = 'md' }) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-500',
  ];
  const idx = (staff.name || '').charCodeAt(0) % gradients.length;
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-11 h-11 text-sm';

  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-white font-bold shadow-sm overflow-hidden flex-shrink-0`}>
      {staff.photoURL ? (
        <img
          src={staff.photoURL}
          alt={staff.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        staff.name?.charAt(0)?.toUpperCase() || 'S'
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   FORM FIELD WRAPPER
═══════════════════════════════════════════════ */
const Field = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
      <Icon className="w-3 h-3" />{label}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
        {error}
      </p>
    )}
  </div>
);

const inputBase = (hasError) =>
  `w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border ${
    hasError
      ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
      : 'border-gray-200 dark:border-gray-600 focus:ring-emerald-500'
  } rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all`;

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const StaffManagement = () => {
  const { registerUser, updateUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  /* ── Fetch ── */
  const { data: staffs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['staffs'],
    queryFn: async () => {
      const res = await axiosSecure.get('/staffs');
      return res.data;
    }
  });

  /* ── Create ── */
  const createStaffMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('image', data.photo[0]);
      const imageRes = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`, formData);
      const photoURL = imageRes.data.data.url;
      const { user } = await registerUser(data.email, data.password);
      await updateUserProfile({ displayName: data.name, photoURL });
      const staffData = { uid: user.uid, name: data.name, email: data.email, phone: data.phone, photoURL, role: 'staff', createdAt: new Date() };
      await axiosSecure.post('/citizensUser', staffData);
      return staffData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      Swal.fire({ icon: 'success', title: 'Created!', text: 'Staff member created successfully.', timer: 2000, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
      handleCloseModal();
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Error!', text: err.message || 'Failed to create staff.', customClass: { popup: 'rounded-2xl' } });
    }
  });

  /* ── Update ── */
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updateData = { name: data.name, phone: data.phone };
      if (data.photo?.[0]) {
        const formData = new FormData();
        formData.append('image', data.photo[0]);
        const imageRes = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`, formData);
        updateData.photoURL = imageRes.data.data.url;
      }
      await axiosSecure.patch(`/staffs/${id}`, updateData);
      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Staff member updated successfully.', timer: 2000, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
      handleCloseModal();
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Error!', text: err.message || 'Failed to update staff.', customClass: { popup: 'rounded-2xl' } });
    }
  });

  /* ── Delete ── */
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId) => { await axiosSecure.delete(`/staffs/${staffId}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Staff member removed.', timer: 2000, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
    },
    onError: (err) => {
      Swal.fire({ icon: 'error', title: 'Error!', text: err.message || 'Failed to delete staff.', customClass: { popup: 'rounded-2xl' } });
    }
  });

  /* ── Modal helpers ── */
  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setValue('name', staff.name);
      setValue('email', staff.email);
      setValue('phone', staff.phone);
      setValue('password', '');
    } else {
      reset();
      setEditingStaff(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
    setEditingStaff(null);
    setShowPassword(false);
  };

  const onSubmit = (data) => {
    if (editingStaff) updateStaffMutation.mutate({ id: editingStaff._id, data });
    else createStaffMutation.mutate(data);
  };

  const handleDeleteStaff = (staff) => {
    Swal.fire({
      title: 'Delete Staff Member?',
      html: `<div class="text-left space-y-3">
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">${staff.name?.charAt(0)?.toUpperCase() || 'S'}</div>
          <div><div class="font-semibold text-gray-900">${staff.name}</div><div class="text-xs text-gray-500">${staff.email}</div></div>
        </div>
        <p class="text-sm text-gray-600">This action is <strong>permanent</strong> and cannot be undone.</p>
      </div>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel',
      reverseButtons: true, customClass: { popup: 'rounded-2xl' }
    }).then(r => { if (r.isConfirmed) deleteStaffMutation.mutate(staff._id); });
  };

  /* ── Filter & Paginate ── */
  const filteredStaffs = useMemo(() => staffs.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [staffs, searchTerm]);

  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaffs = filteredStaffs.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'N/A'; }
  };

  const isPending = createStaffMutation.isPending || updateStaffMutation.isPending;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-6"
      >

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex-shrink-0">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Staff{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                  Management
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Manage your staff members and their accounts
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 hover:shadow-lg transition-all"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Staff
          </button>
        </div>

        {/* ══ STAT CARDS ══ */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Staff" value={staffs.length} sub="all registered"
              Icon={FaUsers}
              gradient="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              textColor="text-blue-800 dark:text-blue-100"
            />
            <StatCard
              label="Search Results" value={filteredStaffs.length} sub="matching filters"
              Icon={FaSearch}
              gradient="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800"
              iconBg="bg-gradient-to-br from-violet-500 to-purple-500"
              textColor="text-violet-800 dark:text-violet-100"
            />
            <StatCard
              label="This Page" value={paginatedStaffs.length} sub="currently shown"
              Icon={FaUserCheck}
              gradient="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800"
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
              textColor="text-emerald-800 dark:text-emerald-100"
            />
            <StatCard
              label="Total Pages" value={totalPages || 1} sub="in pagination"
              Icon={FaUserTie}
              gradient="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              textColor="text-amber-800 dark:text-amber-100"
            />
          </div>
        )}

        {/* ══ FILTER BAR ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, or phone…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                disabled={isLoading}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Per page */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">entries</span>
            </div>
          </div>

          {/* Result count */}
          {!isLoading && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <span className="font-bold text-gray-700 dark:text-gray-300">{filteredStaffs.length}</span> of{' '}
                <span className="font-bold text-gray-700 dark:text-gray-300">{staffs.length}</span> staff members
              </p>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-800">
                  <FaSearch className="w-2.5 h-2.5" />"{searchTerm}"
                  <button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="ml-0.5 hover:opacity-70">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ══ ERROR STATE ══ */}
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Error Loading Staff</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* ══ DESKTOP TABLE ══ */}
        {!error && (
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                    {[
                      { label: 'Photo',   cls: 'w-16' },
                      { label: 'Name',    cls: '' },
                      { label: 'Email',   cls: 'hidden sm:table-cell' },
                      { label: 'Phone',   cls: 'hidden md:table-cell' },
                      { label: 'Joined',  cls: 'hidden lg:table-cell' },
                      { label: 'Actions', cls: '' },
                    ].map(({ label, cls }) => (
                      <th
                        key={label}
                        className={`px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ${cls}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <DesktopRowSkeleton key={i} index={i} />)
                  ) : paginatedStaffs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <FaSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="font-semibold text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No staff found matching your search' : 'No staff members yet'}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {searchTerm ? 'Try a different keyword' : 'Click "Add Staff" to get started'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedStaffs.map((staff, idx) => (
                      <motion.tr
                        key={staff._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: idx * 0.03 }}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        {/* Photo */}
                        <td className="py-4 px-5">
                          <Avatar staff={staff} />
                        </td>

                        {/* Name */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{staff.name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">#{staff._id?.substring(0, 8)}</div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-5 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400 block truncate max-w-[200px]">{staff.email}</span>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{staff.phone || 'N/A'}</span>
                        </td>

                        {/* Joined */}
                        <td className="py-4 px-5 hidden lg:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(staff.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(staff)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                            >
                              <FaEdit className="w-3 h-3" />Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff)}
                              disabled={deleteStaffMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                            >
                              <FaTrash className="w-3 h-3" />Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ MOBILE CARDS ══ */}
        {!error && (
          <div className="md:hidden space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <MobileCardSkeleton key={i} />)
            ) : paginatedStaffs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FaSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No results found' : 'No staff members yet'}
                </p>
              </div>
            ) : (
              paginatedStaffs.map((staff, idx) => (
                <motion.div
                  key={staff._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: idx * 0.04 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar staff={staff} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{staff.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{staff.email}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {staff.phone || 'No phone'} · {formatDate(staff.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(staff)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                    >
                      <FaEdit className="w-3.5 h-3.5" />Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff)}
                      disabled={deleteStaffMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                    >
                      <FaTrash className="w-3.5 h-3.5" />Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* ══ PAGINATION ══ */}
        {!isLoading && !error && filteredStaffs.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 shadow-sm transition-colors">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing{' '}
              <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredStaffs.length)}</span>
              {' '}of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{filteredStaffs.length}</span> members
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (currentPage <= 3) p = i + 1;
                else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                else p = currentPage - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === p
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/40'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="text-gray-400 dark:text-gray-500 px-1 text-sm">…</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === totalPages
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            {/* Modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                    {editingStaff
                      ? <FaEdit className="w-4 h-4 text-white" />
                      : <FaUserPlus className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {editingStaff ? 'Update staff information below' : 'Fill in details to create a new account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                  {/* Full Name */}
                  <Field label="Full Name *" icon={FaUser} error={errors.name?.message}>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="John Doe"
                      className={inputBase(!!errors.name)}
                    />
                  </Field>

                  {/* Photo Upload */}
                  <Field label={`Profile Photo${!editingStaff ? ' *' : ''}`} icon={FaCamera} error={errors.photo?.message}>
                    <input
                      type="file"
                      accept="image/*"
                      {...register('photo', { required: !editingStaff ? 'Photo is required' : false })}
                      className="w-full text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
                    />
                    {editingStaff && (
                      <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Leave empty to keep current photo</p>
                    )}
                  </Field>

                  {/* Email + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email Address *" icon={FaEnvelope} error={errors.email?.message}>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                        })}
                        placeholder="staff@company.com"
                        disabled={!!editingStaff}
                        className={`${inputBase(!!errors.email)} ${editingStaff ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </Field>

                    <Field label="Phone Number *" icon={FaPhone} error={errors.phone?.message}>
                      <input
                        type="tel"
                        {...register('phone', {
                          required: 'Phone is required',
                          pattern: { value: /^[0-9+\-\s()]{10,}$/, message: 'Invalid phone number' }
                        })}
                        placeholder="+1 555 123-4567"
                        className={inputBase(!!errors.phone)}
                      />
                    </Field>
                  </div>

                  {/* Password (create only) */}
                  {!editingStaff && (
                    <Field label="Password *" icon={FaLock} error={errors.password?.message}>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'At least 6 characters required' }
                          })}
                          placeholder="••••••••"
                          className={`${inputBase(!!errors.password)} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                  )}

                  {/* Footer buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : editingStaff ? (
                        <><FaEdit className="w-3.5 h-3.5" />Update Staff</>
                      ) : (
                        <><FaPlus className="w-3.5 h-3.5" />Create Staff</>
                      )}
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

export default StaffManagement;