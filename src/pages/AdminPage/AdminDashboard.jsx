import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineCurrencyDollar,
    HiOutlineArrowRight,
    HiOutlineEye,
} from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    FaUserPlus,
    FaTimesCircle,
    FaClock,
    FaCheckCircle,
    FaTimes as FaTimesIcon,
    FaExclamationTriangle,
    FaSpinner,
    FaCog,
    FaLock,
    FaBan,
    FaInfoCircle
} from 'react-icons/fa';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import DeleteConfirmationModal from '../CitizenPage/Payment/DeleteConfirmationModal';
import PaymentReceiptModal from '../CitizenPage/Payment/PaymentReceiptModal';
import { Download, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const AdminDashboard = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const MySwal = withReactContent(Swal);

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [selectedStaffId, setSelectedStaffId] = useState('');

    // Fetch all issues
    const { data: stats = [], isLoading: issuesLoading } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => {
            const response = await axiosSecure.get('/allIssues');
            return response.data;
        },
    });

    // Fetch all staff members
    const { data: staffs = [], isLoading: staffsLoading } = useQuery({
        queryKey: ['staffs'],
        queryFn: async () => {
            const response = await axiosSecure.get('/staffs');
            return response.data;
        },
    });

    // Fetch all payments
    const { data: payments = [], isLoading: paymentsLoading } = useQuery({
        queryKey: ['allPayment'],
        queryFn: async () => {
            const response = await axiosSecure.get(`/allPayment?email${user?.email}`);
            return response.data;
        },
        enabled: !!user,
    });

    // Fetch all citizenUsers
    const { data: allUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const response = await axiosSecure.get('/allUsers');
            return response.data;
        },
        enabled: !!user,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (paymentId) => {
            await axiosSecure.delete(`/myPaymentDelete/${paymentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myPayments', user.email]);
            setShowDeleteModal(false);
        }
    });

    // Assign staff mutation
    const assignStaffMutation = useMutation({
        mutationFn: async ({ issueId, staffId, staffName, staffEmail, timelineEntry }) => {
            // Add tracking record to timeline
            const timeline = {
                action: 'Staff_Assigned',
                timestamp: new Date(),
                note: `Issue assigned to ${staffEmail} by admin`,
                by: user.email
            };

            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                updatedAt: new Date(),
                assignedStaffId: staffId,
                assignedStaffName: staffName,
                assignedStaffEmail: staffEmail,
                timelineEntry: [...timelineEntry, timeline]
            });
            return { issueId, staffId, staffName };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['allIssues'] });
            setShowAssignModal(false);
            setSelectedIssue(null);
            setSelectedStaffId('');

            Swal.fire({
                icon: 'success',
                title: 'Staff Assigned',
                text: `Issue assigned to ${data.staffName} successfully!`,
                timer: 2000,
                showConfirmButton: false,
                background: '#f0fdf4',
                color: '#14532d',
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Assignment Failed',
                text: `Failed to assign staff: ${error.message}`,
                confirmButtonColor: '#ef4444',
                background: '#fef2f2',
                color: '#7f1d1d',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-4 py-2.5 rounded-xl font-medium'
                }
            });
        }
    });

    // Reject issue mutation
    const rejectIssueMutation = useMutation({
        mutationFn: async ({ issueId, timelineEntry }) => {

            // Add tracking record to timeline
            const entry = {
                action: 'Rejected',
                timestamp: new Date(),
                note: 'Issue rejected by admin',
                by: user.email
            };

            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                status: 'Rejected',
                updatedAt: new Date(),
                timelineEntry: [...timelineEntry, entry]
            });

            return issueId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allIssues'] });

            Swal.fire({
                icon: 'success',
                title: 'Issue Rejected',
                text: 'Issue rejected successfully!',
                timer: 2000,
                showConfirmButton: false,
                background: '#f0fdf4',
                color: '#14532d',
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Rejection Failed',
                text: `Failed to reject issue: ${error.message}`,
                confirmButtonColor: '#ef4444',
                background: '#fef2f2',
                color: '#7f1d1d',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-4 py-2.5 rounded-xl font-medium'
                }
            });
        }
    });

    // Handle delete
    const handleDeleteClick = (payment) => {
        setSelectedPayment(payment);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedPayment) {
            deleteMutation.mutate(selectedPayment._id);
        }
    };

    // Mutation for updating user block status
    const updateUserStatusMutation = useMutation({
        mutationFn: async ({ _id, isBlocked }) => {
            const response = await axiosSecure.patch(`/updateUser/${_id}`, {
                isBlocked: !isBlocked
            });
            return response.data;
        },
        onMutate: async ({ _id, isBlocked }) => {
            await queryClient.cancelQueries({ queryKey: ['allUsers'] });
            const previousUsers = queryClient.getQueryData(['allUsers']);
            queryClient.setQueryData(['allUsers'], (old) =>
                old.map(users =>
                    users._id === _id
                        ? { ...users, isBlocked: !isBlocked }
                        : users
                )
            );
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['allUsers'], context.previousUsers);
            }
            MySwal.fire({
                title: 'Error!',
                text: 'Failed to update user status. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ef4444',
                background: '#fef2f2',
                color: '#7f1d1d',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-4 py-2.5 rounded-xl font-medium'
                }
            });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
            MySwal.fire({
                title: 'Success!',
                text: `User has been ${variables.isBlocked ? 'unblocked' : 'blocked'} successfully.`,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#f0fdf4',
                color: '#14532d',
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
        }
    });

    // Handle assign staff button click
    const handleAssignStaff = (issue) => {
        setSelectedIssue(issue);
        setSelectedStaffId('');
        setShowAssignModal(true);
    };

    // Handle confirm assignment
    const handleConfirmAssignment = () => {
        if (!selectedStaffId) {
            Swal.fire({
                icon: 'warning',
                title: 'Select Staff',
                text: 'Please select a staff member',
                timer: 2000,
                showConfirmButton: false,
                background: '#fef3c7',
                color: '#92400e',
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
            return;
        }

        const selectedStaff = staffs.find(staff => staff._id === selectedStaffId);
        if (!selectedStaff) return;

        assignStaffMutation.mutate({
            issueId: selectedIssue._id,
            staffId: selectedStaff._id,
            staffName: selectedStaff.name,
            staffEmail: selectedStaff.email,
            timelineEntry: selectedIssue.timelineEntry
        });
    };

    // Handle reject issue
    const handleRejectIssue = (issue) => {
        Swal.fire({
            title: 'Reject Issue?',
            text: `Are you sure you want to reject "${issue.title}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject it!',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1e293b',
            iconColor: '#f59e0b'
        }).then((result) => {
            if (result.isConfirmed) {
                rejectIssueMutation.mutate({
                    issueId: issue._id,
                    timelineEntry: issue.timelineEntry
                });
            }
        });
    };

    // Handle block/unblock with SweetAlert2 confirmation
    const handleToggleBlock = async (sing) => {
        const result = await MySwal.fire({
            title: `${sing.isBlocked ? 'Unblock' : 'Block'} User?`,
            html: `
                <div class="text-left space-y-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full bg-linear-to-br ${sing.isBlocked ? 'from-emerald-500 to-emerald-600' : 'from-rose-500 to-rose-600'} flex items-center justify-center text-white font-bold">
                            ${sing.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900">${sing.name || 'Unknown User'}</h4>
                            <p class="text-sm text-gray-600">${sing.email || 'N/A'}</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-700">
                        Are you sure you want to ${sing.isBlocked ? 'unblock' : 'block'} this user?
                        ${sing.isBlocked ? 'They will regain access to all features.' : 'They will lose access to most features.'}
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: sing.isBlocked ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${sing.isBlocked ? 'unblock' : 'block'}`,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            background: '#f8fafc',
            color: '#0f172a',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105',
                cancelButton: 'px-4 py-2.5 rounded-xl font-medium',
            },
            buttonsStyling: false,
            showCloseButton: true,
        });

        if (result.isConfirmed) {
            updateUserStatusMutation.mutate({
                _id: sing._id,
                isBlocked: sing.isBlocked
            });
        }
    };

    // Calculate counts from stats data
    const totalIssues = stats.length || 0;
    const pendingIssues = stats.filter(issue => issue.status === 'Pending').length;
    const resolvedIssues = stats.filter(issue => issue.status === 'Resolved' || issue.status === 'resolved').length;
    const rejectedIssues = stats.filter(issue => issue.status === 'Rejected' || issue.status === 'rejected').length;
    const totalRevenue = payments.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);

    // Get latest issues (most recent 3)
    const latestIssues = [...stats]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    // Get latest payments (most recent 3)
    const latestPayments = [...payments]
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        .slice(0, 3);

    // Get latest citizenUsers (most recent 3)
    const latestUsers = [...allUsers]
        .sort((a, b) => new Date(b.memberSince) - new Date(a.memberSince))
        .slice(0, 3);

    // Issues Status Data for Bar Chart
    const issuesStatusData = [
        { status: 'Total', count: totalIssues, color: '#3B82F6' },
        { status: 'Pending', count: pendingIssues, color: '#F59E0B' },
        { status: 'Resolved', count: resolvedIssues, color: '#10B981' },
        { status: 'Rejected', count: rejectedIssues, color: '#EF4444' },
    ];

    // Calculate issues by category dynamically from stats
    const categoryCounts = {};
    stats.forEach(issue => {
        if (issue.category) {
            categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
        }
    });

    // Convert to array for pie chart
    const issuesByCategory = Object.entries(categoryCounts).map(([name, value], index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        return {
            name,
            value,
            color: colors[index % colors.length]
        };
    });

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date with time
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' at ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Invalid date';
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const config = {
            "Pending": { color: 'bg-amber-100 text-amber-800', icon: <FaClock className="w-3 h-3" /> },
            "In-Progress": { color: 'bg-blue-100 text-blue-800', icon: <FaSpinner className="w-3 h-3" /> },
            "Working": { color: 'bg-indigo-100 text-indigo-800', icon: <FaCog className="w-3 h-3" /> },
            "Resolved": { color: 'bg-emerald-100 text-emerald-800', icon: <FaCheckCircle className="w-3 h-3" /> },
            "Closed": { color: 'bg-gray-100 text-gray-800', icon: <FaLock className="w-3 h-3" /> },
            "Rejected": { color: 'bg-rose-100 text-rose-800', icon: <FaBan className="w-3 h-3" /> }
        };

        const { color, icon } = config[status] || { color: 'bg-gray-100 text-gray-800', icon: null };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const config = {
            'High': {
                color: 'bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 border border-red-200',
                icon: <FaExclamationTriangle className="w-3 h-3 text-red-500" />,
                label: 'High'
            },
            'Normal': {
                color: 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 border border-blue-200',
                icon: <FaInfoCircle className="w-3 h-3 text-blue-500" />,
                label: 'Normal'
            }
        };

        // Normalize priority input (handle different cases)
        const normalizedPriority = priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
        const { color, icon, label } = config[normalizedPriority] || config['Normal'];

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
                {icon}
                {label}
            </span>
        );
    };

    // Loading state
    if (issuesLoading || paymentsLoading || usersLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-10 w-64 bg-gray-200 rounded mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="h-96 bg-gray-200 rounded-xl"></div>
                            <div className="h-96 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Dashboard Overview
                        </h1>
                    </div>
                </div>

                {/* Row 1: Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Total Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow p-5 border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-7">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 mb-1">{totalIssues}</span>
                        </div>
                        <div className="text-sm text-gray-600">Total Issues</div>
                        <div className="mt-2 text-xs text-gray-500">All reported issues</div>
                    </motion.div>

                    {/* Pending Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow p-5 border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-7">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <HiOutlineClock className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 mb-1">{pendingIssues}</span>
                        </div>
                        <div className="text-sm text-gray-600">Pending Issues</div>
                        <div className="mt-2 text-xs text-gray-500">Awaiting action</div>
                    </motion.div>

                    {/* Resolved Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow p-5 border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-7">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 mb-1">{resolvedIssues}</span>
                        </div>
                        <div className="text-sm text-gray-600">Resolved Issues</div>
                        <div className="mt-2 text-xs text-gray-500">Successfully resolved</div>
                    </motion.div>

                    {/* Rejected Issues Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow p-5 border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-7">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <HiOutlineXCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 mb-1">{rejectedIssues}</span>
                        </div>
                        <div className="text-sm text-gray-600">Rejected Issues</div>
                        <div className="mt-2 text-xs text-gray-500">Not approved</div>
                    </motion.div>

                    {/* Total Revenue Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow p-5 text-white"
                    >
                        <div className="flex items-center justify-between mb-7">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <HiOutlineCurrencyDollar className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold mb-1">
                                {formatCurrency(totalRevenue)}
                            </span>
                        </div>
                        <div className="text-sm text-blue-100">Total Revenue</div>
                        <div className="mt-2 text-xs text-blue-200">All time revenue</div>
                    </motion.div>
                </div>

                {/* Row 2: Issue Status Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow p-5 mb-6 border border-gray-200"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Issues Status Distribution</h3>
                        <p className="text-sm text-gray-600">Current status of all reported issues</p>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issuesStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="status"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#6b7280' }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#6b7280' }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value} issues`, 'Count']}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        backgroundColor: 'white'
                                    }}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Issue Count"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {issuesStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {issuesStatusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                                </div>
                                <span className="text-lg font-bold" style={{ color: item.color }}>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Row 3: Issue Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl shadow p-5 mb-6 border border-gray-200"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Issues by Category</h3>
                        <p className="text-sm text-gray-600">
                            {issuesByCategory.length > 0
                                ? `Distribution of issues across ${issuesByCategory.length} categories`
                                : 'No category data available'
                            }
                        </p>
                    </div>
                    {issuesByCategory.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={issuesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            innerRadius={30}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {issuesByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} issues`, 'Count']}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                backgroundColor: 'white'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
                                {issuesByCategory.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-sm"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {category.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {category.value} issues
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {totalIssues > 0
                                                    ? ((category.value / totalIssues) * 100).toFixed(1)
                                                    : 0
                                                }%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No category data available
                        </div>
                    )}
                </motion.div>

                {/* Row 4: Recent Issues Table - Updated with Assign/Reject buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Recent Issues</h3>
                                    <p className="text-sm text-gray-600">Last 3 reported issues</p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/issuesManagement')}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                >
                                    View All Issues <HiOutlineArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                                            Issue Title
                                        </th>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                                            Category
                                        </th>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                                            Status
                                        </th>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">
                                            Priority
                                        </th>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">Assigned Staff</th>
                                        <th className="py-4 px-6 text-left text-gray-700 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestIssues.length > 0 ? (
                                        latestIssues.map((issue) => (
                                            <tr
                                                key={issue._id}
                                                className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${issue.isBoosted ? 'bg-purple-50 hover:bg-purple-100' : ''
                                                    }`}
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-gray-900">{issue.title}</div>
                                                    {issue.isBoosted && (
                                                        <div className="text-xs text-purple-600 mt-1">⭐ Boosted Issue</div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                        {issue.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <StatusBadge status={issue.status} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <PriorityBadge priority={issue.priority} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    {issue.assignedStaffId ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                                {issue.assignedStaffName?.charAt(0) || 'S'}
                                                            </div>
                                                            <span className="text-gray-700">{issue.assignedStaffName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2">
                                                        {/* View Details Button */}
                                                        <button
                                                            onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                                                            className="px-3 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                                                        >
                                                            <HiOutlineEye className="w-3 h-3" />
                                                            <span className="font-medium text-sm">View</span>
                                                        </button>

                                                        {/* Assign Staff Button - Only show if not assigned */}
                                                        {!issue.assignedStaffId && (
                                                            <button
                                                                onClick={() => handleAssignStaff(issue)}
                                                                disabled={assignStaffMutation.isPending}
                                                                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaUserPlus className="w-3 h-3" />
                                                                Assign Staff
                                                            </button>
                                                        )}

                                                        {/* Reject Button - Only show if status is pending */}
                                                        {issue.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleRejectIssue(issue)}
                                                                disabled={rejectIssueMutation.isPending}
                                                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaTimesCircle className="w-3 h-3" />
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center">
                                                <div className="text-gray-500">
                                                    No issues found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Row 5: Recent Payments Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-xl shadow mb-6 border border-gray-200"
                >
                    <div className="px-5 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
                            <button
                                onClick={() => navigate('/dashboard/paymentsPage')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                View All Payments<HiOutlineArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User Email</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {latestPayments.length > 0 ? (
                                    latestPayments.map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {payment.transactionId || `PAY-${index + 1}`}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm text-gray-700 truncate max-w-xs">
                                                    {payment.customerEmail || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-bold text-green-600">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.type === 'Premium Subscription'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : payment.type === 'Boost Issue'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                    {payment.type || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatDate(payment.paidAt)}
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setShowReceiptModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(payment)}
                                                        disabled={deleteMutation.isLoading}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete Payment"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                                            No payments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </motion.div>

                {/* Row 6: Recent user Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-xl shadow mb-6 border border-gray-200"
                >
                    <div className="px-5 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">New User</h3>
                            <button
                                onClick={() => navigate('/dashboard/manageUsers')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                View All Users<HiOutlineArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Joined</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Blocked</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {latestUsers.length > 0 ? (
                                    latestUsers.map((sing, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {sing.photoURL ? (
                                                        <img
                                                            src={sing.photoURL}
                                                            alt={sing.name}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {sing.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {sing.name || 'Unknown User'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm text-gray-700 truncate max-w-xs">
                                                    {sing.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sing.isPremium
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {sing.isPremium ? 'Premium' : 'Regular'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatDate(sing.memberSince)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sing.isBlocked
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {sing.isBlocked ? 'YES' : 'N0'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggleBlock(sing)}
                                                    disabled={updateUserStatusMutation.isLoading}
                                                    className={`
    relative inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${!sing.isBlocked
                                                            ? 'bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-md hover:shadow-lg'
                                                            : 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500 shadow-md hover:shadow-lg'
                                                        }
  `}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {updateUserStatusMutation.isLoading ? (
                                                            <>
                                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {!sing.isBlocked ? (
                                                                    <>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                                                        </svg>
                                                                        Block User
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                        </svg>
                                                                        Unblock User
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </motion.div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    payment={selectedPayment}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedPayment(null);
                    }}
                    onConfirm={confirmDelete}
                    isLoading={deleteMutation.isLoading}
                />
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <PaymentReceiptModal
                    payment={selectedPayment}
                    onClose={() => {
                        setShowReceiptModal(false);
                        setSelectedPayment(null);
                    }}
                />
            )}

            {/* Assign Staff Modal */}
            {showAssignModal && (
                <div className="modal modal-open">
                    <div className="modal-backdrop bg-black/50" onClick={() => setShowAssignModal(false)}></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="modal-box max-w-md p-0 overflow-hidden bg-white border border-gray-200 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                                        <FaUserPlus className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Assign Staff</h3>
                                        <p className="text-gray-600">Assign staff to: {selectedIssue?.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {staffsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Staff Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            Select Staff Member *
                                        </label>
                                        <select
                                            value={selectedStaffId}
                                            onChange={(e) => setSelectedStaffId(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            disabled={staffs.length === 0}
                                        >
                                            <option value="">Select a staff member</option>
                                            {staffs.map((staff) => (
                                                <option key={staff._id} value={staff._id}>
                                                    {staff.name} - {staff.email}
                                                </option>
                                            ))}
                                        </select>
                                        {staffs.length === 0 && (
                                            <p className="mt-2 text-sm text-amber-600">No active staff members available</p>
                                        )}
                                        <p className="mt-2 text-sm text-gray-500">
                                            {staffs.length} available staff member(s)
                                        </p>
                                    </div>

                                    {/* Selected Staff Preview */}
                                    {selectedStaffId && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {staffs.find(s => s._id === selectedStaffId)?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {staffs.find(s => s._id === selectedStaffId)?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {staffs.find(s => s._id === selectedStaffId)?.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                This staff member will be assigned to handle the issue.
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setShowAssignModal(false)}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                                            disabled={assignStaffMutation.isPending}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmAssignment}
                                            disabled={!selectedStaffId || assignStaffMutation.isPending}
                                            className={`px-8 py-3 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold shadow-sm hover:shadow transition-all ${(!selectedStaffId || assignStaffMutation.isPending) ? 'opacity-70 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {assignStaffMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Assigning...
                                                </span>
                                            ) : (
                                                'Confirm Assignment'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;