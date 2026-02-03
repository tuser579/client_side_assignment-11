import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router'; 

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const slides = [
        {
            id: 1,
            title: "Report. Track. Resolve.",
            subtitle: "Your Voice Matters in Building Better Cities",
            description: "Join thousands of citizens making their neighborhoods safer and cleaner by reporting infrastructure issues in real-time.",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            color: "from-blue-600 to-cyan-500",
            buttonText: "Report an Issue",
            to: "/dashboard/reportIssue",
            icon: "📱"
        },
        {
            id: 2,
            title: "Real-Time Issue Tracking",
            subtitle: "Never Wonder About Status Again",
            description: "Track your reported issues from submission to resolution with live updates and notifications.",
            image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            color: "from-purple-600 to-pink-500",
            buttonText: "View Active Issues",
            to: "/all-issue",
            icon: "📊"
        },
        {
            id: 3,
            title: "Community Solutions",
            subtitle: "Together We Build Better Cities",
            description: "Vote on important issues, collaborate with neighbors, and see real impact in your community.",
            image: "https://images.unsplash.com/photo-1542223616-740d5dff7f56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            color: "from-green-600 to-emerald-500",
            buttonText: "Join Community",
            to: "/register",
            icon: "👥"
        }
    ];

    // Auto slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Enhanced button click handler with debugging
    const handleButtonClick = () => {
        const link = slides[currentSlide].to;
        // console.log('Button clicked, navigating to:', link);
        
        // Check if navigate function exists
        if (navigate) {
            navigate(link);
        } else {
            // console.error('Navigate function is not available');
            // Fallback to window location if navigate fails
            window.location.href = link;
        }
    };

    return (
        <section className="relative h-131"> 
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with linear Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-linear-to-r ${slides[currentSlide].color} mix-blend-multiply opacity-90`}></div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
                        <div className="container mx-auto px-15 sm:px-10">
                            <div className="max-w-3xl">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
                                >
                                    <span className="text-2xl mr-3">{slides[currentSlide].icon}</span>
                                    <span className="text-white font-semibold">{slides[currentSlide].subtitle}</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                                >
                                    {slides[currentSlide].title}
                                </motion.h1>

                                <motion.p
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed"
                                >
                                    {slides[currentSlide].description}
                                </motion.p>

                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="flex gap-4"
                                >
                                    <button 
                                        onClick={handleButtonClick}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent default behavior
                                        className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                                        data-testid="banner-button"
                                    >
                                        {slides[currentSlide].buttonText}
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrev}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${index === currentSlide
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Floating Elements for Visual Interest */}
            <div className="absolute top-1/4 left-10 w-64 h-64 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>

            {/* Wave Divider at Bottom */}
            <div className="hidden sm:block absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="fill-white"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Banner;