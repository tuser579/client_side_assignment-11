import React from 'react';
import { AlertTriangle, X, Trash2, ShieldAlert, CreditCard, Calendar, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const DeleteConfirmationModal = ({ payment, onClose, onConfirm, isLoading }) => {
  if (!payment) return null;

  const formatDate = (ds) => {
    try { return format(parseISO(ds), 'MMM dd, yyyy · hh:mm a'); }
    catch { return ds; }
  };

  const details = [
    { icon: Hash,       label: 'Type',   value: payment?.type },
    { icon: CreditCard, label: 'Amount', value: `৳${payment?.amount?.toLocaleString()}` },
    { icon: Calendar,   label: 'Date',   value: formatDate(payment?.paidAt) },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top danger bar ── */}
        <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-pink-500" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-800 shrink-0">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Payment Record</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-0.5">Permanent Deletion Warning</p>
              <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                This payment record will be permanently removed from your history. You will lose access to this receipt and all associated data.
              </p>
            </div>
          </div>

          {/* Payment details card */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="h-0.5 bg-linear-to-r from-blue-500 to-purple-500" />
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Record to be deleted
              </p>
              <div className="space-y-0">
                {details.map(({ icon: Icon, label, value }, i) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between gap-3 py-2.5 ${
                      i < details.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <span className={`text-xs font-bold text-right ${
                      label === 'Amount'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirmation text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Are you sure you want to permanently delete this record?
          </p>
        </div>

        {/* ── Footer buttons ── */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-rose-600 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;