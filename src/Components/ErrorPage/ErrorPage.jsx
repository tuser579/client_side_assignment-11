import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen mb-10 flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 px-4">
            <div className="mt-12 mb-10">
                <div className="w-64 h-64 mx-auto bg-linear-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-7xl font-bold text-gray-800 mb-4">
                        404
                    </div>
                    <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-6">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto">
                        Oops! The page you're looking for seems to have taken a wrong turn.
                        Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;