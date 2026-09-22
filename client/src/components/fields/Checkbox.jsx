import PropTypes from 'prop-types';

/**
 * Checkbox — a reusable boolean checkbox wired to React Hook Form.
 *
 * Props:
 *   field   {object}  Schema field descriptor:
 *                       key        {string}  — RHF field name
 *                       label      {string}  — visible label text
 *                       required   {boolean} — if true the box must be checked to submit
 *                       validation {object}  — optional { message }
 *   register  {fn}    — react-hook-form's register function
 *   error     {object} — react-hook-form error object for this field (may be undefined)
 *
 * Value contract (from schema-contract.md): boolean
 * RHF registers checkboxes as booleans automatically when type="checkbox".
 */
function Checkbox({ field, register, error }) {
  const { key, label, required = false, validation = {} } = field;
  const { message } = validation;

  const rules = {};
  if (required) {
    // For a required checkbox, the value must be true (checked).
    rules.validate = (v) => v === true || (message ?? `You must check "${label}" to continue`);
  }

  const checkboxId = `field-${key}`;
  const errorId = `${checkboxId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <input
          id={checkboxId}
          type="checkbox"
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600 focus:ring-2 focus:ring-indigo-500"
          {...register(key, rules)}
        />
        <label htmlFor={checkboxId} className="text-sm text-slate-700 leading-snug cursor-pointer">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-red-600 ml-6">
          {error.message}
        </p>
      )}
    </div>
  );
}

Checkbox.propTypes = {
  field: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    validation: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

Checkbox.defaultProps = {
  error: undefined,
};

export default Checkbox;
