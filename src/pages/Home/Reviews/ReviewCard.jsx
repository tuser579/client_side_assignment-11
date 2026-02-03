import React from 'react';
import { FaStar, FaQuoteLeft, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ReviewCard = ({ review }) => {
    const { 
        userName, 
        review: testimonial, 
        user_photoURL, 
        rating = 5, 
        date,
        email 
    } = review;

    // Format date
    const formattedDate = date 
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : 'Recently';

    // Get rating color based on score
    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'from-emerald-500 to-green-500';
        if (rating >= 4) return 'from-green-500 to-lime-500';
        if (rating >= 3) return 'from-yellow-500 to-amber-500';
        if (rating >= 2) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-rose-600';
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
                y: -8,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            transition={{ duration: 0.3 }}
            className="group relative bg-linear-to-br from-white via-gray-50 to-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
            {/* Background linear accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${getRatingColor(rating)} opacity-5 group-hover:opacity-10 transition-opacity duration-300 -translate-y-16 translate-x-16 rotate-45`}></div>

            {/* Content container */}
            <div className="relative p-6 md:p-8">
                {/* Header with rating and date */}
                <div className="flex justify-between items-start mb-6">
                    {/* Rating stars */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar 
                                key={star}
                                className={`w-5 h-5 ${star <= rating 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-gray-300 fill-gray-200'
                                }`}
                            />
                        ))}
                        <span className="ml-2 font-bold text-lg bg-linear-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
                            {rating.toFixed(1)}
                        </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {/* Review text */}
                <div className="mb-8">
                    <p className="text-gray-700 leading-relaxed text-lg line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                        {testimonial}
                    </p>
                </div>

                {/* Read more linear fade */}
                <div className="absolute bottom-20 left-0 right-0 h-12"></div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200 my-6"></div>

                {/* User profile */}
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-4 border-white shadow-lg overflow-hidden">
                            <img 
                                src={user_photoURL} 
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {userName || 'Anonymous User'}
                            </h3>
                        </div>
                        {email && (
                            <p className="text-gray-500 text-sm truncate">
                                {email}
                            </p>
                        )}
                    </div>

                    {/* Rating badge */}
                    <div className={`px-4 py-2 rounded-full bg-linear-to-r ${getRatingColor(rating)} text-white font-bold text-sm shadow-md`}>
                        {rating >= 4.5 ? 'Excellent' : 
                         rating >= 4 ? 'Very Good' : 
                         rating >= 3 ? 'Good' : 
                         rating >= 2 ? 'Fair' : 'Poor'}
                    </div>
                </div>

                {/* Review length indicator */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                            {testimonial.length > 200 ? 'Detailed Review' : 'Brief Review'}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${testimonial.length > 300 ? 'bg-green-500' : testimonial.length > 150 ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                            {testimonial.length} characters
                        </span>
                    </div>
                </div>
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-linear-to-r group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 rounded-2xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-30"></div>
        </motion.div>
    );
};


// Empty state component
const EmptyReviewsState = () => {
    return (
        <div className="text-center py-12">
            <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                    <FaQuoteLeft className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 mb-6">
                    Be the first to share your experience with our community!
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-50 to-purple-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-linear-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                    <span className="text-gray-600">Waiting for reviews...</span>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;