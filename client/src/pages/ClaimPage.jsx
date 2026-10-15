import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ClaimWorkspace from '../components/ClaimWorkspace';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import MagicInput from '../components/MagicInput';
import { extractFromStory } from '../services/extractService';
import {
  ClaimApiError,
  createDraft,
  fetchDraft,
  fetchRecentDrafts,
  submitClaim,
  updateDraft,
} from '../services/draftService';
import { useFormStore } from '../store/useFormStore';

const FORM_ID = 'auto_claim_v1';

const storyChecks = [
  { label: 'When it happened', pattern: /\b(yesterday|today|last night|on \w+day|\d{1,2}\/\d{1,2})\b/i },
  { label: 'Where it happened', pattern: /\b(at|near|on the|highway|street|road|intersection|parking lot)\b/i },
  { label: 'Your vehicle', pattern: /\b(car|truck|vehicle|honda|toyota|ford|driving|windshield)\b/i },
  { label: 'What was damaged', pattern: /\b(hit|damage|shattered|broken|dent|crash|collision|scratch)\b/i },
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
  const setValues = useFormStore((state) => state.setValues);
  const lastStory = useFormStore((state) => state.lastStory);

  const draftIdRef = useRef(null);
  const formVersionRef = useRef(null);
  const [draftOffer, setDraftOffer] = useState(null);
  const [draftLoadError, setDraftLoadError] = useState(null);
  const [draftStatus, setDraftStatus] = useState('idle');
  const [draftError, setDraftError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [story, setStory] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const params = new URLSearchParams(window.location.search);
    const requestedDraftId = params.get('draftId') ?? params.get('draft');

    async function loadDraftOffer() {
      try {
        const draft = requestedDraftId
          ? await fetchDraft(requestedDraftId)
          : (await fetchRecentDrafts(FORM_ID)).drafts?.[0];

        if (isCurrent && draft) {
          if (draft.formId !== FORM_ID) {
            setDraftLoadError('This saved draft belongs to a different form.');
            return;
          }
          setDraftOffer(draft);
        }
      } catch (error) {
        if (isCurrent) setDraftLoadError(getApiErrorMessage(error, 'load'));
      }
    }

    loadDraftOffer();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleSchemaLoaded = useCallback((version) => {
    if (!draftIdRef.current && Number.isInteger(version)) formVersionRef.current = version;
  }, []);

  async function handleStorySubmit(story) {
    startExtraction(story);

    try {
      const result = await extractFromStory(story, FORM_ID);
      extractionSucceeded({ answers: result.answers, missing: result.missing });
      formVersionRef.current = result.version;
    } catch (error) {
      extractionFailed(error.message);
    }
  }

  function handleResumeDraft() {
    if (!draftOffer) return;
    draftIdRef.current = draftOffer.id;
    formVersionRef.current = draftOffer.formVersion;
    const draftStory = draftOffer.story ?? '';
    setStory(draftStory);
    startExtraction(draftStory);
    setValues(draftOffer.answers ?? {});
    extractionSucceeded({ answers: draftOffer.answers ?? {}, missing: [] });
    setDraftOffer(null);
    setDraftLoadError(null);
  }

  async function handleSaveDraft(answers) {
    if (!formVersionRef.current) {
      setDraftStatus('error');
      setDraftError('The claim form is still loading. Please try saving again shortly.');
      return;
    }

    setDraftStatus('saving');
    setDraftError(null);
    try {
      const payload = { answers, ...(lastStory ? { story: lastStory } : {}) };
      const draft = draftIdRef.current
        ? await updateDraft(draftIdRef.current, payload)
        : await createDraft({
            formId: FORM_ID,
            formVersion: formVersionRef.current,
            ...payload,
          });
      if (!draft.id) throw new Error('The server did not return a draft id.');
      draftIdRef.current = draft.id;
      setDraftStatus('saved');
    } catch (error) {
      setDraftStatus('error');
      setDraftError(getApiErrorMessage(error, 'save'));
    }
  }

  async function handleFormSubmit(answers) {
    if (!formVersionRef.current) {
      setSubmitStatus('error');
      setSubmitError('The claim form is still loading. Please try submitting again shortly.');
      return;
    }

    setSubmitStatus('saving');
    setSubmitError(null);
    setServerErrors({});

    try {
      const result = await submitClaim({
        formId: FORM_ID,
        version: formVersionRef.current,
        answers,
      });
      if (!result.id) throw new Error('The server did not return a submission id.');
      setSubmissionId(result.id);
      setSubmitStatus('done');
    } catch (error) {
      setSubmitStatus('error');
      if (error instanceof ClaimApiError && error.status === 400 && error.details.length > 0) {
        setServerErrors(Object.fromEntries(error.details.map(({ key, reason }) => [key, reason])));
        setSubmitError('Some claim details need attention. Review the highlighted fields.');
      } else {
        setSubmitError(getApiErrorMessage(error, 'submit'));
      }
    }
  }

  if (submitStatus === 'done') {
    return (
      <ClaimWorkspace active="claim" breadcrumb="Auto claim / Confirm">
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
            <p className="mt-3 text-sm font-medium text-slate-700">
              Submission ID: <span data-testid="submission-id">{submissionId}</span>
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

            {draftOffer && (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-indigo-950">
                  You have a saved claim draft. Resume where you left off?
                </p>
                <button
                  type="button"
                  onClick={handleResumeDraft}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Resume draft
                </button>
              </div>
            )}

            {draftLoadError && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {draftLoadError}
              </p>
            )}

            {draftStatus !== 'idle' && (
              <p
                role={draftStatus === 'error' ? 'alert' : 'status'}
                className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
                  draftStatus === 'error'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                {draftStatus === 'saving'
                  ? 'Saving draft…'
                  : draftStatus === 'saved'
                    ? 'Draft saved.'
                    : draftError}
              </p>
            )}

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
                onSaveDraft={handleSaveDraft}
                isSavingDraft={draftStatus === 'saving'}
                serverErrors={serverErrors}
                onSchemaLoaded={handleSchemaLoaded}
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

function getApiErrorMessage(error, action) {
  if (error instanceof ClaimApiError) {
    if (error.network) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    if (error.status === 400) {
      return (
        error.message ||
        'The server could not accept these claim details. Please review them and try again.'
      );
    }
    if (error.status === 404 && action === 'load') {
      return 'This draft could not be found. It may have expired or been removed.';
    }
    const actionLabel = action === 'save' ? 'save' : action === 'load' ? 'load' : 'submit';
    return `Unable to ${actionLabel} your claim right now. Please try again.`;
  }
  return error.message || 'An unexpected error occurred. Please try again.';
}

export default ClaimPage;
