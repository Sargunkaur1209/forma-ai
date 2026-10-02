import PropTypes from 'prop-types';

function ComingSoonPage({ heading }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Coming soon
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">
          {heading} — coming soon
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This page is intentionally placeholder-only for today&apos;s routing work.
        </p>
      </div>
    </main>
  );
}

ComingSoonPage.propTypes = {
  heading: PropTypes.string.isRequired,
};

export default ComingSoonPage;
