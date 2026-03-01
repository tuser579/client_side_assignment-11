const IssueDetailsPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
    <div className="max-w-6xl mx-auto">

      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Issue card skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5 sm:p-6">
              {/* Category + actions row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              </div>

              {/* Title */}
              <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
              {/* Location */}
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />

              {/* Image grid */}
              <div className="mb-6">
                <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl" style={{animationDelay:`${i*60}ms`}} />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-11/12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>

          {/* Timeline card skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-6">
                  {[1,2,3].map((_, i) => (
                    <div key={i} className="flex gap-4" style={{animationDelay:`${i*70}ms`}}>
                      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-600 rounded" />
                          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Details card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
              <div className="space-y-4">
                {[80,60,100,56].map((w,i) => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                    <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded`} style={{width:`${w}%`}} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="space-y-2.5">
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);

export default IssueDetailsPageSkeleton;