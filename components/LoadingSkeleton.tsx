export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F17] via-[#1A1A2E] to-[#16213E] p-4 lg:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/10 rounded-full"></div>
          <div className="h-10 w-10 bg-white/10 rounded-full"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl p-6 bg-white/5 border border-white/10"
          >
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="h-10 w-40 bg-white/10 rounded mb-2"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white/5 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 2 */}
          <div className="rounded-3xl p-6 bg-white/5 border border-white/10">
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white/5 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
