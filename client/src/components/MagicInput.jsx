import { useState } from 'react';
import PropTypes from 'prop-types';

function MagicInput({ onSubmit, isLoading = false }) {
  const [storyText, setStoryText] = useState('');
  const isSubmitDisabled = !storyText.trim() || isLoading;

  function handleSubmit() {
    if (!isSubmitDisabled) {
      onSubmit(storyText);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="magic-input-title">
      <h2 id="magic-input-title" className="text-lg font-semibold text-slate-900">
        Describe what happened
      </h2>

      <div className="relative" aria-busy={isLoading}>
        <div className={isLoading ? 'invisible' : ''} aria-hidden={isLoading}>
          <label htmlFor="magic-input-story" className="sr-only">
            Incident description
          </label>
          <textarea
            id="magic-input-story"
            rows={5}
            value={storyText}
            onChange={(event) => setStoryText(event.target.value)}
            disabled={isLoading}
            placeholder="Describe what happened, in your own words..."
            className={[
              'w-full resize-y rounded-md border px-3 py-2 text-sm text-slate-900 outline-none',
              'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500',
              'disabled:cursor-not-allowed disabled:bg-slate-50',
              'border-slate-300 bg-white',
            ].join(' ')}
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500" aria-live="polite">
              {storyText.length} {storyText.length === 1 ? 'character' : 'characters'}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col gap-3" role="status" aria-label="Loading">
            <div className="flex flex-1 animate-pulse flex-col justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
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

      <p className="text-xs text-slate-500">
        Example: “I was driving north on I-95 when a deer ran into the road and I hit the
        guardrail.”
      </p>
    </section>
  );
}

MagicInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default MagicInput;
