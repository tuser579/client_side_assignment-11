import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen py-15 bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-300 overflow-hidden relative">

            {/* Ambient blobs */}
            <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[120px]" />

            {/* Grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            <div className="relative text-center max-w-lg mx-auto">

                {/* Floating 404 illustration */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8"
                >
                    {/* Glowing circle */}
                    <div className="relative w-52 h-52 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 blur-2xl" />
                        <div className="relative w-full h-full rounded-full bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-2xl">
                            {/* Sad face SVG */}
                            <svg className="w-24 h-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        {/* Orbit dots */}
                        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                            <motion.div
                                key={i}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0"
                                style={{ transformOrigin: 'center' }}
                            >
                                <div
                                    className="absolute w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400 opacity-40"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${deg}deg) translateX(110px) translateY(-50%)`
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Text content */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* 404 */}
                    <div className="relative inline-block mb-4">
                        <span className="text-[7rem] sm:text-[9rem] font-black leading-none text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-500 to-fuchsia-500 select-none">
                            404
                        </span>
                        {/* Shadow text */}
                        <span
                            className="absolute inset-0 text-[7rem] sm:text-[9rem] font-black leading-none text-transparent select-none pointer-events-none"
                            style={{
                                WebkitTextStroke: '1px',
                                WebkitTextStrokeColor: 'rgba(139,92,246,0.15)'
                            }}
                        >
                            404
                        </span>
                    </div>

                    {/* Badge */}
                    <div className="flex justify-center mb-5">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-4 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Page Not Found
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
                        Oops! You've taken a
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600"> wrong turn.</span>
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Back to Home
                        </Link>
                        <Link
                            to="/all-issue"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Browse Issues
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;