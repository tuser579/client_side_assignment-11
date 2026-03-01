import React from 'react';
import { motion } from 'framer-motion';

const ReviewCard = ({ review }) => {
    const { userName, rating, review: comment, date, user_photoURL } = review;

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                        i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
        }
        return stars;
    };

    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Recent';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col border border-gray-200 dark:border-gray-700"
        >
            {/* Card Header */}
            <div className="bg-linear-to-r from-blue-500 to-cyan-500 px-4 sm:px-5 md:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Photo */}
                    <div className="shrink-0">
                        {user_photoURL ? (
                            <img
                                src={user_photoURL}
                                alt={userName}
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 border-white object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                                <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">
                                    {userName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
                            {userName || 'Anonymous User'}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-4 sm:p-5 md:p-6">
                {/* Rating and Date */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex gap-0.5 sm:gap-1">
                        {renderStars()}
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                        {formattedDate}
                    </span>
                </div>

                {/* Review Comment */}
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-4 sm:line-clamp-5 md:line-clamp-6">
                    {comment || "Great service! The issue reporting system is very user-friendly and efficient. I appreciate the transparency in tracking my reported problems."}
                </p>
            </div>
        </motion.div>
    );
};

export default ReviewCard;