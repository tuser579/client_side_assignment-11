import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch, HiOutlineX, HiOutlineCalendar,
  HiOutlineTrendingUp, HiOutlineCurrencyDollar,
  HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineFilter, HiOutlineLightningBolt,
} from 'react-icons/hi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import PaymentReceiptModal from '../CitizenPage/Payment/PaymentReceiptModal';
import DeleteConfirmationModal from '../CitizenPage/Payment/DeleteConfirmationModal';
import { Download, Trash2 } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend
);

/* ═══════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════ */
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
    <div className="flex items-center justify-between mb-3">
      <Shimmer className="h-3 w-28 rounded-md" />
      <Shimmer className="w-11 h-11 rounded-xl" />
    </div>
    <Shimmer className="h-8 w-36 rounded-md mb-1.5" />
    <Shimmer className="h-3 w-20 rounded-md" />
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 md:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-2">
        <Shimmer className="h-5 w-48 rounded-md" />
        <Shimmer className="h-3 w-64 rounded-md" />
      </div>
      <Shimmer className="h-9 w-44 rounded-xl" />
    </div>
    <Shimmer className="h-72 w-full rounded-xl" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2 p-4">
          <Shimmer className="h-7 w-32 rounded-md mx-auto" />
          <Shimmer className="h-3 w-28 rounded-md mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

const TableRowSkeleton = ({ index }) => (
  <tr className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/40 dark:bg-gray-800/40'}>
    <td className="px-5 py-4"><Shimmer className="h-3.5 w-36 rounded-md" /></td>
    <td className="px-5 py-4 hidden sm:table-cell"><Shimmer className="h-3.5 w-44 rounded-md" /></td>
    <td className="px-5 py-4"><Shimmer className="h-3.5 w-20 rounded-md" /></td>
    <td className="px-5 py-4 hidden md:table-cell"><Shimmer className="h-6 w-28 rounded-full" /></td>
    <td className="px-5 py-4 hidden lg:table-cell"><Shimmer className="h-3.5 w-32 rounded-md" /></td>
    <td className="px-5 py-4">
      <div className="flex gap-2">
        <Shimmer className="w-8 h-8 rounded-xl" />
        <Shimmer className="w-8 h-8 rounded-xl" />
      </div>
    </td>
  </tr>
);

const MobilePaymentCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-1.5 flex-1">
        <Shimmer className="h-3.5 w-40 rounded-md" />
        <Shimmer className="h-3 w-32 rounded-md" />
      </div>
      <Shimmer className="h-6 w-24 rounded-full" />
    </div>
    <div className="flex items-center justify-between mb-3">
      <Shimmer className="h-5 w-20 rounded-md" />
      <Shimmer className="h-3 w-28 rounded-md" />
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
const StatCard = ({ label, value, sub, gradient, iconBg, textColor, Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`${gradient} border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold dark:text-white uppercase tracking-widest opacity-70">{label}</span>
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5 truncate`}>{value}</div>
    <div className="text-xs dark:text-white opacity-60 font-medium">{sub}</div>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   TYPE BADGE
═══════════════════════════════════════════════ */
const TypeBadge = ({ type }) => {
  const variants = {
    'Premium Subscription': 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
    'Boost Issue': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
  };
  const cls = variants[type] || variants.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {type || 'Unknown'}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const PaymentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [chartType, setChartType] = useState('bar');

  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /* ── Fetch ── */
  const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['allPayment'],
    queryFn: async () => {
      const res = await axiosSecure.get('/allPayment');
      return res.data;
    },
    enabled: !!user,
  });

  /* ── Monthly calculation ── */
  useEffect(() => {
    if (paymentsData.length > 0) calculateMonthlyData(paymentsData);
  }, [paymentsData]);

  const calculateMonthlyData = (payments) => {
    const totals = Array(12).fill(0);
    const counts = Array(12).fill(0);
    const success = Array(12).fill(0);

    payments.forEach(p => {
      const d = new Date(p.paidAt || p.createdAt);
      if (isNaN(d)) return;
      const m = d.getMonth();
      totals[m] += p.amount || 0;
      counts[m]++;
      if (['completed', 'success', 'paid'].includes((p.status || '').toLowerCase())) success[m]++;
    });

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    setMonthlyData(MONTHS.map((month, i) => ({
      month, total: totals[i], count: counts[i], success: success[i],
      avg: counts[i] > 0 ? totals[i] / counts[i] : 0,
    })));
  };

  /* ── Filters ── */
  const filteredPayments = useMemo(() => {
    let result = [...paymentsData];
    if (searchTerm) {
      const sl = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.transactionId?.toLowerCase().includes(sl) ||
        p.email?.toLowerCase().includes(sl) ||
        p.customerEmail?.toLowerCase().includes(sl)
      );
    }
    if (filters.type) result = result.filter(p => p.type === filters.type);
    if (filters.startDate) {
      const s = new Date(filters.startDate);
      result = result.filter(p => p.paidAt && new Date(p.paidAt) >= s);
    }
    if (filters.endDate) {
      const e = new Date(filters.endDate);
      e.setHours(23, 59, 59, 999);
      result = result.filter(p => p.paidAt && new Date(p.paidAt) <= e);
    }
    return result;
  }, [paymentsData, searchTerm, filters]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filters]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIdx, startIdx + itemsPerPage);

  /* ── Delete mutation ── */
  const deleteMutation = useMutation({
    mutationFn: async (id) => { await axiosSecure.delete(`/myPaymentDelete/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPayment']);
      setShowDeleteModal(false);
      setSelectedPayment(null);
    }
  });

  /* ── Helpers ── */
  const formatCurrency = (amount, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'N/A'; }
  };

  const clearFilters = () => { setSearchTerm(''); setFilters({ type: '', startDate: '', endDate: '' }); };
  const hasFilters = searchTerm || Object.values(filters).some(v => v);
  const typeOptions = [...new Set(paymentsData.map(p => p.type))].filter(Boolean);

  /* ── Chart config ── */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12 }, padding: 20, usePointStyle: true, color: '#6b7280' },
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleFont: { size: 12 }, bodyFont: { size: 11 },
        padding: 12, cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            let label = (ctx.dataset.label || '') + ': ';
            if (ctx.datasetIndex === 0) return label + formatCurrency(ctx.parsed.y);
            return label + ctx.parsed.y + ' transactions';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(107,114,128,0.08)', drawBorder: false },
        ticks: {
          font: { size: 11 }, color: '#9ca3af',
          callback: v => v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'k' : '$' + v,
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af' }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  const barData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        type: 'bar', label: 'Revenue',
        data: monthlyData.map(d => d.total),
        backgroundColor: 'rgba(59,130,246,0.8)', borderColor: 'rgb(59,130,246)',
        borderWidth: 1, borderRadius: 6, borderSkipped: false,
        hoverBackgroundColor: 'rgba(59,130,246,1)', barPercentage: 0.6, categoryPercentage: 0.8,
      },
      {
        type: 'bar', label: 'Transactions',
        data: monthlyData.map(d => d.count),
        backgroundColor: 'rgba(16,185,129,0.8)', borderColor: 'rgb(16,185,129)',
        borderWidth: 1, borderRadius: 6, borderSkipped: false,
        hoverBackgroundColor: 'rgba(16,185,129,1)', barPercentage: 0.6, categoryPercentage: 0.8,
      }
    ]
  };

  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      type: 'line', label: 'Revenue',
      data: monthlyData.map(d => d.total),
      borderColor: 'rgb(59,130,246)', backgroundColor: 'rgba(59,130,246,0.1)',
      borderWidth: 3, tension: 0.4, fill: true,
      pointBackgroundColor: 'rgb(59,130,246)', pointBorderColor: '#fff',
      pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
    }]
  };

  /* ── Summary stats ── */
  const totalRevenue = monthlyData.reduce((s, d) => s + d.total, 0);
  const totalTxns = monthlyData.reduce((s, d) => s + d.count, 0);
  const peakMonth = monthlyData.length > 0 ? monthlyData.reduce((mx, d) => d.total > mx.total ? d : mx, monthlyData[0]) : null;

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
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40 flex-shrink-0">
              <HiOutlineCurrencyDollar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Payments{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
                  Management
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">View and manage all payment transactions</p>
            </div>
          </div>
        </div>

        {/* ══ STAT CARDS ══ */}
        {paymentsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Transactions" delay={0}
              value={paymentsData.length.toLocaleString()}
              sub="all time"
              Icon={HiOutlineTrendingUp}
              gradient="bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800"
              iconBg="bg-linear-to-br from-blue-500 to-cyan-500"
              textColor="text-blue-800 dark:text-blue-100"
            />
            <StatCard
              label="Total Revenue" delay={0.05}
              value={formatCurrency(paymentsData.reduce((s, p) => s + (p.amount || 0), 0))}
              sub="cumulative"
              Icon={HiOutlineCurrencyDollar}
              gradient="bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800"
              iconBg="bg-linear-to-br from-emerald-500 to-teal-500"
              textColor="text-emerald-800 dark:text-emerald-100"
            />
            <StatCard
              label="Filtered Results" delay={0.1}
              value={filteredPayments.length.toLocaleString()}
              sub="matching filters"
              Icon={HiOutlineFilter}
              gradient="bg-linear-to-br from-violet-50 to-purple-50 border-violet-200 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800"
              iconBg="bg-linear-to-br from-violet-500 to-purple-500"
              textColor="text-violet-800 dark:text-violet-100"
            />
            <StatCard
              label="Peak Month" delay={0.15}
              value={peakMonth?.month || '—'}
              sub={peakMonth ? formatCurrency(peakMonth.total) : 'no data'}
              Icon={HiOutlineLightningBolt}
              gradient="bg-linear-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800"
              iconBg="bg-linear-to-br from-amber-500 to-orange-500"
              textColor="text-amber-800 dark:text-amber-100"
            />
          </div>
        )}

        {/* ══ CHART ══ */}
        {paymentsLoading ? <ChartSkeleton /> : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors"
          >
            <div className="p-5 md:p-6">
              {/* Chart header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Analytics Dashboard</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monthly revenue and transaction trends</p>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1 self-start sm:self-auto">
                  {['bar', 'line'].map(type => (
                    <button key={type} onClick={() => setChartType(type)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 capitalize ${chartType === type ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                      {type} Chart
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart canvas */}
              <div className="h-64 sm:h-80 md:h-96">
                <Chart
                  key={chartType}
                  type={chartType === 'bar' ? 'bar' : 'line'}
                  data={chartType === 'bar' ? barData : lineData}
                  options={chartOptions}
                />
              </div>

              {/* Chart summary row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                {[
                  { label: 'Total Revenue (12 Mo)', value: formatCurrency(totalRevenue), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
                  { label: 'Total Transactions',    value: totalTxns.toLocaleString(),   color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
                  { label: 'Peak Revenue Month',    value: peakMonth?.month || '—',       color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`text-center p-4 ${color} rounded-xl`}>
                    <div className="text-xl sm:text-2xl font-bold">{value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ FILTER BAR ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 shadow-sm transition-colors"
        >
          {/* Search row */}
          <div className="relative mb-4">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Transaction ID or Email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={paymentsLoading}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <HiOutlineX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Payment Type</label>
              <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                disabled={paymentsLoading}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50">
                <option value="">All Types</option>
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Start Date</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                  disabled={paymentsLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" />
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 pl-1">End Date</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                  disabled={paymentsLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50" />
              </div>
            </div>
          </div>

          {/* Active filter chips + clear */}
          {hasFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
                  <HiOutlineSearch className="w-3 h-3" />"{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold rounded-full border border-violet-100 dark:border-violet-800">
                  {filters.type}
                  <button onClick={() => setFilters(f => ({ ...f, type: '' }))} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-800">
                  From: {filters.startDate}
                  <button onClick={() => setFilters(f => ({ ...f, startDate: '' }))} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-100 dark:border-amber-800">
                  To: {filters.endDate}
                  <button onClick={() => setFilters(f => ({ ...f, endDate: '' }))} className="ml-0.5 hover:opacity-70"><HiOutlineX className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={clearFilters}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <HiOutlineX className="w-3 h-3" />Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* ══ PAYMENTS TABLE + MOBILE CARDS ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors"
        >
          {/* Table top bar */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Transactions</h3>
              {!paymentsLoading && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Showing <span className="font-bold text-gray-700 dark:text-gray-300">{Math.min(startIdx + 1, filteredPayments.length)}–{Math.min(startIdx + itemsPerPage, filteredPayments.length)}</span> of <span className="font-bold text-gray-700 dark:text-gray-300">{filteredPayments.length}</span> results
                </p>
              )}
            </div>
            {!paymentsLoading && filteredPayments.length !== paymentsData.length && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
                {filteredPayments.length} filtered
              </span>
            )}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700">
                  {[
                    { label: 'Transaction ID',  cls: '' },
                    { label: 'Email',           cls: 'hidden sm:table-cell' },
                    { label: 'Amount',          cls: '' },
                    { label: 'Type',            cls: 'hidden md:table-cell' },
                    { label: 'Date',            cls: 'hidden lg:table-cell' },
                    { label: 'Actions',         cls: '' },
                  ].map(({ label, cls }) => (
                    <th key={label} className={`px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ${cls}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paymentsLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => <TableRowSkeleton key={i} index={i} />)
                ) : currentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <HiOutlineSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="font-semibold text-gray-500 dark:text-gray-400">No payments found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment, idx) => (
                    <motion.tr key={payment._id || idx}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: idx * 0.025 }}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">

                      {/* Transaction ID */}
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
                          {payment.transactionId || `PAY-${idx + 1}`}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px] block">
                          {payment.email || payment.customerEmail || 'N/A'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <TypeBadge type={payment.type} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(payment.paidAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                            className="p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedPayment(payment); setShowDeleteModal(true); }}
                            disabled={deleteMutation.isPending}
                            className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden p-4 space-y-3">
            {paymentsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <MobilePaymentCardSkeleton key={i} />)
            ) : currentPayments.length === 0 ? (
              <div className="py-12 text-center">
                <HiOutlineSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-semibold text-gray-500 dark:text-gray-400">No payments found</p>
              </div>
            ) : (
              currentPayments.map((payment, idx) => (
                <motion.div key={payment._id || idx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: idx * 0.03 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {payment.transactionId || `PAY-${idx + 1}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {payment.email || payment.customerEmail || 'N/A'}
                      </div>
                    </div>
                    <TypeBadge type={payment.type} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(payment.paidAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                      <Download className="w-3.5 h-3.5" />Receipt
                    </button>
                    <button
                      onClick={() => { setSelectedPayment(payment); setShowDeleteModal(true); }}
                      disabled={deleteMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          {!paymentsLoading && filteredPayments.length > itemsPerPage && (
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-900 dark:text-white">{startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredPayments.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredPayments.length}</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (currentPage <= 3) p = i + 1;
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                  else p = currentPage - 2 + i;
                  return (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === p ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                      {p}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500 px-1 text-sm">…</span>
                    <button onClick={() => setCurrentPage(totalPages)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === totalPages ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                      {totalPages}
                    </button>
                  </>
                )}

                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          payment={selectedPayment}
          onClose={() => { setShowDeleteModal(false); setSelectedPayment(null); }}
          onConfirm={() => { if (selectedPayment) deleteMutation.mutate(selectedPayment._id); }}
          isLoading={deleteMutation.isPending}
        />
      )}
      {showReceiptModal && (
        <PaymentReceiptModal
          payment={selectedPayment}
          onClose={() => { setShowReceiptModal(false); setSelectedPayment(null); }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;