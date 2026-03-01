const ProfilePageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 sm:h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-4 w-60 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ── Left Column ──────────────────────────── */}
        <div className="md:col-span-1 space-y-5">

          {/* Profile Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-5 flex flex-col items-center">

              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 animate-pulse" />
              </div>

              {/* Name + email + date */}
              <div className="text-center mb-4 space-y-2 w-full">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse" />
                <div className="h-3.5 w-44 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
                <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              </div>

              {/* Contact rows */}
              <div className="w-full space-y-2">
                {[1, 2].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-600 rounded shrink-0" />
                    <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nav Tabs Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-3 space-y-1">
              {[
                { w: '75%', delay: 0   },
                { w: '65%', delay: 60  },
                { w: '70%', delay: 120 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse"
                  style={{ animationDelay: `${item.delay}ms` }}
                >
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
                  <div
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    style={{ width: item.w }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────── */}
        <div className="md:col-span-3 space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md animate-pulse"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                <div className="h-7 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1.5" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>

          {/* Tab Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-pulse">
            <div className="h-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-5 sm:p-7">

              {/* Tab header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>

              {/* Form fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Field: Full Name */}
                <div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Field: Email */}
                <div>
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Field: Phone */}
                <div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Field: Member Since */}
                <div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Address — full width textarea */}
                <div className="sm:col-span-2">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Account Status badges — full width */}
                <div className="sm:col-span-2">
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePageSkeleton;