// Instant skeleton shown by Next.js during any navigation inside the dashboard.
// Because this file lives next to the (dashboard) layout it applies to ALL
// dashboard routes without any extra work in individual pages.
export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 space-y-5 animate-pulse">
      {/* Page title placeholder */}
      <div className="h-8 w-52 bg-slate-200 dark:bg-slate-800 rounded-xl" />

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>

      {/* Main content block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>

      {/* Table / list skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
