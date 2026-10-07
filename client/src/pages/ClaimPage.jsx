import { useRef, useState } from 'react';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import MagicInput from '../components/MagicInput';
import { extractFromStory } from '../services/extractService';
import { createDraft, updateDraft } from '../services/draftService';
import { useFormStore } from '../store/useFormStore';

const FORM_ID = 'auto_claim_v1';

function ClaimPage() {
  const extractionStatus = useFormStore((state) => state.extractionStatus);
  const extractionError = useFormStore((state) => state.extractionError);
  const startExtraction = useFormStore((state) => state.startExtraction);
  const extractionSucceeded = useFormStore((state) => state.extractionSucceeded);
  const extractionFailed = useFormStore((state) => state.extractionFailed);
  const resetExtraction = useFormStore((state) => state.resetExtraction);

  // Draft id is kept in a ref so it persists across re-renders without
  // triggering one itself.
  const draftIdRef = useRef(null);
  const formVersionRef = useRef(null);

  // Submit state (separate from extraction state)
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'saving' | 'done' | 'error'
  const [submitError, setSubmitError] = useState(null);

  async function handleStorySubmit(story) {
    startExtraction(story);

    try {
      const result = await extractFromStory(story, FORM_ID);
      // result: { formId, version, answers, confidence, missing, rejected }

      extractionSucceeded({ answers: result.answers, missing: result.missing });

      // Remember the form version so the submit can reference the exact version.
      formVersionRef.current = result.version;

      // Auto-save a draft so the user can resume if they close the tab.
      try {
        const draft = await createDraft({
          formId: FORM_ID,
          formVersion: result.version,
          story,
          answers: result.answers,
        });
        draftIdRef.current = draft.id;
      } catch {
        // Draft saving is best-effort — never block the user.
      }
    } catch (error) {
      extractionFailed(error.message);
    }
  }

  async function handleFormSubmit(answers) {
    if (!formVersionRef.current) return;
    setSubmitStatus('saving');
    setSubmitError(null);

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

    try {
      // Update the draft with the final answers before submitting.
      if (draftIdRef.current) {
        try {
          await updateDraft(draftIdRef.current, { answers });
        } catch {
          // Best-effort draft sync.
        }
      }

      const response = await fetch(`${API_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: FORM_ID,
          version: formVersionRef.current,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details
            ? data.details.map((d) => `${d.key}: ${d.reason}`).join(', ')
            : (data.error ?? `Submission failed (${response.status})`),
        );
      }

      setSubmitStatus('done');
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err.message);
    }
  }

  if (submitStatus === 'done') {
    return (
      <main className="claim-page min-h-screen px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-12">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
                <path
                  d="m5 12.5 4.5 4.5L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">
              Claim submitted
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Your claim has been received. We&apos;ll be in touch soon.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="claim-page min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
              <path
                d="M12 3.5 19 7v5.5c0 4.1-2.8 7.1-7 8-4.2-.9-7-3.9-7-8V7l7-3.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="m9 12 2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">Forma AI</p>
            <p className="text-xs font-medium text-slate-500">Auto insurance claim</p>
          </div>
        </header>

        <div className="mb-7 sm:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Start your claim
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Let&apos;s get you back on the road.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Tell us what happened. We&apos;ll use your story to fill in the details and guide you
            through the rest.
          </p>
        </div>

        <MagicInput
          onSubmit={handleStorySubmit}
          isLoading={extractionStatus === 'loading'}
          errorMessage={extractionStatus === 'error' ? extractionError : null}
          onDismissError={resetExtraction}
        />

        {submitStatus === 'error' && submitError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            {submitError}
          </p>
        )}

        <DynamicFormRenderer
          formId={FORM_ID}
          onSubmit={handleFormSubmit}
          isSubmitting={submitStatus === 'saving'}
        />
      </div>
    </main>
  );
}

export default ClaimPage;
