import DynamicFormRenderer from '../components/DynamicFormRenderer';
import MagicInput from '../components/MagicInput';
import { extractFromStory } from '../services/extractService';
import { useFormStore } from '../store/useFormStore';

function ClaimPage() {
  const extractionStatus = useFormStore((state) => state.extractionStatus);
  const extractionError = useFormStore((state) => state.extractionError);
  const startExtraction = useFormStore((state) => state.startExtraction);
  const extractionSucceeded = useFormStore((state) => state.extractionSucceeded);
  const extractionFailed = useFormStore((state) => state.extractionFailed);
  const resetExtraction = useFormStore((state) => state.resetExtraction);

  async function handleStorySubmit(story) {
    startExtraction(story);

    try {
      const result = await extractFromStory(story, 'auto_claim_v1');
      extractionSucceeded(result);
    } catch (error) {
      extractionFailed(error.message);
    }
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

        <DynamicFormRenderer formId="auto_claim_v1" />
      </div>
    </main>
  );
}

export default ClaimPage;
