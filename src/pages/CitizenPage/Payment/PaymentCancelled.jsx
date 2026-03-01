import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  XCircle, ArrowLeft, RefreshCw, CreditCard,
  ShieldAlert, AlertCircle, Home, History,
  Ban, Wifi, Lock
} from 'lucide-react';

const reasons = [
  {
    icon: Ban,
    iconBg:    'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500 dark:text-red-400',
    border:    'border-red-200 dark:border-red-800',
    title:     'Manual Cancellation',
    desc:      'You may have clicked cancel or closed the payment window before completing.',
  },
  {
    icon: CreditCard,
    iconBg:    'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
    border:    'border-amber-200 dark:border-amber-800',
    title:     'Payment Method Issue',
    desc:      'Problem with your payment method, expired card, or insufficient funds.',
  },
  {
    icon: ShieldAlert,
    iconBg:    'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    border:    'border-blue-200 dark:border-blue-800',
    title:     'Security Check',
    desc:      'Our security system flagged unusual activity and paused the transaction.',
  },
];

const PaymentCancelled = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
    <div className="w-full max-w-3xl mx-auto">

      {/* ── Hero ──────────────────────────────────── */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="relative inline-flex mb-5"
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-red-400/20 dark:bg-red-400/10 blur-xl scale-150" />
          <div className="relative w-20 h-20 bg-linear-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          {/* Alert dot */}
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2"
        >
          Payment{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 to-orange-500">
            Cancelled
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto"
        >
          Your payment was interrupted before completion.{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            No charges have been made
          </span>{' '}
          to your account.
        </motion.p>
      </div>

      {/* ── Main card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
      >
        {/* Red gradient top bar */}
        <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-orange-500" />

        <div className="p-5 sm:p-7">

          {/* Safe badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                No charges applied — your account is safe
              </span>
            </div>
          </div>

          {/* Section title */}
          <div className="text-center mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Why was my payment cancelled?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Common reasons your payment may not have gone through
            </p>
          </div>

          {/* Reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {reasons.map(({ icon: Icon, iconBg, iconColor, border, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border ${border} p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center mb-3 border ${border}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700 mb-5" />

          {/* Help tip */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
            <Wifi className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Tip:</span> Make sure your internet connection is stable and your card details are up to date before trying again. If the issue persists, contact your bank or our support team.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Go Back */}
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:scale-[1.01]"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            {/* Try Again */}
            <Link to="/" className="block">
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </Link>

            {/* Payment History */}
            <Link to="/dashboard/my-payment-history" className="block">
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                <History className="w-4 h-4" />
                Payment History
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Footer note ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1.5"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        Need help? Contact us at{' '}
        <a href="mailto:support@cityfix.com" className="text-blue-500 dark:text-blue-400 hover:underline font-semibold">
          support@cityfix.com
        </a>
      </motion.p>
    </div>
  </div>
);

export default PaymentCancelled;