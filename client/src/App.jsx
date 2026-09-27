import { useState } from 'react';
import DynamicFormRenderer from './components/DynamicFormRenderer';
import MagicInput from './components/MagicInput';

function App() {
  const [isMagicInputLoading, setIsMagicInputLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Forma AI</h1>
        <p className="mb-8 text-sm text-slate-500">Auto claim form</p>

        <label className="mb-3 flex w-fit items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isMagicInputLoading}
            onChange={(event) => setIsMagicInputLoading(event.target.checked)}
          />
          Show loading skeleton (temporary test toggle)
        </label>
        <MagicInput
          onSubmit={(text) => console.log('submitted:', text)}
          isLoading={isMagicInputLoading}
        />

        <DynamicFormRenderer formId="auto_claim_v1" />
      </div>
    </main>
  );
}

export default App;
