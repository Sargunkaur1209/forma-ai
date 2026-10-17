import { Link } from 'react-router-dom';
import ClaimWorkspace from '../components/ClaimWorkspace';

function SubmittedPage() {
  return (
    <ClaimWorkspace active="submitted" breadcrumb="Submitted claims">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-indigo-600">
          Claims
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Submitted claims
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your submitted claims will appear here soon.
        </p>
        <Link
          to="/drafts"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to my drafts
        </Link>
      </div>
    </ClaimWorkspace>
  );
}

export default SubmittedPage;
