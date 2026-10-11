import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          404 | Page not found
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The address may be incorrect, or the page may have moved.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
