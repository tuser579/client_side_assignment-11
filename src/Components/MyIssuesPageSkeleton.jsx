const MyIssuesPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 sm:h-9 w-56 sm:w-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-4 w-40 sm:w-52 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>

        {/* ── Stat Cards ──────────────────────────────── */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-3 sm:p-4 animate-pulse"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="h-6 sm:h-7 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto mb-1.5" />
              <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            {/* Selects */}
            <div className="flex flex-wrap gap-2">
              <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── Result count ────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>

        {/* ── Issues Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Image placeholder */}
              <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                {/* Status badge */}
                <div className="absolute top-2.5 right-2.5 h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
                {/* Priority badge */}
                <div className="absolute top-2.5 left-2.5 h-5 w-14 bg-gray-300 dark:bg-gray-600 rounded-full" />
                {/* Category badge */}
                <div className="absolute bottom-2.5 left-2.5 h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded-lg" />
              </div>

              {/* Content */}
              <div className="p-3.5">
                {/* Title */}
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                {/* Description lines */}
                <div className="space-y-1.5 mb-3">
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>

                {/* Meta */}
                <div className="space-y-1.5 mb-3">
                  {/* Location */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  {/* Date + votes */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  {/* Edit + Delete placeholders */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                  {/* View button */}
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination skeleton ──────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse hidden sm:block" />
          <div className="flex items-center gap-1">
            {/* First / Prev */}
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            {/* Page numbers */}
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-xl animate-pulse ${i === 0
                  ? 'bg-gray-300 dark:bg-gray-600'
                  : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
            {/* Next / Last */}
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyIssuesPageSkeleton;