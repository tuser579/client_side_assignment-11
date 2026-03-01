const MyPaymentHistorySkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 sm:h-9 w-48 sm:w-60 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-md animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
            <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1.5" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-5 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">

        {/* Table header */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 animate-pulse">
          {[100, 60, 120, 160, 60].map((w, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-600 rounded" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Type badge */}
              <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
              {/* Amount */}
              <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
              {/* Date */}
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block shrink-0" />
              {/* Transaction ID */}
              <div className="h-7 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg hidden sm:block flex-1" />
              {/* Actions */}
              <div className="flex items-center gap-1.5 ml-auto shrink-0">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`w-9 h-9 rounded-xl ${i === 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>

    </div>
  </div>
);

export default MyPaymentHistorySkeleton;