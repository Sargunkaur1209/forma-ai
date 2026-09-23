import DynamicFormRenderer from './components/DynamicFormRenderer';

function App() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Forma AI</h1>
        <p className="mb-8 text-sm text-slate-500">Auto claim form</p>
        <DynamicFormRenderer formId="auto_claim_v1" />
      </div>
    </main>
  );
}

export default App;
