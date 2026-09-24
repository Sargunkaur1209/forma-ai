import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { fetchFormSchema } from '../services/formService';
import { buildValidationRules } from '../utils/schemaValidation';
import { getFieldComponent } from './fields/fieldRegistry';

function DynamicFormRenderer({ formId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const { register, handleSubmit, formState } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    let isCurrent = true;

    setLoading(true);
    setError(null);
    setSchema(null);

    fetchFormSchema(formId)
      .then((nextSchema) => {
        if (isCurrent) {
          setSchema(nextSchema);
        }
      })
      .catch((nextError) => {
        if (isCurrent) {
          setError(nextError);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [formId]);

  if (loading) {
    return (
      <div
        role="status"
        className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
      >
        Loading form...
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Unable to load this form: {error.message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => {})} noValidate className="flex flex-col gap-6">
      {schema.sections.map((section) => (
        <section
          key={section.id}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-xl font-semibold text-slate-900">{section.title}</h2>

          <div className="space-y-4">
            {section.fields.map((field) => {
              const FieldComponent = getFieldComponent(field.type);

              if (!FieldComponent) {
                return (
                  <p
                    key={field.key}
                    className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                  >
                    Unsupported field type: {field.type}
                  </p>
                );
              }

              return (
                <FieldComponent
                  key={field.key}
                  field={field}
                  register={register}
                  rules={buildValidationRules(field)}
                  error={formState.errors[field.key]}
                />
              );
            })}
          </div>
        </section>
      ))}
      <button
        type="submit"
        className="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit claim
      </button>
    </form>
  );
}

DynamicFormRenderer.propTypes = {
  formId: PropTypes.string.isRequired,
};

export default DynamicFormRenderer;
