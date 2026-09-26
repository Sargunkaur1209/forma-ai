import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, useWatch } from 'react-hook-form';
import { fetchFormSchema } from '../services/formService';
import { evaluateShowIf } from '../utils/evaluateShowIf';
import { buildValidationRules } from '../utils/schemaValidation';
import { getFieldComponent } from './fields/fieldRegistry';

function ConditionalField({ field, watchedValues, unregister, register, errors }) {
  const isVisible = evaluateShowIf(field.showIf, watchedValues);

  useEffect(() => {
    if (!isVisible) {
      unregister(field.key);
    }
  }, [field.key, isVisible, unregister]);

  if (!isVisible) {
    return null;
  }

  const FieldComponent = getFieldComponent(field.type);

  if (!FieldComponent) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        Unsupported field type: {field.type}
      </p>
    );
  }

  return (
    <FieldComponent
      field={field}
      register={register}
      rules={buildValidationRules(field)}
      error={errors[field.key]}
    />
  );
}

ConditionalField.propTypes = {
  field: PropTypes.object.isRequired,
  watchedValues: PropTypes.object.isRequired,
  unregister: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

function DynamicFormRenderer({ formId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const { register, unregister, control, handleSubmit, formState } = useForm({ mode: 'onBlur' });
  const watchedValues = useWatch({ control });

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
              return (
                <ConditionalField
                  key={field.key}
                  field={field}
                  watchedValues={watchedValues}
                  unregister={unregister}
                  register={register}
                  errors={formState.errors}
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
