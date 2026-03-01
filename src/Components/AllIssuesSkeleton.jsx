import React from 'react';

// Skeleton component - add this above AllIssue or in a separate file
const AllIssuesSkeleton = () => {
    const skeletonCards = Array(12).fill(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto">

                {/* Header Skeleton */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="h-8 sm:h-10 w-64 sm:w-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-2" />
                            <div className="h-4 w-48 sm:w-72 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                        <div className="shrink-0 flex justify-center sm:justify-start">
                            <div className="h-10 sm:h-12 w-36 sm:w-44 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        </div>
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-6">
                        {Array(8).fill(null).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-gray-200 dark:border-gray-700 text-center">
                                <div className="h-6 sm:h-7 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-1.5" />
                                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter Skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {Array(2).fill(null).map((_, i) => (
                            <div key={i}>
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1.5" />
                                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {Array(3).fill(null).map((_, i) => (
                            <div key={i}>
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1.5" />
                                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Results count Skeleton */}
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {skeletonCards.map((_, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Image Skeleton */}
                            <div className="h-40 sm:h-44 bg-gray-200 dark:bg-gray-700 animate-pulse relative shrink-0">
                                {/* Status badge */}
                                <div className="absolute top-3 right-3 h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                                {/* Priority badge */}
                                <div className="absolute top-3 left-3 h-6 w-14 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                                {/* Category badge */}
                                <div className="absolute bottom-3 left-3 h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
                            </div>

                            {/* Body Skeleton */}
                            <div className="p-4 flex flex-col flex-1">
                                {/* Title + date row */}
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-1" />
                                    <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0" />
                                </div>

                                {/* Description lines */}
                                <div className="space-y-1.5 mb-3 flex-1">
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0" />
                                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>

                                {/* Reporter */}
                                <div className="flex items-center gap-1.5 mb-4">
                                    <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0" />
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse order-2 sm:order-1" />
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                        {Array(7).fill(null).map((_, i) => (
                            <div
                                key={i}
                                className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${i === 0 || i === 6 ? 'w-8 h-8' : i === 3 ? 'w-9 h-9 bg-gray-300 dark:bg-gray-600' : 'w-9 h-9'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllIssuesSkeleton;