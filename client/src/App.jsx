import DynamicFormRenderer from './components/DynamicFormRenderer';

function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-indigo-600 tracking-tight mb-2">Forma AI</h1>
        <p className="text-sm text-slate-500 mb-10">Auto claim form</p>
        <DynamicFormRenderer formId="auto_claim_v1" />
      </div>
    </main>
  );
}

export default App;
