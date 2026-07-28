import Link from "next/link";

export default function NotFound() {
  return (
    <div id="not-found" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
      <div className="text-center max-w-md px-4">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
