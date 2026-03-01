import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import {
  CheckCircle2, FileText, ShoppingBag, Calendar,
  Banknote, ArrowRight, ClipboardCheck, CreditCard,
  Copy, Check, Shield, Sparkles, AlertCircle, Clock,
  ReceiptText, Hash
} from 'lucide-react';

/* ─── helpers ── */
const formatDate = (ds) => {
  if (!ds) return '—';
  return new Date(ds).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);

/* ─── sub-components ── */
const InfoRow = ({ icon: Icon, iconBg, iconColor, label, children }) => (
  <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-6 h-6 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
    <div className="pl-8">{children}</div>
  </div>
);

const CopyField = ({ label, value, icon: Icon }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Failed to copy'); }
  };
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="h-0.5 bg-linear-to-r from-blue-500 to-purple-500" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />}
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 truncate">
            {value || '—'}
          </code>
          <button
            onClick={handleCopy}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border text-xs font-bold transition-all hover:scale-105 ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
            title="Copy"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Loading State ── */
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
    <div className="text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <Banknote className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 dark:text-white">Processing Payment</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Please wait while we confirm…</p>
      </div>
    </div>
  </div>
);

/* ─── Error State ── */
const ErrorState = ({ navigate }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
    <div className="w-full max-w-md text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Processing Issue</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We couldn't confirm your payment. Please check your payment history or contact support.
        </p>
      </div>
      <button
        onClick={() => navigate('/dashboard/my-payment-history')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
      >
        <FileText className="w-4 h-4" /> View Payment History
      </button>
    </div>
  </div>
);

/* ─── Main ── */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const sessionId      = searchParams.get('session_id');
  const axiosSecure    = useAxiosSecure();

  const { data: paymentInfo = {}, isLoading, isError } = useQuery({
    queryKey: ['paymentSuccess', sessionId],
    queryFn: async () => {
      const res = await axiosSecure.patch(`/payment-success?session_id=${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
    select: (data) => ({
      transactionId: data.transactionId,
      trackingId:    data.trackingId,
      amount:        data.amount,
      currency:      data.currency,
      timestamp:     data.timestamp || new Date().toISOString(),
      status:        'succeeded',
      paymentMethod: data.paymentMethod || 'Credit Card',
      type:          data.type,
    })
  });

  if (isLoading)                         return <LoadingState />;
  if (isError || !paymentInfo.transactionId) return <ErrorState navigate={navigate} />;

  const infoCards = [
    { icon: ShoppingBag, iconBg: 'bg-blue-50 dark:bg-blue-900/30',    iconColor: 'text-blue-500',    label: 'Payment Type',   value: paymentInfo.type },
    { icon: Calendar,    iconBg: 'bg-violet-50 dark:bg-violet-900/30', iconColor: 'text-violet-500',  label: 'Date & Time',    value: formatDate(paymentInfo.timestamp) },
    { icon: CreditCard,  iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', iconColor: 'text-fuchsia-500', label: 'Payment Method', value: paymentInfo.paymentMethod },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

      <div className="max-w-3xl mx-auto">

        {/* ── Hero header ───────────────────────── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="relative inline-flex mb-5"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 dark:bg-emerald-400/10 blur-xl scale-150" />
            <div className="relative w-20 h-20 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight"
          >
            Payment{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">
              Successful!
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto"
          >
            Your transaction has been completed and verified. A confirmation has been recorded.
          </motion.p>
        </div>

        {/* ── Main card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
        >
          {/* Gradient top bar */}
          <div className="h-1.5 bg-linear-to-r from-emerald-400 via-teal-500 to-blue-500" />

          <div className="p-5 sm:p-7">

            {/* ── Card header row ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                  <ReceiptText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Payment Details</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Transaction confirmed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {paymentInfo.status === 'succeeded' ? 'Completed' : 'Processing'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-xl">
                  <Shield className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            {/* ── Amount hero ── */}
            <div className="relative overflow-hidden bg-linear-to-br from-emerald-500 via-teal-500 to-blue-600 rounded-xl p-5 sm:p-6 mb-6 shadow-xl shadow-emerald-500/20">
              <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-teal-300/10 blur-2xl" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Total Amount Paid</p>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatCurrency(paymentInfo.amount, paymentInfo.currency)}
                  </p>
                  <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(paymentInfo.timestamp)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* ── Info grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {infoCards.map(({ icon, iconBg, iconColor, label, value }) => (
                <InfoRow key={label} icon={icon} iconBg={iconBg} iconColor={iconColor} label={label}>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{value || '—'}</p>
                </InfoRow>
              ))}
            </div>

            {/* ── Transaction IDs ── */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Transaction Information
                </p>
              </div>
              <div className="space-y-3">
                <CopyField label="Transaction ID" value={paymentInfo.transactionId} icon={ClipboardCheck} />
                {paymentInfo.trackingId && (
                  <CopyField label="Tracking ID" value={paymentInfo.trackingId} icon={ClipboardCheck} />
                )}
              </div>
            </div>

            {/* ── CTA button ── */}
            <button
              onClick={() => navigate('/dashboard/my-payment-history')}
              className="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 group"
            >
              <FileText className="w-4 h-4" />
              View Payment History
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          Your payment is secured and encrypted. Keep your transaction ID for future reference.
        </motion.p>
      </div>
    </div>
  );
};

export default PaymentSuccess;