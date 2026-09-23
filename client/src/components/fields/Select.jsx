import PropTypes from 'prop-types';

/**
 * Select — a reusable <select> wired to React Hook Form.
 *
 * Props:
 *   field   {object}  Schema field descriptor:
 *                       key        {string}   — RHF field name
 *                       label      {string}   — visible label text
 *                       required   {boolean}  — whether a selection is required
 *                       options    {Array}    — [{ value, label }]
 *                       validation {object}   — optional { message }
 *   register  {fn}    — react-hook-form's register function
 *   error     {object} — react-hook-form error object for this field (may be undefined)
 */
function Select({ field, register, error }) {
  const { key, label, required = false, options = [], validation = {} } = field;
  const { message } = validation;

  const rules = {};
  if (required) {
    // The empty-string guard catches the blank placeholder option.
    rules.required = message ?? `Please select a ${label.toLowerCase()}`;
    rules.validate = (v) => v !== '' || (message ?? `Please select a ${label.toLowerCase()}`);
  }

  const selectId = `field-${key}`;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <select
        id={selectId}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        defaultValue=""
        className={[
          'h-10 rounded-md border px-3 py-2 text-sm text-slate-900 outline-none',
          'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          hasError ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white',
        ].join(' ')}
        {...register(key, rules)}
      >
        <option value="" disabled>
          Select an option…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
}

Select.propTypes = {
  field: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ),
    validation: PropTypes.shape({
      message: PropTypes.string,
    }),
  }).isRequired,
  register: PropTypes.func.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

Select.defaultProps = {
  error: undefined,
};

export default Select;
