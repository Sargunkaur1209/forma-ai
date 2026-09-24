import PropTypes from 'prop-types';

/**
 * TextInput — a reusable controlled text input wired to React Hook Form.
 *
 * Props:
 *   field   {object}  Schema field descriptor:
 *                       key        {string}  — RHF field name
 *                       label      {string}  — visible label text
 *                       required   {boolean} — whether the field is required
 *                       validation {object}  — optional { pattern, min, max, message }
 *   register  {fn}    — react-hook-form's register function
 *   error     {object} — react-hook-form error object for this field (may be undefined)
 */
function TextInput({ field, register, rules, error }) {
  const { key, label, required = false } = field;

  const inputId = `field-${key}`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        type="text"
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={[
          'h-10 rounded-md border px-3 py-2 text-sm text-slate-900 outline-none',
          'placeholder:text-slate-400',
          'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          hasError ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white',
        ].join(' ')}
        {...register(key, rules)}
      />

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
}

TextInput.propTypes = {
  field: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    validation: PropTypes.shape({
      pattern: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      message: PropTypes.string,
    }),
  }).isRequired,
  register: PropTypes.func.isRequired,
  rules: PropTypes.object,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

TextInput.defaultProps = {
  rules: {},
  error: undefined,
};

export default TextInput;
