import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    Trash2, Download, Filter, Search, ChevronLeft, ChevronRight,
    AlertCircle, Calendar, DollarSign, Receipt, RefreshCw,
    CreditCard, CheckCircle, Copy, Check
} from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { format, parseISO } from 'date-fns';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import PaymentReceiptModal from './PaymentReceiptModal';
import MyPaymentHistorySkeleton from '../../../Components/MyPaymentHistorySkeleton';

const ChevronDown = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const MyPaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'paidAt', direction: 'desc' });
    const [copiedId, setCopiedId] = useState(null);

    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['myPayments', user.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/myPayments?email=${user.email}`);
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (paymentId) => {
            await axiosSecure.delete(`/myPaymentDelete/${paymentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myPayments', user.email]);
            setShowDeleteModal(false);
        }
    });

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.amount?.toString().includes(searchTerm);
        const matchesType = selectedType === 'all' || payment.type === selectedType;
        return matchesSearch && matchesType;
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key], bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = sortedPayments.slice(startIndex, startIndex + itemsPerPage);
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentTypes = ['all', ...new Set(payments.map(p => p.type).filter(Boolean))];

    const formatDate = (dateString) => {
        try { return format(parseISO(dateString), 'MMM dd, yyyy · HH:mm'); }
        catch { return dateString; }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleCopy = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getTypeStyle = (type) => {
        if (type === 'Premium Subscription') return { dot: 'bg-violet-500', badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800' };
        if (type === 'Priority') return { dot: 'bg-blue-500', badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
        return { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    };

    const selectCls = "px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

    if (isLoading) return <MyPaymentHistorySkeleton />;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unable to load payments</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Please check your connection and try again.</p>
                <button
                    onClick={() => queryClient.invalidateQueries(['myPayments', user.email])}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg"
                >
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">

                {/* ── Header ──────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-center sm:text-start text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                            Payment{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">History</span>
                        </h1>
                        <p className="text-center sm:text-start text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Review and manage all your transactions
                        </p>
                    </div>
                </div>

                {/* ── Stat Cards ──────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                        {
                            label: 'Total Payments', value: payments.length,
                            icon: Receipt, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-500',
                            accent: 'from-blue-500 to-cyan-400'
                        },
                        {
                            label: 'Total Amount', value: `৳${totalAmount.toLocaleString()}`,
                            icon: DollarSign, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-500',
                            accent: 'from-emerald-500 to-teal-400'
                        },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex flex-col items-center sm:items-start bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${s.iconColor}`} />
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">{s.value}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                                <div className={`mt-3 h-0.5 rounded-full bg-linear-to-r ${s.accent}`} />
                            </div>
                        );
                    })}
                </div>

                {/* ── Filters ─────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by type or transaction ID..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }} className={selectCls}>
                                {paymentTypes.map(type => (
                                    <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
                                ))}
                            </select>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={selectCls}>
                                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Result Count ────────────────────────────── */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {sortedPayments.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, sortedPayments.length)}
                        </span>{' '}
                        of <span className="font-semibold text-gray-900 dark:text-white">{sortedPayments.length}</span> transactions
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Page {currentPage} / {totalPages || 1}</p>
                </div>

                {/* ── Table ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">

                    {/* Mobile cards view */}
                    <div className="block sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {paginatedPayments.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                    <Receipt className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No payment records found</p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try adjusting your search or filter</p>
                            </div>
                        ) : paginatedPayments.map((payment) => {
                            const ts = getTypeStyle(payment.type);
                            return (
                                <div
                                    key={payment._id}
                                    className="relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                >
                                    {/* Top row — type badge + amount */}
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${ts.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                                            {payment.type}
                                        </span>
                                        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                            ৳{payment.amount?.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Meta rows */}
                                    <div className="space-y-2 mb-3">

                                        {/* Date row */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                                Payment Date
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                {formatDate(payment.paidAt)}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-gray-100 dark:bg-gray-700" />

                                        {/* Transaction ID row */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide shrink-0">
                                                Txn ID
                                            </span>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <code className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg truncate max-w-[150px]">
                                                    {payment.transactionId}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(payment.transactionId)}
                                                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                                                    title="Copy transaction ID"
                                                >
                                                    {copiedId === payment.transactionId
                                                        ? <Check className="w-3 h-3 text-emerald-500" />
                                                        : <Copy className="w-3 h-3" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-sm transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Receipt
                                        </button>
                                        <button
                                            onClick={() => { setSelectedPayment(payment); setShowDeleteModal(true); }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 hover:shadow-sm transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>

                                    {/* Subtle left accent bar on hover */}
                                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-linear-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {[
                                        { label: 'Type', key: 'type' },
                                        { label: 'Amount', key: 'amount' },
                                        { label: 'Date & Time', key: 'paidAt' },
                                        { label: 'Transaction ID', key: null },
                                        { label: 'Actions', key: null },
                                    ].map((col, i) => (
                                        <th
                                            key={i}
                                            onClick={() => col.key && handleSort(col.key)}
                                            className={`py-3.5 px-5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${col.key ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {col.label}
                                                {col.key && (
                                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'rotate-180 text-blue-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {paginatedPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                                <Receipt className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No payment records found</p>
                                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try adjusting your search or filter</p>
                                        </td>
                                    </tr>
                                ) : paginatedPayments.map((payment) => {
                                    const ts = getTypeStyle(payment.type);
                                    return (
                                        <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">

                                            {/* Type */}
                                            <td className="py-4 px-5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${ts.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                                                    {payment.type}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="py-4 px-5">
                                                <span className="text-sm font-black text-gray-900 dark:text-white">৳{payment.amount}</span>
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                    {formatDate(payment.paidAt)}
                                                </div>
                                            </td>

                                            {/* Transaction ID */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg max-w-[160px] truncate">
                                                        {payment.transactionId}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopy(payment.transactionId)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                                                        title="Copy ID"
                                                    >
                                                        {copiedId === payment.transactionId
                                                            ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            : <Copy className="w-3.5 h-3.5" />
                                                        }
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => { setSelectedPayment(payment); setShowReceiptModal(true); }}
                                                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedPayment(payment); setShowDeleteModal(true); }}
                                                        disabled={deleteMutation.isLoading}
                                                        className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ───────────────────────────────── */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
                                <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-xl transition-colors ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let p;
                                    if (totalPages <= 5) p = i + 1;
                                    else if (currentPage <= 3) p = i + 1;
                                    else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                                    else p = currentPage - 2 + i;
                                    return (
                                        <button
                                            key={p} onClick={() => setCurrentPage(p)}
                                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === p ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-xl transition-colors ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <DeleteConfirmationModal
                    payment={selectedPayment}
                    onClose={() => { setShowDeleteModal(false); setSelectedPayment(null); }}
                    onConfirm={() => deleteMutation.mutate(selectedPayment._id)}
                    isLoading={deleteMutation.isLoading}
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

export default MyPaymentHistory;