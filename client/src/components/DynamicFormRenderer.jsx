import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { fetchFormSchema } from '../services/formService';
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
      <div role="status" className="rounded-md bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading form...
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Unable to load this form: {error.message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => {})} noValidate className="flex flex-col gap-8">
      {schema.sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-slate-800">{section.title}</h2>

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
                error={formState.errors[field.key]}
              />
            );
          })}
        </section>
      ))}
    </form>
  );
}

DynamicFormRenderer.propTypes = {
  formId: PropTypes.string.isRequired,
};

export default DynamicFormRenderer;
