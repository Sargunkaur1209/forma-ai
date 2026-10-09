import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ClaimWorkspace from '../components/ClaimWorkspace';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import MagicInput from '../components/MagicInput';
import { extractFromStory } from '../services/extractService';
import { createDraft, updateDraft } from '../services/draftService';
import { useFormStore } from '../store/useFormStore';

const FORM_ID = 'auto_claim_v1';

const storyChecks = [
  {
    label: 'When it happened',
    pattern: /\b(yesterday|today|last night|on \w+day|\d{1,2}\/\d{1,2})\b/i,
  },
  {
    label: 'Where it happened',
    pattern: /\b(at|near|on the|highway|street|road|intersection|parking lot)\b/i,
  },
  {
    label: 'Your vehicle',
    pattern: /\b(car|truck|vehicle|honda|toyota|ford|driving|windshield)\b/i,
  },
  {
    label: 'What was damaged',
    pattern: /\b(hit|damage|shattered|broken|dent|crash|collision|scratch)\b/i,
  },
];

const claimSteps = ['Describe', 'Review answers', 'Follow-ups', 'Confirm'];

function ClaimProgress({ activeStep }) {
  return (
    <ol
      aria-label="Claim progress"
      className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-5"
    >
      {claimSteps.map((step, index) => {
        const isComplete = index < activeStep;
        const isActive = index === activeStep;

        return (
          <li
            key={step}
            aria-current={isActive ? 'step' : undefined}
            className="flex min-w-0 items-center gap-1.5 text-[9px] sm:gap-2 sm:text-[11px]"
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border text-[9px] font-semibold ${
                isComplete || isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              {isComplete ? '✓' : index + 1}
            </span>
            <span className={isActive ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              {step}
            </span>
            {index < claimSteps.length - 1 && (
              <span className="ml-0.5 hidden h-px w-5 bg-slate-200 sm:block md:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

ClaimProgress.propTypes = {
  activeStep: PropTypes.number.isRequired,
};

function StoryChecklist({ story }) {
  return (
    <aside aria-label="Story details" className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
        Your story mentions
      </h2>
      <ul className="mt-3 space-y-2.5">
        {storyChecks.map(({ label, pattern }) => {
          const isMentioned = pattern.test(story);
          return (
            <li key={label} className="flex items-center gap-2 text-[11px]">
              <span
                className={`grid size-4 place-items-center rounded-full ${
                  isMentioned
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 text-slate-300'
                }`}
                aria-hidden="true"
              >
                {isMentioned ? '✓' : ''}
              </span>
              <span className={isMentioned ? 'text-slate-800' : 'text-slate-500'}>{label}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-4 text-slate-500">
        Don&apos;t worry if you miss something. We&apos;ll ask follow-up questions.
      </p>
    </aside>
  );
}

StoryChecklist.propTypes = {
  story: PropTypes.string.isRequired,
};

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
  const [story, setStory] = useState('');

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
      <ClaimWorkspace active="claim" breadcrumb="Auto claim / Confirm">
        <div className="mx-auto max-w-3xl py-10">
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
      </ClaimWorkspace>
    );
  }

  return (
    <ClaimWorkspace
      active="claim"
      breadcrumb={`Auto claim / ${extractionStatus === 'success' ? 'Review answers' : 'Describe'}`}
    >
      <div className="mx-auto max-w-5xl">
        <ClaimProgress activeStep={extractionStatus === 'success' ? 1 : 0} />
        <div className="mb-7 sm:mb-8">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Auto claim
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            What happened?
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-600">
            Write it like you would tell a friend. We&apos;ll fill in the form from your words.
          </p>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <MagicInput
              onSubmit={handleStorySubmit}
              onStoryChange={setStory}
              isLoading={extractionStatus === 'loading'}
              errorMessage={extractionStatus === 'error' ? extractionError : null}
              onDismissError={resetExtraction}
            />
            {submitStatus === 'error' && submitError && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {submitError}
              </p>
            )}
            {extractionStatus === 'success' && (
              <DynamicFormRenderer
                formId={FORM_ID}
                onSubmit={handleFormSubmit}
                isSubmitting={submitStatus === 'saving'}
              />
            )}
          </div>
          <div className="lg:sticky lg:top-5">
            <StoryChecklist story={story} />
          </div>
        </div>
      </div>
    </ClaimWorkspace>
  );
}

export default ClaimPage;
