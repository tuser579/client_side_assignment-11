import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { 
  HiOutlineXCircle, 
  HiOutlineArrowLeft, 
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineCreditCard,
  HiOutlineShieldCheck
} from 'react-icons/hi';

const PaymentCancelled = () => {

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-red-50/30 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 200, 
                            damping: 15,
                            rotate: { duration: 0.5 }
                        }}
                        className="w-24 h-24 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-200"
                    >
                        <HiOutlineXCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Payment Cancelled
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Your payment process was interrupted or cancelled. No charges have been made to your account.
                    </motion.p>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 mb-8"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            What Happened?
                        </h2>
                        <div className="max-w-2xl mx-auto text-gray-600">
                            <p className="mb-4">
                                The payment process was cancelled before completion. This could be due to:
                            </p>
                        </div>
                    </div>

                    {/* Reasons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-red-50/50 p-6 rounded-xl border border-red-100">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <HiOutlineExclamationCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-center mb-2">Manual Cancellation</h3>
                            <p className="text-sm text-gray-600 text-center">
                                You may have clicked cancel or closed the payment window
                            </p>
                        </div>

                        <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <HiOutlineCreditCard className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-center mb-2">Payment Method</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Issues with your payment method or insufficient funds
                            </p>
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <HiOutlineShieldCheck className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-center mb-2">Security Check</h3>
                            <p className="text-sm text-gray-600 text-center">
                                Our security system detected unusual activity
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-4 bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Go Back</span>
                        </button>

                        <Link to="/">
                            <button className="w-full px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-3 group">
                                <HiOutlineRefresh className="w-5 h-5" />
                                <span>Try Again</span>
                            </button>
                        </Link>

                        <Link to="/dashboard/my-payment-history">
                            <button className="w-full px-6 py-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-3 group">
                                <HiOutlineCreditCard className="w-5 h-5" />
                                <span>Payment History</span>
                            </button>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default PaymentCancelled;