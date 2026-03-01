const ReportIssuePageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 sm:h-9 w-52 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
          <div className="h-1 bg-gray-200 dark:bg-gray-700" />
          <div className="p-5 sm:p-7 space-y-6">

            {/* Title field */}
            <div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Category field */}
            <div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Priority toggle */}
            <div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Location */}
            <div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Image upload zone */}
            <div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-36 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>

            {/* Submit button */}
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-5">

          {/* Guidelines card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${60 + i * 8}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* What Happens Next card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                      {i < 3 && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mt-1" />}
                    </div>
                    <div className="space-y-1 flex-1 pb-1">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-2.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium upsell skeleton */}
          <div className="h-36 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>

      </div>
    </div>
  </div>
);

export default ReportIssuePageSkeleton;