// import { useQuery } from '@tanstack/react-query';
// import React from 'react';
// import useAxiosSecure from '../../../hooks/useAxiosSecure';
// import useAuth from '../../../hooks/useAuth';


// const MyPaymentHistory = () => {
//     const { user } = useAuth();
//     const axiosSecure = useAxiosSecure();

//     const { data: payments = [] } = useQuery({
//         queryKey: ['myPayments', user.email],
//         queryFn: async () => {
//             const res = await axiosSecure.get(`/myPayments?email=${user.email}`)
//             return res.data;
//         }
//     })

//     return (
//         <div>
//             <h2 className="text-5xl">Payment History: {payments.length}</h2>
//             <div className="overflow-x-auto">
//                 <table className="table table-zebra">
//                     {/* head */}
//                     <thead>
//                         <tr>
//                             <th></th>
//                             <th>Type</th>
//                             <th>Amount</th>
//                             <th>Paid Time</th>
//                             <th>Transaction Id</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {
//                             payments.map((payment, index) => <tr key={payment._id}>
//                                 <th>{index + 1}</th>
//                                 <td>{payment.type}</td>
//                                 <td>৳{payment.amount}</td>
//                                 <td>{payment.paidAt}</td>
//                                 <td>{payment.transactionId}</td>
//                             </tr>)
//                         }


//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default MyPaymentHistory;



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Receipt
} from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { format, parseISO } from 'date-fns';
import DeleteConfirmationModal from './DeleteConfirmationModal'; 
import PaymentReceiptModal from './PaymentReceiptModal';

const MyPaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'paidAt', direction: 'desc' });

    // Fetch payments
    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['myPayments', user.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/myPayments?email=${user.email}`);
            return res.data;
        }
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

    // Filter and search payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = 
            payment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.amount?.toString().includes(searchTerm);
        
        const matchesType = selectedType === 'all' || payment.type === selectedType;
        
        return matchesSearch && matchesType;
    });

    // Sort payments
    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = sortedPayments.slice(startIndex, startIndex + itemsPerPage);

    // Format date
    const formatDate = (dateString) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'MMM dd, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

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

    // Types for filter
    const paymentTypes = ['all', ...new Set(payments.map(p => p.type).filter(Boolean))];

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load payments</h3>
                    <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
                    <button 
                        onClick={() => queryClient.invalidateQueries(['myPayments', user.email])}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Payment History
                    </h1>
                    <p className="text-gray-600">
                        Manage and review all your payment transactions
                    </p>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Payments</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Amount</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                    ৳{payments.reduce((sum, p) => sum + (p.amount || 0), 0)}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Controls */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by type or transaction ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                                >
                                    {paymentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type === 'all' ? 'All Types' : type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th 
                                        className="py-4 px-6 text-left cursor-pointer"
                                        onClick={() => handleSort('type')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">Type</span>
                                            {sortConfig.key === 'type' && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="py-4 px-6 text-left cursor-pointer"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">Amount</span>
                                            {sortConfig.key === 'amount' && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="py-4 px-6 text-left cursor-pointer"
                                        onClick={() => handleSort('paidAt')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">Date & Time</span>
                                            {sortConfig.key === 'paidAt' && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-left">
                                        <span className="font-semibold text-gray-700">Transaction ID</span>
                                    </th>
                                    <th className="py-4 px-6 text-left">
                                        <span className="font-semibold text-gray-700">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="text-gray-500">
                                                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg">No payment records found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPayments.map((payment, index) => (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        payment.type === 'Premium Subscription' ? 'bg-blue-500' :
                                                        payment.type === 'Course' ? 'bg-green-500' :
                                                        'bg-purple-500'
                                                    }`}></div>
                                                    <span className="font-medium text-gray-900">{payment.type}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">৳{payment.amount}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">{formatDate(payment.paidAt)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                                                        {payment.transactionId}
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(payment.transactionId);
                                                            // Add toast notification here
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
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
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedPayments.length)} of {sortedPayments.length} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
        </div>
    );
};

// ChevronDown component for sorting
const ChevronDown = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

// Copy component for copying
const Copy = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export default MyPaymentHistory;