import React, { useState } from 'react';
import { FaStar, FaQuoteLeft, FaRegSmileBeam, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth'; // Adjust path as needed
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const GivenReview = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleRatingClick = (value) => {
        setRating(value);
    };

    const handleReviewChange = (e) => {
        const text = e.target.value;
        if (text.length <= 300) {
            setReviewText(text);
            setCharCount(text.length);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating) {
            toast.error('Please select a rating!');
            return;
        }

        if (reviewText.trim().length < 15) {
            toast.error('Please write a review with at least 15 characters!');
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData = {
                userName: user?.displayName,
                user_photoURL: user?.photoURL,
                rating: rating,
                review: reviewText,
                date: new Date().toISOString(),
                email: user?.email
            };

            // Send review to backend
            Swal.fire({
                title: "Submit Review Confirmation",
                text: "Do you want to send this review?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Send Review!",
                cancelButtonText: "Cancel",
                reverseButtons: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    // Show loading indicator while saving
                    Swal.fire({
                        title: "Saving Review...",
                        text: "Please wait while we save your review.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });

                    // Save the review to the database
                    axiosSecure
                        .post("/givenReview", reviewData)
                        .then((res) => {
                            if (res.data.insertedId) {
                                // Close loading indicator
                                Swal.close();

                                // Show success message
                                Swal.fire({
                                    title: "Success!",
                                    text: "Your review has been submitted successfully.",
                                    icon: "success",
                                    confirmButtonColor: "#3085d6",
                                    showCancelButton: true,
                                    cancelButtonText: "Close",
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        console.log("Review submission confirmed:", result);
                                    }
                                });
                            } else {
                                throw new Error("Failed to submit review");
                            }
                        })
                        .catch((error) => {
                            console.error("Error saving review:", error);

                            Swal.fire({
                                title: "Error!",
                                text:
                                    error.response?.data?.message ||
                                    "Failed to submit the review. Please try again.",
                                icon: "error",
                                confirmButtonText: "Try Again",
                            });
                        });
                }
            });

            // Reset form
            setRating(0);
            setReviewText('');
            setCharCount(0);

        } catch (error) {
            toast.error('Failed to submit review. Please try again.');
            console.error('Review submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <Toaster position="top-center" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-linear-to-br from-gray-50 to-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto border border-gray-200/50 backdrop-blur-sm"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Share Your Experience
                    </h2>
                    <p className="text-gray-600 mt-2">Your feedback helps us improve our service</p>
                </div>

                {/* User Info */}
                {user ? (
                    <div className="flex items-center gap-4 mb-8 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl">
                        <div className="relative">
                            <img
                                src={user?.photoURL}
                                alt={user?.displayName}
                                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{user?.displayName || 'Guest User'}</h3>
                            <p className="text-sm text-gray-600">You're submitting a review as {user?.email || 'anonymous user'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 p-4 bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl text-center">
                        <p className="text-gray-700">
                            ⚠️ Please <span className="font-semibold text-blue-600">login</span> to submit a review
                        </p>
                    </div>
                )}

                {/* Rating Section */}
                <div className="mb-8">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                        How would you rate your experience? *
                    </label>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-2 transform hover:scale-125 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!user}
                                >
                                    <FaStar
                                        className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-gray-300 fill-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-bold bg-linear-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                {rating}.0
                            </span>
                            <span className="text-gray-600 ml-2">/ 5.0</span>
                            <p className="text-sm text-gray-500 mt-2">
                                {rating === 0 ? 'Select your rating' :
                                    rating === 1 ? 'Poor' :
                                        rating === 2 ? 'Fair' :
                                            rating === 3 ? 'Good' :
                                                rating === 4 ? 'Very Good' : 'Excellent'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Review Text Section */}
                <div className="mb-8">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Share your thoughts *
                    </label>
                    <div className="relative">
                        <div className="absolute top-4 left-4 text-blue-500">
                            <FaQuoteLeft className="w-5 h-5" />
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={handleReviewChange}
                            placeholder={user ? "Tell us about your experience... What did you like? What could be improved?" : "Please login to write a review"}
                            className="w-full h-40 pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            maxLength={300}
                            disabled={!user}
                        />
                        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                            {charCount}/300
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mb-8 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaRegSmileBeam className="text-green-500" />
                        Writing Tips:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Be specific about what you liked or disliked</li>
                        <li>• Mention how the service helped you</li>
                        <li>• Share your overall experience honestly</li>
                        <li>• Keep it constructive and respectful</li>
                    </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !user}
                        className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <FaPaperPlane className="w-5 h-5" />
                                <span>{user ? 'Submit Review' : 'Login to Submit'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                        {user
                            ? "Your review will help others make informed decisions. Thank you for sharing!"
                            : "Please login to share your feedback with our community!"
                        }
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default GivenReview;