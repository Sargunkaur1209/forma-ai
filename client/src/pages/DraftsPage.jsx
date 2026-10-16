import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ClaimWorkspace from '../components/ClaimWorkspace';
import { ClaimApiError, fetchDrafts } from '../services/draftService';

const FORM_ID = 'auto_claim_v1';
const relativeTimeFormat = new Intl.RelativeTimeFormat('en', {
  numeric: 'always',
});
const timeUnits = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

function getRelativeTime(date) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return 'Update time unavailable';

  const seconds = (timestamp - Date.now()) / 1000;
  const [unit, unitSeconds] = timeUnits.find(([, size]) => Math.abs(seconds) >= size) ?? [
    'second',
    1,
  ];
  return relativeTimeFormat.format(Math.round(seconds / unitSeconds), unit);
}

function countAnsweredFields(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return 0;

  return Object.values(answers).filter((value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;
}

function getErrorMessage(error) {
  if (error instanceof ClaimApiError) {
    if (error.network) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    return 'Unable to load your drafts right now. Please try again.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
}

function DraftCard({ draft }) {
  const story = typeof draft.story === 'string' ? draft.story : '';
  const storyPreview =
    story.length > 120 ? `${story.slice(0, 120)}…` : story || 'No story added yet.';
  const answeredFields = countAnsweredFields(draft.answers);

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
          Draft
        </span>
        <time
          dateTime={draft.updatedAt}
          className="text-right text-[11px] text-slate-500"
          title={draft.updatedAt}
        >
          Updated {getRelativeTime(draft.updatedAt)}
        </time>
      </div>
      <p className="mt-4 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {storyPreview}
      </p>
      <p className="mt-3 text-[11px] text-slate-500">
        {answeredFields} answered {answeredFields === 1 ? 'field' : 'fields'}
      </p>
      <Link
        to={`/claim?draftId=${encodeURIComponent(draft.id)}`}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Resume
      </Link>
    </article>
  );
}

DraftCard.propTypes = {
  draft: PropTypes.shape({
    id: PropTypes.string.isRequired,
    story: PropTypes.string,
    answers: PropTypes.object,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setStatus('loading');
    setErrorMessage('');

    fetchDrafts(FORM_ID)
      .then((result) => {
        if (!isCurrent) return;
        const sortedDrafts = [...result.drafts].sort(
          (first, second) => new Date(second.updatedAt) - new Date(first.updatedAt),
        );
        setDrafts(sortedDrafts);
        setStatus('loaded');
      })
      .catch((error) => {
        if (!isCurrent) return;
        setErrorMessage(getErrorMessage(error));
        setStatus('error');
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  return (
    <ClaimWorkspace active="drafts" breadcrumb="My drafts">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-indigo-600">
              Claims
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My drafts
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Pick up where you left off on an unfinished claim.
            </p>
          </div>
        </div>

        {status === 'loading' && (
          <div
            role="status"
            aria-label="Loading drafts"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {status === 'loaded' && drafts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <h2 className="text-base font-semibold text-slate-900">No drafts yet</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Start a new claim and save it as a draft to find it here.
            </p>
            <Link
              to="/claim"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              New claim
            </Link>
          </div>
        )}

        {status === 'loaded' && drafts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </ClaimWorkspace>
  );
}

export default DraftsPage;
