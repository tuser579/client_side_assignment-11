import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, CheckCircle2, Clock, XCircle, DollarSign,
    ArrowRight, Eye, UserPlus, TrendingUp, Users, CreditCard,
    AlertCircle, Shield, Ban, BarChart3, PieChart as PieChartIcon,
    ChevronRight, Zap, Download, Trash2, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router';
import DeleteConfirmationModal from '../CitizenPage/Payment/DeleteConfirmationModal';
import PaymentReceiptModal from '../CitizenPage/Payment/PaymentReceiptModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast, Toaster } from 'react-hot-toast';

/* ─── status config ─── */
const STATUS_CFG = {
    'Pending': { soft: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', Icon: Clock },
    'In-Progress': { soft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', Icon: TrendingUp },
    'Working': { soft: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800', Icon: BarChart3 },
    'Resolved': { soft: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', Icon: CheckCircle2 },
    'Closed': { soft: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600', Icon: Shield },
    'Rejected': { soft: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', Icon: Ban },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG['Pending'];
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.soft}`}>
            <Icon className="w-3 h-3" /> {status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const isHigh = priority?.toLowerCase() === 'high';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${isHigh
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            }`}>
            <AlertCircle className="w-3 h-3" /> {isHigh ? 'High' : 'Normal'}
        </span>
    );
};

/* ─── stat card ─── */
const StatCard = ({ value, label, sub, Icon, gradient, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{value}</span>
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </motion.div>
);

/* ─── section card wrapper ─── */
const SectionCard = ({ title, sub, action, actionLabel, children, delay = 0, topBar = 'from-blue-500 to-purple-500' }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
            <div className={`h-1 bg-linear-to-r ${topBar}`} />
            <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
                    {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
                </div>
                {action && (
                    <button
                        onClick={action}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                        {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {children}
        </motion.div>
    );
};

/* ─── custom tooltip ─── */
const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-xl text-xs">
            <p className="font-bold text-white mb-0.5">{label}</p>
            <p className="text-gray-300">{payload[0].value} issues</p>
        </div>
    );
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
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

    /* ── queries ── */
    const { data: stats = [], isLoading: issuesLoading } = useQuery({
        queryKey: ['allIssues'],
        queryFn: async () => { const r = await axiosSecure.get('/allIssues'); return r.data; },
    });

    const { data: staffs = [], isLoading: staffsLoading } = useQuery({
        queryKey: ['staffs'],
        queryFn: async () => { const r = await axiosSecure.get('/staffs'); return r.data; },
    });

    const { data: payments = [], isLoading: paymentsLoading } = useQuery({
        queryKey: ['allPayment'],
        queryFn: async () => { const r = await axiosSecure.get(`/allPayment?email${user?.email}`); return r.data; },
        enabled: !!user,
    });

    const { data: allUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => { const r = await axiosSecure.get('/allUsers'); return r.data; },
        enabled: !!user,
    });

    /* ── mutations ── */
    const deleteMutation = useMutation({
        mutationFn: async (id) => { await axiosSecure.delete(`/myPaymentDelete/${id}`); },
        onSuccess: () => { queryClient.invalidateQueries(['allPayment']); setShowDeleteModal(false); },
    });

    const assignStaffMutation = useMutation({
        mutationFn: async ({ issueId, staffId, staffName, staffEmail, timelineEntry }) => {
            const timeline = { action: 'Staff_Assigned', timestamp: new Date(), note: `Assigned to ${staffEmail}`, by: user.email };
            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                updatedAt: new Date(), assignedStaffId: staffId, assignedStaffName: staffName,
                assignedStaffEmail: staffEmail, timelineEntry: [...timelineEntry, timeline]
            });
            return { issueId, staffName };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['allIssues'] });
            setShowAssignModal(false); setSelectedIssue(null); setSelectedStaffId('');
            toast.success(`Assigned to ${data.staffName}!`);
        },
        onError: (err) => toast.error(`Assignment failed: ${err.message}`),
    });

    const rejectIssueMutation = useMutation({
        mutationFn: async ({ issueId, timelineEntry }) => {
            const entry = { action: 'Rejected', timestamp: new Date(), note: 'Rejected by admin', by: user.email };
            await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                status: 'Rejected', updatedAt: new Date(), timelineEntry: [...timelineEntry, entry]
            });
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allIssues'] }); toast.success('Issue rejected'); },
        onError: (err) => toast.error(`Rejection failed: ${err.message}`),
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: async ({ _id, isBlocked }) => {
            const r = await axiosSecure.patch(`/updateUser/${_id}`, { isBlocked: !isBlocked });
            return r.data;
        },
        onMutate: async ({ _id, isBlocked }) => {
            await queryClient.cancelQueries({ queryKey: ['allUsers'] });
            const prev = queryClient.getQueryData(['allUsers']);
            queryClient.setQueryData(['allUsers'], old => old.map(u => u._id === _id ? { ...u, isBlocked: !isBlocked } : u));
            return { prev };
        },
        onError: (_, __, ctx) => { if (ctx?.prev) queryClient.setQueryData(['allUsers'], ctx.prev); toast.error('Failed to update status'); },
        onSuccess: (_, vars) => { queryClient.invalidateQueries({ queryKey: ['allUsers'] }); toast.success(`User ${vars.isBlocked ? 'unblocked' : 'blocked'}`); },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['allUsers'] }),
    });

    /* ── handlers ── */
    const handleDeleteClick = (p) => { setSelectedPayment(p); setShowDeleteModal(true); };
    const confirmDelete = () => { if (selectedPayment) deleteMutation.mutate(selectedPayment._id); };
    const handleAssignStaff = (i) => { setSelectedIssue(i); setSelectedStaffId(''); setShowAssignModal(true); };

    const handleConfirmAssignment = () => {
        if (!selectedStaffId) { toast.error('Please select a staff member'); return; }
        const staff = staffs.find(s => s._id === selectedStaffId);
        if (!staff) return;
        assignStaffMutation.mutate({ issueId: selectedIssue._id, staffId: staff._id, staffName: staff.name, staffEmail: staff.email, timelineEntry: selectedIssue.timelineEntry || [] });
    };

    const handleRejectIssue = (issue) => {
        Swal.fire({
            title: 'Reject this issue?',
            text: `"${issue.title}" — this cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: { popup: 'rounded-2xl' },
        }).then(r => { if (r.isConfirmed) rejectIssueMutation.mutate({ issueId: issue._id, timelineEntry: issue.timelineEntry || [] }); });
    };

    const handleToggleBlock = async (sing) => {
        const r = await MySwal.fire({
            title: `${sing.isBlocked ? 'Unblock' : 'Block'} User?`,
            html: `<p class="text-sm text-gray-600 mt-2">Are you sure you want to ${sing.isBlocked ? 'unblock' : 'block'} <strong>${sing.name || sing.email}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: sing.isBlocked ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: sing.isBlocked ? 'Unblock' : 'Block',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: { popup: 'rounded-2xl' },
        });
        if (r.isConfirmed) updateUserStatusMutation.mutate({ _id: sing._id, isBlocked: sing.isBlocked });
    };

    /* ── derived ── */
    const totalIssues = stats.length;
    const pendingIssues = stats.filter(i => i.status === 'Pending').length;
    const resolvedIssues = stats.filter(i => ['Resolved', 'resolved'].includes(i.status)).length;
    const rejectedIssues = stats.filter(i => ['Rejected', 'rejected'].includes(i.status)).length;
    const totalRevenue = payments.reduce((t, p) => t + (parseFloat(p.amount) || 0), 0);

    const latestIssues = [...stats].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    const latestPayments = [...payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).slice(0, 3);
    const latestUsers = [...allUsers].sort((a, b) => new Date(b.memberSince) - new Date(a.memberSince)).slice(0, 3);

    const issuesStatusData = [
        { status: 'Total', count: totalIssues, color: '#3B82F6' },
        { status: 'Pending', count: pendingIssues, color: '#F59E0B' },
        { status: 'Resolved', count: resolvedIssues, color: '#10B981' },
        { status: 'Rejected', count: rejectedIssues, color: '#EF4444' },
    ];

    const categoryCounts = {};
    stats.forEach(i => { if (i.category) categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    const issuesByCategory = Object.entries(categoryCounts).map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }));

    const formatCurrency = (amt) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amt || 0);
    const formatDate = (ds) => {
        if (!ds) return '—';
        try {
            return new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return '—'; }
    };

    /* ── loading ── */
    if (issuesLoading || paymentsLoading || usersLoading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto animate-pulse space-y-6">
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
                </div>
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
        </div>
    );

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
                                Admin{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Dashboard</span>
                            </h1>
                            <p className="text-center sm:text-start text-sm text-gray-500 dark:text-gray-400 mt-0.5">Platform overview and management</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:flex items-center gap-4 text-right">
                                <div><p className="text-xl font-black text-gray-900 dark:text-white">{totalIssues}</p><p className="text-xs text-gray-400 dark:text-gray-500">Total Issues</p></div>
                                <div><p className="text-xl font-black text-gray-900 dark:text-white">{allUsers.length}</p><p className="text-xs text-gray-400 dark:text-gray-500">Total Users</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <StatCard value={totalIssues} label="Total Issues" sub="All reported" Icon={FileText} gradient="from-blue-500 to-cyan-500" delay={0} />
                    <StatCard value={pendingIssues} label="Pending" sub="Awaiting action" Icon={Clock} gradient="from-amber-500 to-orange-500" delay={0.05} />
                    <StatCard value={resolvedIssues} label="Resolved" sub="Successfully closed" Icon={CheckCircle2} gradient="from-emerald-500 to-teal-500" delay={0.1} />
                    <StatCard value={rejectedIssues} label="Rejected" sub="Not approved" Icon={XCircle} gradient="from-red-500 to-rose-500" delay={0.15} />
                    <StatCard value={formatCurrency(totalRevenue)} label="Revenue" sub="All time" Icon={DollarSign} gradient="from-violet-500 to-purple-500" delay={0.2} />
                </div>

                {/* ── Bar Chart — Status Distribution ── */}
                <SectionCard
                    title="Issues Status Distribution"
                    sub="Current status of all reported issues"
                    delay={0.25}
                    topBar="from-blue-500 to-cyan-500"
                >
                    <div className="p-5 sm:p-6">
                        <div className="h-64 sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={issuesStatusData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                    <XAxis dataKey="status" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {issuesStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {issuesStatusData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.status}</span>
                                    </div>
                                    <span className="text-sm font-black" style={{ color: item.color }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                {/* ── Pie Chart — Category ── */}
                <SectionCard
                    title="Issues by Category"
                    sub={issuesByCategory.length > 0 ? `${issuesByCategory.length} categories` : 'No data yet'}
                    delay={0.3}
                    topBar="from-violet-500 to-fuchsia-500"
                >
                    <div className="p-5 sm:p-6">
                        {issuesByCategory.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-64 sm:h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={issuesByCategory} cx="50%" cy="50%"
                                                labelLine={false} outerRadius={100} innerRadius={35}
                                                paddingAngle={2} dataKey="value"
                                                label={({ name, percent }) => percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : ''}
                                            >
                                                {issuesByCategory.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                                            </Pie>
                                            <Tooltip
                                                formatter={(v) => [`${v} issues`, 'Count']}
                                                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                itemStyle={{ color: '#d1d5db' }}           // ← value row: light gray
                                                labelStyle={{ color: '#ffffff', fontWeight: 700 }}  // ← category label: white bold
                                                wrapperStyle={{ outline: 'none' }}          // ← removes recharts' default white outer border
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Category Breakdown</p>
                                    {issuesByCategory.map((cat, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{cat.value}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 text-right">
                                                    {totalIssues > 0 ? `${((cat.value / totalIssues) * 100).toFixed(1)}%` : '0%'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
                                    <PieChartIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No category data available</p>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* ── Recent Issues Table ── */}
                <SectionCard
                    title="Recent Issues"
                    sub="Last 3 reported issues"
                    action={() => navigate('/dashboard/issuesManagement')}
                    actionLabel="View All Issues"
                    delay={0.35}
                    topBar="from-amber-500 to-orange-500"
                >
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                    {['Issue Title', 'Category', 'Status', 'Priority', 'Assigned Staff', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {latestIssues.length > 0 ? latestIssues.map(issue => (
                                    <tr key={issue._id} className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${issue.isBoosted ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>
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
                                                    <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                                                {!issue.assignedStaffId && (
                                                    <button onClick={() => handleAssignStaff(issue)} disabled={assignStaffMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                                                        <UserPlus className="w-3 h-3" /> Assign
                                                    </button>
                                                )}
                                                {issue.status === 'Pending' && (
                                                    <button onClick={() => handleRejectIssue(issue)} disabled={rejectIssueMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50">
                                                        <XCircle className="w-3 h-3" /> Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">No issues found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {latestIssues.length > 0 ? latestIssues.map(issue => (
                            <div key={issue._id} className={`p-4 ${issue.isBoosted ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{issue.title}</p>
                                    {issue.isBoosted && <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 shrink-0"><Zap className="w-2.5 h-2.5" />Boosted</span>}
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    <StatusBadge status={issue.status} />
                                    <PriorityBadge priority={issue.priority} />
                                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">{issue.category}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button onClick={() => navigate(`/issueDetailsPage/${issue._id}`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl">
                                        <Eye className="w-3 h-3" /> View
                                    </button>
                                    {!issue.assignedStaffId && (
                                        <button onClick={() => handleAssignStaff(issue)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                                            <UserPlus className="w-3 h-3" /> Assign
                                        </button>
                                    )}
                                    {issue.status === 'Pending' && (
                                        <button onClick={() => handleRejectIssue(issue)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
                                            <XCircle className="w-3 h-3" /> Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No issues found</p>}
                    </div>
                </SectionCard>

                {/* ── Recent Payments ── */}
                <SectionCard
                    title="Recent Payments"
                    sub="Last 3 transactions"
                    action={() => navigate('/dashboard/paymentsPage')}
                    actionLabel="View All Payments"
                    delay={0.4}
                    topBar="from-emerald-500 to-teal-500"
                >
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                    {['Transaction ID', 'User Email', 'Amount', 'Type', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {latestPayments.length > 0 ? latestPayments.map((payment, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="py-4 px-5">
                                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 truncate block max-w-[120px]">{payment.transactionId || `PAY-${i + 1}`}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate block max-w-[160px]">{payment.customerEmail || '—'}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(payment.amount)}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${payment.type === 'Premium Subscription'
                                                    ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800'
                                                    : payment.type === 'Boost Issue'
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                                }`}>
                                                {payment.type || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.paidAt)}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                                                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(payment)} disabled={deleteMutation.isLoading}
                                                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No payments found</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {latestPayments.length > 0 ? latestPayments.map((payment, i) => (
                            <div key={i} className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{payment.transactionId || `PAY-${i + 1}`}</span>
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(payment.amount)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{payment.customerEmail || '—'}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${payment.type === 'Premium Subscription' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800'
                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                        }`}>{payment.type || 'Unknown'}</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }} className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Download className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDeleteClick(payment)} className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No payments found</p>}
                    </div>
                </SectionCard>

                {/* ── Recent Users ── */}
                <SectionCard
                    title="New Users"
                    sub="Recently joined citizens"
                    action={() => navigate('/dashboard/manageUsers')}
                    actionLabel="View All Users"
                    delay={0.45}
                    topBar="from-fuchsia-500 to-pink-500"
                >
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                    {['User', 'Email', 'Plan', 'Joined', 'Blocked', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {latestUsers.length > 0 ? latestUsers.map((sing, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                {sing.photoURL ? (
                                                    <img src={sing.photoURL} alt={sing.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {sing.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{sing.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate block max-w-[160px]">{sing.email || '—'}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${sing.isPremium
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                                }`}>
                                                {sing.isPremium ? '⭐ Premium' : 'Regular'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(sing.memberSince)}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${sing.isBlocked
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                }`}>
                                                {sing.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <button onClick={() => handleToggleBlock(sing)} disabled={updateUserStatusMutation.isLoading}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${sing.isBlocked
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                                                    }`}>
                                                {sing.isBlocked ? <><CheckCircle2 className="w-3 h-3" /> Unblock</> : <><Ban className="w-3 h-3" /> Block</>}
                                            </button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No users found</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {latestUsers.length > 0 ? latestUsers.map((sing, i) => (
                            <div key={i} className="p-4 space-y-2">
                                <div className="flex items-center gap-2.5">
                                    {sing.photoURL ? (
                                        <img src={sing.photoURL} alt={sing.name} className="w-9 h-9 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {sing.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{sing.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{sing.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5 flex-wrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${sing.isPremium ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {sing.isPremium ? '⭐ Premium' : 'Regular'}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${sing.isBlocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {sing.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>
                                    <button onClick={() => handleToggleBlock(sing)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${sing.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {sing.isBlocked ? <><CheckCircle2 className="w-3 h-3" />Unblock</> : <><Ban className="w-3 h-3" />Block</>}
                                    </button>
                                </div>
                            </div>
                        )) : <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No users found</p>}
                    </div>
                </SectionCard>
            </div>

            {/* ── Modals ── */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    payment={selectedPayment}
                    onClose={() => { setShowDeleteModal(false); setSelectedPayment(null); }}
                    onConfirm={confirmDelete}
                    isLoading={deleteMutation.isLoading}
                />
            )}

            {showReceiptModal && (
                <PaymentReceiptModal
                    payment={selectedPayment}
                    onClose={() => { setShowReceiptModal(false); setSelectedPayment(null); }}
                />
            )}

            {/* Assign Staff Modal */}
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
                                {/* Modal top bar */}
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
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                    Select Staff Member
                                                </label>
                                                <select
                                                    value={selectedStaffId}
                                                    onChange={e => setSelectedStaffId(e.target.value)}
                                                    disabled={staffs.length === 0}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                                                >
                                                    <option value="">Choose a staff member…</option>
                                                    {staffs.map(s => (
                                                        <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                                                    ))}
                                                </select>
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
                                                    {assignStaffMutation.isPending ? (
                                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Assigning…</>
                                                    ) : (
                                                        <><UserPlus className="w-4 h-4" /> Confirm</>
                                                    )}
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

export default AdminDashboard;