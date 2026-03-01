const CitizenDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 sm:h-9 md:h-10 w-64 sm:w-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-4 w-48 sm:w-60 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Icon box */}
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
            {/* Value */}
            <div className="h-7 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1.5" />
            {/* Label */}
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded mb-2.5" />
            {/* Accent bar */}
            <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        ))}
      </div>

      {/* ── Chart + Payment ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">

        {/* Payment Card skeleton */}
        <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-xl p-6 shadow-xl animate-pulse">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gray-300 dark:bg-gray-600" />
            <div className="h-3.5 w-28 bg-gray-300 dark:bg-gray-600 rounded-lg" />
          </div>
          {/* Big amount */}
          <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded-xl mb-2" />
          {/* Sub text */}
          <div className="h-3 w-36 bg-gray-300 dark:bg-gray-600 rounded mb-6" />
          {/* Line items */}
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-300/50 dark:bg-gray-600/50 rounded-xl">
                <div className="h-3.5 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-3.5 w-14 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 animate-pulse">
          {/* Chart header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1.5">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            {/* Live badge */}
            <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Bar chart area */}
          <div className="h-56 sm:h-64 flex items-end justify-around gap-4 px-4 pb-4">
            {[75, 45, 60, 35].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-xl"
                  style={{ height: `${height}%`, animationDelay: `${i * 80}ms` }}
                />
                <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CitizenDashboardSkeleton;