import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, useWatch } from 'react-hook-form';
import { fetchFormSchema } from '../services/formService';
import { evaluateShowIf } from '../utils/evaluateShowIf';
import { buildValidationRules } from '../utils/schemaValidation';
import { EXTRACTION_STATUS, getNestedValue, useFormStore } from '../store/useFormStore';
import { getFieldComponent } from './fields/fieldRegistry';

function ConditionalField({ field, watchedValues, unregister, register, clearErrors, errors }) {
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

  function registerField(key, rules) {
    const registration = register(key, rules);
    if (errors[key]?.type !== 'server') return registration;
    return {
      ...registration,
      onChange: (event) => {
        clearErrors(key);
        return registration.onChange(event);
      },
    };
  }

  return (
    <FieldComponent
      field={field}
      register={registerField}
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
  clearErrors: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

function getVisibleAnswers(values, schema) {
  const fields = schema.sections.flatMap((section) => section.fields);
  const conditionValues = Object.fromEntries(
    fields
      .map((field) => [field.key, getNestedValue(values, field.key)])
      .filter(([, value]) => value !== undefined),
  );
  const visibleFields = fields.filter((field) => evaluateShowIf(field.showIf, conditionValues));

  return Object.fromEntries(
    visibleFields
      .map((field) => [field.key, getNestedValue(values, field.key)])
      .filter(([, value]) => value !== undefined),
  );
}

function DynamicFormRenderer({
  formId,
  onSubmit,
  isSubmitting,
  onSaveDraft,
  isSavingDraft,
  serverErrors,
  onSchemaLoaded,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schema, setSchema] = useState(null);
  const extractedValues = useFormStore((state) => state.values);
  const extractionStatus = useFormStore((state) => state.extractionStatus);
  const {
    register,
    unregister,
    control,
    handleSubmit,
    formState,
    reset,
    setError: setFieldError,
    clearErrors,
    getValues,
  } = useForm({ mode: 'onBlur' });
  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (extractionStatus === EXTRACTION_STATUS.SUCCESS) {
      reset(extractedValues);
    }
  }, [extractionStatus, extractedValues, reset]);

  useEffect(() => {
    if (!schema) return;
    const fieldKeys = new Set(
      schema.sections.flatMap((section) => section.fields.map((field) => field.key)),
    );
    Object.entries(serverErrors ?? {}).forEach(([key, message]) => {
      if (fieldKeys.has(key)) setFieldError(key, { type: 'server', message });
    });
  }, [schema, serverErrors, setFieldError]);

  useEffect(() => {
    let isCurrent = true;

    setLoading(true);
    setError(null);
    setSchema(null);

    fetchFormSchema(formId)
      .then((nextSchema) => {
        if (isCurrent) {
          onSchemaLoaded?.(nextSchema.version);
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
  }, [formId, onSchemaLoaded]);

  if (loading) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-lg shadow-slate-200/50"
      >
        <span className="inline-flex items-center gap-3">
          <span
            className="size-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
            aria-hidden="true"
          />
          Loading form...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
      >
        Unable to load this form: {error.message}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit?.(getVisibleAnswers(values, schema)))}
      noValidate
      className="flex flex-col gap-5 sm:gap-6"
    >
      {schema.sections.map((section, index) => (
        <section
          key={section.id}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/50 sm:rounded-3xl sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Claim details
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {section.title}
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {section.fields.map((field) => {
              return (
                <ConditionalField
                  key={field.key}
                  field={field}
                  watchedValues={watchedValues}
                  unregister={unregister}
                  register={register}
                  clearErrors={clearErrors}
                  errors={formState.errors}
                />
              );
            })}
          </div>
        </section>
      ))}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40 sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-5">
        <p className="text-xs leading-5 text-slate-500">
          Review your answers before submitting your claim.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {onSaveDraft && (
            <button
              type="button"
              disabled={isSavingDraft || isSubmitting}
              onClick={() => onSaveDraft(getVisibleAnswers(getValues(), schema))}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSavingDraft ? 'Saving draft…' : 'Save draft'}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isSavingDraft}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/15 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 disabled:shadow-none sm:w-auto"
          >
            {isSubmitting && (
              <span
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {isSubmitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </div>
      </div>
    </form>
  );
}

DynamicFormRenderer.propTypes = {
  formId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  onSaveDraft: PropTypes.func,
  isSavingDraft: PropTypes.bool,
  serverErrors: PropTypes.object,
  onSchemaLoaded: PropTypes.func,
};

export default DynamicFormRenderer;
