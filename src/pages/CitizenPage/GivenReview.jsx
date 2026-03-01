import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import {
  Send, MessageSquareQuote, Smile, CheckCircle2,
  AlertCircle, Sparkles, Star
} from 'lucide-react';

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-lime-500', 'text-emerald-500'];
const ratingBg    = ['', 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                         'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                         'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                         'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800',
                         'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'];

const tips = [
  'Be specific about what you liked or disliked',
  'Mention how the service helped you',
  'Share your overall experience honestly',
  'Keep it constructive and respectful',
];

const GivenReview = () => {
  const { user }      = useAuth();
  const axiosSecure   = useAxiosSecure();
  const [rating,        setRating]        = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText,    setReviewText]    = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const active   = hoveredRating || rating;
  const charLeft = 300 - reviewText.length;

  const handleReviewChange = (e) => {
    if (e.target.value.length <= 300) setReviewText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating)                          { toast.error('Please select a rating!'); return; }
    if (reviewText.trim().length < 15)    { toast.error('Write at least 15 characters.'); return; }

    setIsSubmitting(true);
    try {
      const reviewData = {
        userName:      user?.displayName,
        user_photoURL: user?.photoURL,
        rating,
        review:        reviewText,
        date:          new Date().toISOString(),
        email:         user?.email,
      };

      const confirm = await Swal.fire({
        title: 'Submit Review?', text: 'Do you want to send this review?', icon: 'question',
        showCancelButton: true, confirmButtonColor: '#3b82f6', cancelButtonColor: '#6b7280',
        confirmButtonText: 'Submit', reverseButtons: true,
      });
      if (!confirm.isConfirmed) { setIsSubmitting(false); return; }

      Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const res = await axiosSecure.post('/givenReview', reviewData);
      if (res.data.insertedId) {
        Swal.fire({ title: 'Success!', text: 'Review submitted!', icon: 'success', timer: 2000, showConfirmButton: false });
        setRating(0); setReviewText('');
      } else throw new Error('Failed');
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to submit.', icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', borderRadius: '12px' } }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* ── Card ────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">

          {/* Gradient top bar */}
          <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

          <div className="p-6 sm:p-8">

            {/* ── Header ────────────────────────────── */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
                <MessageSquareQuote className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Share Your{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
                  Experience
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                Your feedback helps us improve our service
              </p>
            </div>

            {/* ── User Info ─────────────────────────── */}
            {user ? (
              <div className="flex items-center gap-4 mb-7 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl">
                <div className="relative shrink-0">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user?.displayName || 'Guest User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified User
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-7 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Please <span className="font-bold underline cursor-pointer">login</span> to submit a review
                </p>
              </div>
            )}

            {/* ── Rating ────────────────────────────── */}
            <div className="mb-7">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                Rate Your Experience <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-col items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl">
                {/* Stars */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      disabled={!user}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-125 active:scale-110 duration-150"
                    >
                      <FaStar
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-150 ${
                          star <= active
                            ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                            : 'text-gray-200 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Score + label */}
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black ${active ? ratingColors[active] : 'text-gray-300 dark:text-gray-600'}`}>
                    {active > 0 ? `${active}.0` : '—'}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">/</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">5.0</span>
                  {active > 0 && (
                    <motion.span
                      key={active}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${ratingBg[active]}`}
                    >
                      <Star className="w-3 h-3" />
                      {ratingLabels[active]}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Review Text ───────────────────────── */}
            <div className="mb-7">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                Your Review <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MessageSquareQuote className="absolute top-3.5 left-3.5 w-4 h-4 text-blue-400 pointer-events-none" />
                <textarea
                  value={reviewText}
                  onChange={handleReviewChange}
                  disabled={!user}
                  maxLength={300}
                  rows={5}
                  placeholder={user
                    ? 'Tell us about your experience — what did you like? What could be improved?'
                    : 'Please login to write a review…'}
                  className="w-full pl-10 pr-4 pt-3.5 pb-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Char counter */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold ${
                    charLeft <= 20
                      ? 'text-red-500'
                      : charLeft <= 50
                      ? 'text-amber-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {300 - reviewText.length} left
                  </span>
                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        charLeft <= 20 ? 'bg-red-500' : charLeft <= 50 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(reviewText.length / 300) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Min length hint */}
              {reviewText.length > 0 && reviewText.length < 15 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  At least {15 - reviewText.length} more characters needed
                </p>
              )}
            </div>

            {/* ── Tips ──────────────────────────────── */}
            <div className="mb-7 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3">
                <Smile className="w-4 h-4" /> Writing Tips
              </h4>
              <ul className="space-y-1.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Submit ────────────────────────────── */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              type="button"
              className="w-full py-3.5 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : user ? (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Login to Submit
                </>
              )}
            </button>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {user
                ? 'Your review helps others make informed decisions. Thank you!'
                : 'Please login to share your feedback with our community.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GivenReview;