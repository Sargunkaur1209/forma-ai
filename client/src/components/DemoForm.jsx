import { useForm } from 'react-hook-form';
import TextInput from './fields/TextInput';
import Select from './fields/Select';
import Checkbox from './fields/Checkbox';
import mockSchema from '../mockSchema';

/**
 * DemoForm — Day 3 integration demo.
 *
 * Renders one TextInput, one Select, and one Checkbox from the mock schema,
 * wired to React Hook Form. Displays submitted values below the form so you
 * can verify the full round-trip without a backend.
 *
 * This component is temporary scaffolding. It will be replaced by the
 * DynamicFormRenderer on Day 4.
 */
function DemoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    getValues,
  } = useForm({ mode: 'onBlur' });

  // Pull the three demo fields directly from the mock schema section.
  const fields = mockSchema.sections[0].fields;
  const textField = fields.find((f) => f.type === 'text');
  const selectField = fields.find((f) => f.type === 'select');
  const checkboxField = fields.find((f) => f.type === 'checkbox');

  function onSubmit(data) {
    // data is available here for API calls on later days.
    // For now the submitted state is shown in the UI below.
    console.log('Form submitted:', data);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">{mockSchema.sections[0].title}</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {textField && (
          <TextInput field={textField} register={register} error={errors[textField.key]} />
        )}

        {selectField && (
          <Select field={selectField} register={register} error={errors[selectField.key]} />
        )}

        {checkboxField && (
          <Checkbox field={checkboxField} register={register} error={errors[checkboxField.key]} />
        )}

        <button
          type="submit"
          className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Submit claim
        </button>
      </form>

      {/* Submitted values panel — development aid, not production UI */}
      {isSubmitSuccessful && (
        <div className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Submitted values
          </p>
          <pre className="text-xs text-emerald-900 overflow-auto">
            {JSON.stringify(getValues(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DemoForm;
