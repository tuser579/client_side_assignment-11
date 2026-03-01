import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import {
    CheckCircle2, AlertCircle, Clock, Target, Activity,
    PieChart, Eye, ArrowUp, Tag, Calendar, TrendingUp,
    Users, BarChart3, Zap, ChevronDown, ChevronRight,
    Hash, RefreshCw, Settings, XCircle, ExternalLink,
    Sparkles
} from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { toast, Toaster } from 'react-hot-toast';
import { FaArrowUp } from 'react-icons/fa';

/* ─────────────────────────── constants ─────────────────────────── */
const STATUS_CONFIG = {
    'Pending': { label: 'Pending', gradient: 'from-amber-500 to-orange-500', soft: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', Icon: Clock, next: ['In-Progress'] },
    'In-Progress': { label: 'In-Progress', gradient: 'from-blue-500 to-cyan-500', soft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', Icon: RefreshCw, next: ['Working'] },
    'Working': { label: 'Working', gradient: 'from-violet-500 to-purple-500', soft: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800', Icon: Settings, next: ['Resolved'] },
    'Resolved': { label: 'Resolved', gradient: 'from-emerald-500 to-teal-500', soft: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', Icon: CheckCircle2, next: ['Closed'] },
    'Closed': { label: 'Closed', gradient: 'from-gray-500 to-gray-600', soft: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600', Icon: XCircle, next: [] },
};

const PRIORITY_CONFIG = {
    'High': { gradient: 'from-orange-500 to-red-500', soft: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    'Normal': { gradient: 'from-blue-500 to-blue-600', soft: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
};

const PIE_COLORS = { Pending: '#F59E0B', 'In-Progress': '#3B82F6', Working: '#8B5CF6', Resolved: '#10B981', Closed: '#6B7280' };

/* ─────────────────────────── sub-components ────────────────────── */
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.soft}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Normal'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.soft}`}>
            <AlertCircle className="w-3 h-3" /> {priority || 'Normal'}
        </span>
    );
};

const CategoryBadge = ({ category }) => {
    const palettes = [
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
        'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800',
        'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    ];
    const idx = Math.abs((category || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palettes.length;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${palettes[idx]}`}>
            <Tag className="w-3 h-3" /> {category || 'Uncategorized'}
        </span>
    );
};

const BoostedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-sm">
        <Zap className="w-2.5 h-2.5" /> Boosted
    </span>
);

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    if (percent < 0.06) return null;
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

/* ─────────────────────────── stat card ─────────────────────────── */
const StatCard = ({ value, label, gradient, Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
            <div className={`w-9 h-9 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
        </div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
    </div>
);

/* ─────────────────────────── main component ────────────────────── */
const StaffDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);

    /* ── fetch ── */
    const { data: allIssues = [], isLoading: issuesLoading } = useQuery({
        queryKey: ['staffDashboardIssues', user?.email],
        queryFn: async () => {
            try { const res = await axiosSecure.get('/allIssues'); return res.data || []; }
            catch { return []; }
        },
        enabled: !!user?.email,
    });

    const assignedIssues = useMemo(() => {
        if (!Array.isArray(allIssues) || !user?.email) return [];
        return allIssues.filter(i => i?.assignedStaffEmail?.toLowerCase() === user.email.toLowerCase());
    }, [allIssues, user]);

    /* ── mutation ── */
    const updateStatusMutation = useMutation({
        mutationFn: async ({ issueId, newStatus, currentStatus }) => {
            const existing = assignedIssues.find(i => i._id === issueId);
            const prevTimeline = existing?.timelineEntry || [];
            const res = await axiosSecure.patch(`/myIssueUpdate/${issueId}`, {
                status: newStatus,
                updatedAt: new Date(),
                timelineEntry: [...prevTimeline, { action: 'Status_Changed', timestamp: new Date(), by: user?.email || 'Staff', note: `Status changed from ${currentStatus} to ${newStatus}` }]
            });
            return res.data;
        },
        onMutate: async ({ issueId, newStatus }) => {
            await queryClient.cancelQueries(['staffDashboardIssues']);
            const previous = queryClient.getQueryData(['staffDashboardIssues']);
            queryClient.setQueryData(['staffDashboardIssues'], old =>
                old?.map(i => i._id === issueId ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i)
            );
            return { previous };
        },
        onError: (err, _, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(['staffDashboardIssues'], ctx.previous);
            toast.error(`Failed: ${err.response?.data?.message || err.message}`);
        },
        onSuccess: (_, { newStatus }) => {
            toast.success(`Status updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
            setStatusDropdownOpen(null);
        },
        onSettled: () => queryClient.invalidateQueries(['staffDashboardIssues']),
    });

    /* ── handle status change ── */
    const handleStatusChange = async (issue, newStatus) => {
        setSelectedIssue(issue);
        const cfg = STATUS_CONFIG[issue.status] || {};
        const newCfg = STATUS_CONFIG[newStatus] || {};
        const result = await Swal.fire({
            title: 'Confirm Status Change',
            html: `
                <div class="text-left space-y-4">
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        <div>
                            <p class="font-bold text-gray-900 text-sm">${issue.title}</p>
                            <p class="text-xs text-gray-500">ID: #${issue._id?.slice(-8)}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-center gap-4">
                        <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">${cfg.label || issue.status}</span>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">${newCfg.label || newStatus}</span>
                    </div>
                    <div class="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                        <svg class="w-4 h-4 shrink-0 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                        This action will be recorded in the issue timeline.
                    </div>
                </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Update Status',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            customClass: { popup: 'rounded-2xl' },
        });
        if (result.isConfirmed) {
            updateStatusMutation.mutate({ issueId: issue._id, currentStatus: issue.status, newStatus });
            setSelectedIssue(null);
        }
    };

    /* ── stats ── */
    const stats = useMemo(() => ({
        total: assignedIssues.length,
        pending: assignedIssues.filter(i => i.status === 'Pending').length,
        inProgress: assignedIssues.filter(i => i.status === 'In-Progress').length,
        working: assignedIssues.filter(i => i.status === 'Working').length,
        resolved: assignedIssues.filter(i => i.status === 'Resolved').length,
        closed: assignedIssues.filter(i => i.status === 'Closed').length,
        boosted: assignedIssues.filter(i => i.isBoosted).length,
    }), [assignedIssues]);

    const lastThreeIssues = useMemo(() =>
        [...assignedIssues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
        [assignedIssues]
    );

    const pieChartData = [
        { name: 'Pending', value: stats.pending, color: PIE_COLORS['Pending'] },
        { name: 'In-Progress', value: stats.inProgress, color: PIE_COLORS['In-Progress'] },
        { name: 'Working', value: stats.working, color: PIE_COLORS['Working'] },
        { name: 'Resolved', value: stats.resolved, color: PIE_COLORS['Resolved'] },
        { name: 'Closed', value: stats.closed, color: PIE_COLORS['Closed'] },
    ].filter(d => d.value > 0);

    const completionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    const formatDate = (ds) => {
        if (!ds) return '—';
        try { return new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
        catch { return '—'; }
    };

    const statCards = [
        { value: stats.total, label: 'Total', gradient: 'from-blue-500 to-cyan-500', Icon: Target },
        { value: stats.pending, label: 'Pending', gradient: 'from-amber-500 to-orange-500', Icon: Clock },
        { value: stats.inProgress, label: 'In-Progress', gradient: 'from-blue-500 to-blue-600', Icon: RefreshCw },
        { value: stats.working, label: 'Working', gradient: 'from-violet-500 to-purple-500', Icon: Settings },
        { value: stats.resolved, label: 'Resolved', gradient: 'from-emerald-500 to-teal-500', Icon: CheckCircle2 },
        { value: stats.closed, label: 'Closed', gradient: 'from-gray-500 to-gray-600', Icon: XCircle },
        { value: stats.boosted, label: 'Boosted', gradient: 'from-amber-400 to-orange-500', Icon: Zap },
    ];

    /* ── render ── */
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex justify-center sm:justify-start gap-4">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Staff{' '}
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Dashboard</span>
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Welcome back,{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {user?.displayName || user?.email?.split('@')[0] || 'Staff Member'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center sm:justify-start gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned Issues</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/assignedIssues')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
                            >
                                <Eye className="w-4 h-4" /> View All Issues
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ───────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {statCards.map((s, i) => <StatCard key={i} {...s} />)}
                </div>

                {/* ── Charts Row ───────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Pie Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="h-1 bg-linear-to-r from-blue-500 to-purple-500" />
                        <div className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <PieChart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Issues Distribution
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 pl-9">Assigned issues by status</p>
                                </div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
                                    {stats.total} total
                                </span>
                            </div>

                            {stats.total > 0 ? (
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    {/* Chart */}
                                    <div className="w-full md:w-1/2 h-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} label={PieLabel} outerRadius={100} dataKey="value">
                                                    {pieChartData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} stroke="transparent" strokeWidth={2} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(v) => [`${v} issues`, 'Count']}
                                                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                                    itemStyle={{ color: '#d1d5db' }}           // ← value row: light gray
                                                    labelStyle={{ color: '#ffffff', fontWeight: 700 }}  // ← category label: white bold
                                                    wrapperStyle={{ outline: 'none' }}          // ← removes recharts' default white outer border
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="w-full md:w-1/2 space-y-2">
                                        {pieChartData.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xs font-black text-gray-900 dark:text-white">{item.value}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 w-8 text-right">
                                                        {Math.round((item.value / stats.total) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Progress bar */}
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Completion</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{completionRate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-700" style={{ width: `${completionRate}%` }} />
                                            </div>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{stats.resolved} of {stats.total} resolved</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-14 text-center">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-3">
                                        <PieChart className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No assigned issues yet</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Chart appears when issues are assigned</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
                        <div className="p-5 sm:p-6">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Performance Metrics
                            </h2>

                            <div className="space-y-3">
                                {/* Completion Rate */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Completion Rate</span>
                                        <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-emerald-200 dark:bg-emerald-800/50 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-700" style={{ width: `${completionRate}%` }} />
                                    </div>
                                </div>

                                {/* Active Issues */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className='text-center sm:text-start'>
                                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Active Issues</p>
                                            <p className="text-xl font-black text-blue-900 dark:text-blue-200">
                                                {stats.pending + stats.inProgress + stats.working}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-center sm:text-start text-[11px] text-blue-600 dark:text-blue-400 mt-1.5">Currently being worked on</p>
                                </div>

                                {/* Boosted */}
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className='text-center sm:text-start'>
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Boosted Issues</p>
                                            <p className="text-xl font-black text-amber-900 dark:text-amber-200">{stats.boosted}</p>
                                        </div>
                                    </div>
                                    <p className="text-center sm:text-start text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">High priority attention needed</p>
                                </div>

                                {/* Productivity */}
                                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center">
                                            <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div className='text-center sm:text-start'>
                                            <p className="text-xs font-bold text-violet-700 dark:text-violet-400">Productivity Score</p>
                                            <p className="text-xl font-black text-violet-900 dark:text-violet-200">
                                                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-center sm:text-start text-[11px] text-violet-600 dark:text-violet-400 mt-1.5">Resolved vs total issues</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Issues Table ──────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

                    {/* Table header */}
                    <div className="z-15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-center sm:justify-start items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recently Assigned Issues</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 3 issues assigned to you</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/assignedIssues')}
                            className="flex justify-center sm:justify-start items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            View All ({assignedIssues.length}) <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {lastThreeIssues.length > 0 ? (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                            {['Issue Details', 'Category', 'Status', 'Priority', 'Actions'].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lastThreeIssues.map((issue, idx) => {
                                            const nextStatuses = STATUS_CONFIG[issue.status]?.next || [];
                                            const isOpen = statusDropdownOpen === issue._id;
                                            return (
                                                <tr key={issue._id} className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${issue.isBoosted ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>

                                                    {/* Issue Details */}
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${issue.isBoosted ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-cyan-500'} flex items-center justify-center shrink-0 shadow-sm`}>
                                                                <Hash className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{issue.title}</p>
                                                                    {issue.isBoosted && <BoostedBadge />}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 flex-wrap">
                                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Created:  {formatDate(issue.createdAt)}</span>
                                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last Update:  {formatDate(issue.updatedAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-5 whitespace-nowrap"><CategoryBadge category={issue.category} /></td>
                                                    <td className="py-4 px-5 whitespace-nowrap"><StatusBadge status={issue.status} /></td>
                                                    <td className="py-4 px-5 whitespace-nowrap"><PriorityBadge priority={issue.priority} /></td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> Details
                                                            </button>

                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setStatusDropdownOpen(isOpen ? null : issue._id)}
                                                                    disabled={nextStatuses.length === 0 || updateStatusMutation.isPending}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${nextStatuses.length === 0 || updateStatusMutation.isPending
                                                                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                                                        }`}
                                                                >
                                                                    <RefreshCw className={`w-3.5 h-3.5 ${updateStatusMutation.isPending && selectedIssue?._id === issue._id ? 'animate-spin' : ''}`} />
                                                                    Update
                                                                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </button>

                                                                {isOpen && nextStatuses.length > 0 && (
                                                                    <>
                                                                        <div className="inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                                                                        <div className="absolute right-0 mt-1.5 z-20 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Next Status</p>
                                                                            </div>
                                                                            {nextStatuses.map(st => {
                                                                                const cfg = STATUS_CONFIG[st];
                                                                                const { Icon } = cfg;
                                                                                return (
                                                                                    <button
                                                                                        key={st}
                                                                                        onClick={() => handleStatusChange(issue, st)}
                                                                                        disabled={updateStatusMutation.isPending}
                                                                                        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                                                                    >
                                                                                        <div className="flex items-center gap-2.5">
                                                                                            <div className={`w-7 h-7 bg-linear-to-br ${cfg.gradient} rounded-lg flex items-center justify-center`}>
                                                                                                <Icon className="w-3.5 h-3.5 text-white" />
                                                                                            </div>
                                                                                            <div className="text-left">
                                                                                                <p className="text-xs font-bold text-gray-900 dark:text-white">{cfg.label}</p>
                                                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">Click to update</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                                {lastThreeIssues.map(issue => {
                                    const nextStatuses = STATUS_CONFIG[issue.status]?.next || [];
                                    const isOpen = statusDropdownOpen === issue._id;
                                    return (
                                        <div key={issue._id} className={`p-4 ${issue.isBoosted ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                                            {issue.isBoosted && (
                                                <div className="rounded-lg mb-3 bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 flex items-center justify-center gap-1.5">
                                                    <FaArrowUp className="w-3 h-3 text-white" />
                                                    <span className="text-xs font-bold text-white tracking-wide">BOOSTED ISSUE</span>
                                                </div>
                                            )}
                                            {/* Title row */}
                                            <div className="flex items-start gap-2 mb-3">
                                                <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${issue.isBoosted ? 'from-amber-400 to-orange-500' : 'from-blue-500 to-cyan-500'} flex items-center justify-center shrink-0 shadow-sm`}>
                                                    <Hash className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                        <p className="text-md font-bold text-gray-900 dark:text-white line-clamp-1">{issue.title}</p>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />Created:  {formatDate(issue.createdAt)}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Last Update: {formatDate(issue.updatedAt)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex justify-between flex-wrap gap-1.5 mb-3">
                                                <StatusBadge status={issue.status} />
                                                <PriorityBadge priority={issue.priority} />
                                                <CategoryBadge category={issue.category} />
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/issueDetailsPage/${issue._id}`)}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Details
                                                </button>

                                                <div className="relative flex-1">
                                                    <button
                                                        onClick={() => setStatusDropdownOpen(isOpen ? null : issue._id)}
                                                        disabled={nextStatuses.length === 0 || updateStatusMutation.isPending}
                                                        className={`w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-all ${nextStatuses.length === 0
                                                            ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                                                            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                                            }`}
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        Update
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isOpen && nextStatuses.length > 0 && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(null)} />
                                                            <div className="absolute right-0 bottom-full mb-1 z-20 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                {nextStatuses.map(st => {
                                                                    const cfg = STATUS_CONFIG[st];
                                                                    const { Icon } = cfg;
                                                                    return (
                                                                        <button
                                                                            key={st}
                                                                            onClick={() => handleStatusChange(issue, st)}
                                                                            className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                        >
                                                                            <div className={`w-7 h-7 bg-linear-to-br ${cfg.gradient} rounded-lg flex items-center justify-center`}>
                                                                                <Icon className="w-3.5 h-3.5 text-white" />
                                                                            </div>
                                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{cfg.label}</p>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Issues Assigned</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                Issues assigned to you by an admin will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading overlay */}
            {issuesLoading && (
                <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Loading dashboard…</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;