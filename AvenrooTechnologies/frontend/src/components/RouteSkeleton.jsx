export default function RouteSkeleton() {
  return (
    <div className="page-shell px-4 pt-4 sm:px-6">
      <div className="nav-shell mx-auto max-w-7xl rounded-[26px] px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="skeleton-block h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton-block h-3 w-28 rounded-full" />
              <div className="skeleton-block h-3 w-44 rounded-full" />
            </div>
          </div>

          <div className="hidden gap-3 md:flex">
            <div className="skeleton-block h-10 w-20 rounded-full" />
            <div className="skeleton-block h-10 w-20 rounded-full" />
            <div className="skeleton-block h-10 w-20 rounded-full" />
          </div>

          <div className="hidden gap-3 md:flex">
            <div className="skeleton-block h-10 w-12 rounded-full" />
            <div className="skeleton-block h-10 w-40 rounded-full" />
          </div>

          <div className="skeleton-block h-10 w-10 rounded-full md:hidden" />
        </div>
      </div>

      <main className="mx-auto mt-8 grid max-w-7xl gap-6 pb-20 lg:grid-cols-[1fr_0.92fr]">
        <div className="space-y-5">
          <div className="skeleton-block h-10 w-44 rounded-full" />
          <div className="space-y-3">
            <div className="skeleton-block h-14 w-full max-w-3xl rounded-[20px]" />
            <div className="skeleton-block h-14 w-full max-w-2xl rounded-[20px]" />
          </div>
          <div className="space-y-3">
            <div className="skeleton-block h-4 w-full max-w-2xl rounded-full" />
            <div className="skeleton-block h-4 w-full max-w-xl rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="skeleton-block h-12 w-40 rounded-full" />
            <div className="skeleton-block h-12 w-44 rounded-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-panel rounded-[28px] p-5">
                <div className="skeleton-block h-4 w-full rounded-full" />
                <div className="mt-3 skeleton-block h-4 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="skeleton-block min-h-[20rem] rounded-[34px]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton-block min-h-[14rem] rounded-[30px]" />
            <div className="grid gap-4">
              <div className="skeleton-block min-h-[10rem] rounded-[30px]" />
              <div className="skeleton-block min-h-[10rem] rounded-[30px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
