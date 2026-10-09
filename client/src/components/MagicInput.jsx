import { useState } from 'react';
import PropTypes from 'prop-types';

const exampleStories = [
  'Hit a deer on the highway',
  'Rear-ended at a red light',
  'Car broken into overnight',
];

function MagicInput({
  onSubmit,
  onStoryChange,
  isLoading = false,
  errorMessage = null,
  onDismissError,
}) {
  const [storyText, setStoryText] = useState('');
  const isSubmitDisabled = !storyText.trim() || isLoading;

  function updateStory(value) {
    setStoryText(value);
    onStoryChange?.(value);
  }

  function handleSubmit() {
    if (!isSubmitDisabled) {
      onSubmit(storyText);
    }
  }

  return (
    <section
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/50 sm:mb-7 sm:rounded-3xl sm:p-6"
      aria-labelledby="magic-input-title"
    >
      <div className="mb-4 flex flex-col gap-1">
        <h2 id="magic-input-title" className="text-lg font-semibold tracking-tight text-slate-950">
          Describe what happened
        </h2>
        <p className="text-sm leading-5 text-slate-500">
          Start with the basics. You can review and edit the details below.
        </p>
      </div>

      <div className="relative" aria-busy={isLoading}>
        <div className={isLoading ? 'invisible' : ''} aria-hidden={isLoading}>
          <label htmlFor="magic-input-story" className="sr-only">
            Incident description
          </label>
          <textarea
            id="magic-input-story"
            rows={5}
            value={storyText}
            onChange={(event) => updateStory(event.target.value)}
            disabled={isLoading}
            placeholder="For example: I was driving home when another car hit my passenger-side door..."
            className={[
              'min-h-36 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition',
              'placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10',
              'disabled:cursor-not-allowed disabled:bg-slate-50',
              'border-slate-200 bg-slate-50/70',
            ].join(' ')}
          />

          <div className="mt-3 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs font-medium text-slate-500" aria-live="polite">
              {storyText.length} {storyText.length === 1 ? 'character' : 'characters'}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/15 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none sm:w-auto"
            >
              Continue
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                <path
                  d="M4 10h12m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col gap-3" role="status" aria-label="Loading">
            <div className="flex flex-1 animate-pulse flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-5/6 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium text-slate-500">Try an example:</span>
        {exampleStories.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => updateStory(example)}
            disabled={isLoading}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div
          className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
          role="alert"
        >
          <p className="min-w-0 flex-1">{errorMessage}</p>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="font-semibold text-red-900 underline decoration-red-300 underline-offset-2 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onDismissError}
              aria-label="Dismiss extraction error"
              className="flex size-7 items-center justify-center rounded text-lg leading-none text-red-700 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        <span className="font-semibold text-slate-600">Tip:</span> Include where you were, what
        happened, and any damage you noticed.
      </p>
    </section>
  );
}

MagicInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onStoryChange: PropTypes.func,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onDismissError: PropTypes.func.isRequired,
};

export default MagicInput;
