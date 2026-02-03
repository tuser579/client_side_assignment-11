import React from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { motion } from 'framer-motion';
import { 
  HiCheckCircle, 
  HiOutlineDocumentText, 
  HiOutlineReceiptTax,
  HiOutlineShoppingBag,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRight,
  HiOutlineClipboardCheck
} from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const axiosSecure = useAxiosSecure();

    // TanStack Query to fetch payment success data
    const { data: paymentInfo = {}, isLoading, isError } = useQuery({
        queryKey: ['paymentSuccess', sessionId],
        queryFn: async () => {
            const res = await axiosSecure.patch(`/payment-success?session_id=${sessionId}`);
            return res.data;
        },
        enabled: !!sessionId,
        onSuccess: (data) => {
            console.log("result", data);
        },
        onError: (err) => {
            console.error("Payment confirmation error:", err);
        },
        select: (data) => ({
            transactionId: data.transactionId,
            trackingId: data.trackingId,
            amount: data.amount,
            currency: data.currency,
            timestamp: data.timestamp || new Date().toISOString(),
            status: 'succeeded',
            paymentMethod: data.paymentMethod || 'Credit Card',
            type: data.type
        })
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to Clipboard!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        })
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50/30 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !paymentInfo.transactionId) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50/30 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-linear-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-200">
                            <HiCheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Payment Processing Issue
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            There was an issue confirming your payment. Please check your payment history.
                        </p>
                    </div>
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/dashboard/my-payment-history')}
                            className="px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium"
                        >
                            Check Payment History
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50/30 p-4 md:p-6 lg:p-8">
            
            {/* for notification */}
            <ToastContainer />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-200"
                    >
                        <HiCheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Payment Successful!
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Thank you for your payment. Your transaction has been completed successfully.
                    </motion.p>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <HiOutlineReceiptTax className="w-6 h-6 text-blue-600" />
                            Payment Details
                        </h2>
                        <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            {paymentInfo.status === 'succeeded' ? 'Completed' : 'Processing'}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <HiOutlineShoppingBag className="w-4 h-4" />
                                    Type
                                </div>
                                <div className="font-semibold text-gray-900">{paymentInfo.type}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <HiOutlineCalendar className="w-4 h-4" />
                                    Date & Time
                                </div>
                                <div className="font-semibold text-gray-900">{formatDate(paymentInfo.timestamp)}</div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                                    Amount Paid
                                </div>
                                <div className="font-bold text-2xl text-green-600">
                                    {formatCurrency(paymentInfo.amount, paymentInfo.currency)}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="text-sm text-gray-500">Payment Method</div>
                                <div className="font-semibold text-gray-900">{paymentInfo.paymentMethod}</div>
                            </div>
                        </div>

                        {/* Transaction IDs */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
                            
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-500 mb-1">Transaction ID</div>
                                        <div className="font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800">
                                            {paymentInfo.transactionId || 'Loading...'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCopyToClipboard(paymentInfo.transactionId)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <HiOutlineClipboardCheck className="w-4 h-4" />
                                        Copy
                                    </button>
                                </div>
                                
                                {paymentInfo.trackingId && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-500 mb-1">Tracking ID</div>
                                            <div className="font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800">
                                                {paymentInfo.trackingId}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopyToClipboard(paymentInfo.trackingId)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <HiOutlineClipboardCheck className="w-4 h-4" />
                                            Copy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View Payment History Button */}
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={() => navigate('/dashboard/my-payment-history')}
                                className="w-full px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-3 group"
                            >
                                <HiOutlineDocumentText className="w-5 h-5" />
                                <span>View Payment History</span>
                                <HiOutlineArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default PaymentSuccess;