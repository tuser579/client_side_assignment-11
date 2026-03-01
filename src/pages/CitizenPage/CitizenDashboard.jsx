import React from 'react';
import {
  BarChart3, Clock, CheckCircle, AlertTriangle,
  TrendingUp, DollarSign, AlertCircle, Wrench,
  XCircle, Lock, Phone, Mail, Zap
} from 'lucide-react';
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import CitizenDashboardSkeleton from '../../Components/CitizenDashboardSkeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CitizenDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const { data = {}, isLoading } = useQuery({
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

  const statCards = [
    { title: 'Total Issues',  value: issues.length,                                              icon: BarChart3,      accent: 'from-blue-500 to-cyan-400',    glow: 'shadow-blue-500/20',   iconBg: 'bg-blue-50 dark:bg-blue-900/30',   iconColor: 'text-blue-500 dark:text-blue-400' },
    { title: 'Pending',       value: issues.filter(i => i.status === 'Pending').length,          icon: Clock,          accent: 'from-yellow-500 to-amber-400', glow: 'shadow-yellow-500/20', iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',iconColor: 'text-yellow-500 dark:text-yellow-400' },
    { title: 'In-Progress',   value: issues.filter(i => i.status === 'In-Progress').length,     icon: AlertTriangle,  accent: 'from-violet-500 to-purple-400',glow: 'shadow-violet-500/20', iconBg: 'bg-violet-50 dark:bg-violet-900/30',iconColor: 'text-violet-500 dark:text-violet-400' },
    { title: 'Working',       value: issues.filter(i => i.status === 'Working').length,          icon: Wrench,         accent: 'from-orange-500 to-amber-400', glow: 'shadow-orange-500/20', iconBg: 'bg-orange-50 dark:bg-orange-900/30',iconColor: 'text-orange-500 dark:text-orange-400' },
    { title: 'Resolved',      value: issues.filter(i => i.status === 'Resolved').length,        icon: CheckCircle,    accent: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/20',iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',iconColor: 'text-emerald-500 dark:text-emerald-400' },
    { title: 'Closed',        value: issues.filter(i => i.status === 'Closed').length,          icon: Lock,           accent: 'from-gray-500 to-gray-400',   glow: 'shadow-gray-500/20',   iconBg: 'bg-gray-100 dark:bg-gray-700/50',   iconColor: 'text-gray-500 dark:text-gray-400' },
    { title: 'Rejected',      value: issues.filter(i => i.status === 'Rejected').length,        icon: XCircle,        accent: 'from-red-500 to-pink-400',    glow: 'shadow-red-500/20',    iconBg: 'bg-red-50 dark:bg-red-900/30',     iconColor: 'text-red-500 dark:text-red-400' },
  ];

  const chartData = {
    labels: ['Total', 'Pending', 'In-Progress', 'Resolved'],
    datasets: [{
      label: 'Issues',
      data: [
        issues.length,
        issues.filter(i => i.status === 'Pending').length,
        issues.filter(i => i.status === 'In-Progress').length,
        issues.filter(i => i.status === 'Resolved').length,
      ],
      backgroundColor: [
        'rgba(59,130,246,0.8)',
        'rgba(234,179,8,0.8)',
        'rgba(139,92,246,0.8)',
        'rgba(16,185,129,0.8)',
      ],
      borderRadius: 10,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,24,39,0.95)',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 12, weight: '600' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(156,163,175,0.1)', drawBorder: false },
        ticks: { color: '#9ca3af', font: { size: 12 }, stepSize: 1 },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  if (isLoading) return (
   <CitizenDashboardSkeleton></CitizenDashboardSkeleton>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">

      {/* ── Blocked Warning ─────────────────────────────── */}
      {singUser.isBlocked && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Account Blocked</p>
            <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
              Your account has been temporarily blocked. Contact{' '}
              <a href="tel:+8809609333222" className="underline font-semibold">+880 9609 333222</a>
              {' '}or{' '}
              <a href="mailto:support@infra.gov" className="underline font-semibold">support@infra.gov</a>
            </p>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="flex justify-center sm:justify-start text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
                {singUser?.name?.split(' ')[0] || 'Citizen'} 👋
              </span>
            </h1>
            <p className="flex justify-center sm:justify-start text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Track and manage your infrastructure reports
            </p>
          </div>

          <NavLink
            to="/dashboard/reportIssue"
            className="flex justify-center sm:justify-start gap-2 px-3 py-2.5 bg-linear-to-r items-center from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Zap className="w-4 h-4" /> Report Issue
          </NavLink>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center sm:items-start bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-0.5">{s.value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{s.title}</p>
              <div className={`mt-2.5 h-0.5 rounded-full bg-linear-to-r ${s.accent}`} />
            </div>
          );
        })}
      </div>

      {/* ── Chart + Payment ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">

        {/* Payment Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-2xl shadow-violet-500/20">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold tracking-wide uppercase text-white/70">Total Payments</span>
            </div>

            <p className="text-4xl font-black mb-1">৳{singUser.totalPayment || 0}</p>
            <p className="text-white/50 text-xs mb-6">Lifetime spend on CityFix</p>

            <div className="space-y-3">
              {[
                { label: 'Premium Subscription', amount: '৳1,000' },
                { label: 'Priority Reports',      amount: '৳100' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/10 border border-white/10 rounded-xl">
                  <span className="text-sm text-white/80">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.amount}</span>
                </div>
              ))}
            </div>

            {/* Premium badge */}
            {singUser?.isPremium && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-400/20 border border-amber-400/30 rounded-xl">
                <span className="text-amber-300 text-xs font-bold">⭐ Premium Member</span>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Issue Analysis</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Overview of your reported issues</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Live</span>
            </div>
          </div>
          <div className="h-56 sm:h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CitizenDashboard;