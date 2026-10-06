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
            : (data.error ?? `Submission failed (${response.status})`)
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
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-green-800">Claim submitted!</h1>
            <p className="text-sm text-green-700">
              Your claim has been received. We&apos;ll be in touch soon.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Forma AI</h1>
        <p className="mb-8 text-sm text-slate-500">Auto claim form</p>

        <MagicInput
          onSubmit={handleStorySubmit}
          isLoading={extractionStatus === 'loading'}
          errorMessage={extractionStatus === 'error' ? extractionError : null}
          onDismissError={resetExtraction}
        />

        {submitStatus === 'error' && submitError && (
          <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
