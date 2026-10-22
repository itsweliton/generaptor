export function RatingField({ field, value, onChange, error }) {
  const score = Number(value) || 0;

  return (
    <fieldset className="rating">
      <legend>{field.label}</legend>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={step}
            type="button"
            aria-pressed={score === step}
            onClick={() => onChange(step)}
          >
            {step}
          </button>
        ))}
      </div>
      <p className={error ? 'rating-error' : undefined}>
        {error || field.helperText || '1 is rough, 5 is excellent.'}
      </p>
    </fieldset>
  );
}

export function present(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof File !== 'undefined' && value instanceof File) {
    return { name: value.name, size: value.size, type: value.type };
  }
  if (Array.isArray(value)) return value.map(present);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, present(item)]));
  }
  return value;
}
