import React from 'react';
import { Autoplay, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import ReviewCard from './ReviewCard';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Reviews = () => {
    const axiosSecure = useAxiosSecure();

    const {
        data: reviews = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['getReview'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/getReview`);
            return res.data;
        }
    });

    const breakpoints = {
        320: {
            slidesPerView: 1,
            spaceBetween: 10,
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1,
                scale: 0.9,
                slideShadows: true,
            }
        },
        640: {
            slidesPerView: 2,
            spaceBetween: 20,
            coverflowEffect: {
                rotate: 20,
                stretch: 30,
                depth: 150,
                modifier: 1,
                scale: 0.8,
                slideShadows: true,
            }
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 30,
            coverflowEffect: {
                rotate: 30,
                stretch: 50,
                depth: 200,
                modifier: 1,
                scale: 0.75,
                slideShadows: true,
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 my-8 sm:my-10">
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto mb-4"></div>
                    <div className="h-16 sm:h-12 max-w-2xl bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 my-8 sm:my-10 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 md:p-8">
                    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">Failed to load reviews. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 py-6 dark:bg-gray-800 pb-12">
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto">
                <h3 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white bg-clip-text">
                    What Our <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Users</span> Say
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg px-2 sm:px-4">
                    Empowering citizens to report and track infrastructure issues — bridging communities and municipal services for faster, transparent resolutions.
                </p>
            </div>

            {/* Reviews Count - Mobile Only */}
            <div className="block sm:hidden text-center mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {reviews.length} Reviews
                </span>
            </div>

            {/* Swiper Carousel */}
            {reviews.length > 0 ? (
                <Swiper
                    loop={true}
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
                    className="mySwiper pb-12 sm:pb-14 md:pb-16"
                    breakpoints={breakpoints}
                >
                    {reviews.map((review, index) => (
                        <SwiperSlide key={review.id || index}>
                            <div className="px-2 sm:px-3 md:px-4">
                                <ReviewCard review={review} />
                            </div>
                        </SwiperSlide>
                    ))}

                    {/* Custom Navigation Buttons - Hidden on mobile */}
                    <div className="hidden sm:block">
                        <div className="swiper-button-next text-blue-600! dark:text-blue-400! w-8! h-8! md:w-10! md:h-10! after:text-base! md:after:text-lg!"></div>
                        <div className="swiper-button-prev text-blue-600! dark:text-blue-400! w-8! h-8! md:w-10! md:h-10! after:text-base! md:after:text-lg!"></div>
                    </div>
                </Swiper>
            ) : (
                // Empty state
                <div className="text-center py-8 sm:py-10 md:py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No reviews yet. Be the first to share your experience!</p>
                </div>
            )}

            {/* Mobile Swipe Indicator */}
            {reviews.length > 0 && (
                <div className="block sm:hidden text-center mt-4">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Swipe to see more reviews</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;