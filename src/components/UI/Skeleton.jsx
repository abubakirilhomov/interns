const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-base-300 rounded-lg ${className}`} />
);

const SkeletonCard = () => (
  <div className="card bg-base-100 shadow p-4 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>

    {/* Grade + Timer */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4">
        <SkeletonCard />
      </div>
      <div className="md:col-span-8">
        <div className="card bg-base-100 shadow p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Plan progress */}
    <div className="card bg-base-100 shadow p-5 space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

export { Skeleton, SkeletonCard, DashboardSkeleton };
export default Skeleton;
