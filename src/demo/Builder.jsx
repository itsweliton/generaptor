import { useEffect, useMemo, useState } from 'react';
import { FormGenerator } from '../FormGenerator';

const BLOCKS = [
  { type: 'text', label: 'Text', defaultLabel: 'Text' },
  { type: 'email', label: 'Email', defaultLabel: 'Email' },
  { type: 'password', label: 'Password', defaultLabel: 'Password' },
  { type: 'number', label: 'Number', defaultLabel: 'Number' },
  { type: 'textarea', label: 'Long text', defaultLabel: 'Message' },
  { type: 'select', label: 'Select', defaultLabel: 'Select' },
  { type: 'radio', label: 'Radio', defaultLabel: 'Choice' },
  { type: 'checkbox', label: 'Checkbox', defaultLabel: 'Checkbox' },
  { type: 'switch', label: 'Switch', defaultLabel: 'Switch' },
  { type: 'date', label: 'Date', defaultLabel: 'Date' },
  { type: 'time', label: 'Time', defaultLabel: 'Time' },
  { type: 'datetime', label: 'Date & time', defaultLabel: 'Date and time' },
  { type: 'phone', label: 'Phone', defaultLabel: 'Phone' },
  { type: 'cep', label: 'CEP', defaultLabel: 'CEP' },
  { type: 'cpf', label: 'CPF', defaultLabel: 'CPF' },
  { type: 'currency', label: 'Currency', defaultLabel: 'Amount' },
  { type: 'file', label: 'Upload', defaultLabel: 'File' },
];

const TEXT_TYPES = new Set([
  'text',
  'email',
  'password',
  'number',
  'textarea',
  'phone',
  'cep',
  'cpf',
  'currency',
]);
const FIELD_TYPES = new Set(BLOCKS.map((block) => block.type));
const LENGTH_TYPES = new Set(['text', 'password', 'textarea', 'email', 'phone', 'cep', 'cpf']);
const FORMAT_CHECKS = {
  email: { key: 'email', label: 'Check email', placeholder: 'Enter a valid email' },
  phone: { key: 'telephone', label: 'Check phone', placeholder: 'Enter a valid phone number' },
  cpf: { key: 'cpf', label: 'Check CPF', placeholder: 'Enter a valid CPF' },
  cep: { key: 'cep', label: 'Check CEP', placeholder: 'Enter a valid CEP' },
  currency: { key: 'currency', label: 'Check amount', placeholder: 'Enter a valid amount' },
  date: { key: 'date', label: 'Check date', placeholder: 'Enter a valid date' },
  time: { key: 'date', label: 'Check time', placeholder: 'Enter a valid time' },
  datetime: { key: 'date', label: 'Check date and time', placeholder: 'Enter a valid date' },
};
const STORAGE_KEY = 'generaptor.builder';

function optionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function storedText(value) {
  const text = value == null ? '' : String(value).trim();
  return text || undefined;
}

function readBuilder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.fields)) return null;
    const fields = data.fields
      .filter((field) => field && FIELD_TYPES.has(field.type) && field.id)
      .map((field) => ({
        id: String(field.id),
        name: String(field.name || 'field'),
        type: field.type,
        label: String(field.label || field.name || 'Field'),
        nameCustom: Boolean(field.nameCustom),
        placeholder: field.placeholder ? String(field.placeholder) : undefined,
        helperText: field.helperText ? String(field.helperText) : undefined,
        required: Boolean(field.required),
        requiredMessage: storedText(
          typeof field.required === 'string' ? field.required : field.requiredMessage,
        ),
        minLength: optionalNumber(field.minLength),
        maxLength: optionalNumber(field.maxLength),
        minLengthMessage: storedText(field.minLengthMessage),
        maxLengthMessage: storedText(field.maxLengthMessage),
        minMessage: storedText(field.minMessage),
        maxMessage: storedText(field.maxMessage),
        formatCheck: field.formatCheck === false ? false : undefined,
        formatMessage: storedText(field.formatMessage),
        currencyMin: optionalNumber(field.currencyMin),
        currencyMax: optionalNumber(field.currencyMax),
        maxSizeMb: optionalNumber(field.maxSizeMb),
        columnSpan: Number(field.columnSpan) === 2 ? 2 : undefined,
        rows: field.rows ? Number(field.rows) : undefined,
        min: field.min ?? undefined,
        max: field.max ?? undefined,
        currency: field.currency ? String(field.currency) : undefined,
        locale: field.locale ? String(field.locale) : undefined,
        accept: field.accept ? String(field.accept) : undefined,
        multiple: Boolean(field.multiple) || undefined,
        options: Array.isArray(field.options)
          ? field.options.map((option) => ({
              value: option?.value ?? '',
              label: String(option?.label ?? ''),
            }))
          : undefined,
      }));
    return {
      fields,
      page: {
        title: String(data.page?.title || ''),
        columns: Number(data.page?.columns) === 2 ? 2 : 1,
        submitLabel: String(data.page?.submitLabel || ''),
      },
      selectedId: fields.some((field) => field.id === data.selectedId) ? data.selectedId : null,
    };
  } catch {
    return null;
  }
}

function slugName(label) {
  const words = String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g);
  if (!words?.length) return 'field';
  return words
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

function uniqueName(fields, base) {
  const taken = new Set(fields.map((field) => field.name));
  if (!taken.has(base)) return base;
  let index = 2;
  while (taken.has(`${base}${index}`)) index += 1;
  return `${base}${index}`;
}

function choiceOptions() {
  return [
    { value: 'one', label: 'Option one' },
    { value: 'two', label: 'Option two' },
  ];
}

function createBlock(type, fields) {
  const meta = BLOCKS.find((block) => block.type === type);
  const label = meta?.defaultLabel || 'Field';
  const field = {
    id: crypto.randomUUID(),
    name: uniqueName(fields, slugName(label)),
    type,
    label,
    nameCustom: false,
  };
  if (type === 'textarea') field.rows = 4;
  if (type === 'select' || type === 'radio') field.options = choiceOptions();
  if (type === 'currency') {
    field.currency = 'BRL';
    field.locale = 'pt-BR';
  }
  if (type === 'file') field.accept = '';
  return field;
}

function optionValue(option, index) {
  const raw = String(option.value ?? '').trim();
  if (raw) return /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
  return slugName(option.label) || `option${index + 1}`;
}

function exportField(field) {
  const exported = {
    name: field.name || slugName(field.label),
    type: field.type,
    label: field.label || field.name,
  };
  if (field.placeholder) exported.placeholder = field.placeholder;
  if (field.helperText) exported.helperText = field.helperText;
  if (field.required) exported.required = storedText(field.requiredMessage) || true;
  if (field.columnSpan > 1) exported.columnSpan = field.columnSpan;
  const minLength = optionalNumber(field.minLength);
  const maxLength = optionalNumber(field.maxLength);
  if (minLength != null) {
    exported.minLength = storedText(field.minLengthMessage)
      ? { value: minLength, message: storedText(field.minLengthMessage) }
      : minLength;
  }
  if (maxLength != null) {
    exported.maxLength = storedText(field.maxLengthMessage)
      ? { value: maxLength, message: storedText(field.maxLengthMessage) }
      : maxLength;
  }
  if (field.type === 'textarea' && field.rows) exported.rows = Number(field.rows);
  if (field.type === 'number') {
    if (field.min !== '' && field.min != null) exported.min = Number(field.min);
    if (field.max !== '' && field.max != null) exported.max = Number(field.max);
  }
  if (field.type === 'select' || field.type === 'radio') {
    exported.options = (field.options || [])
      .filter((option) => option.label || option.value)
      .map((option, index) => ({
        value: optionValue(option, index),
        label: option.label || String(optionValue(option, index)),
      }));
  }
  if (field.type === 'currency') {
    exported.currency = field.currency || 'BRL';
    exported.locale = field.locale || 'pt-BR';
  }
  if (field.type === 'file') {
    if (field.accept) exported.accept = field.accept;
    if (field.multiple) exported.multiple = true;
    const maxSizeMb = optionalNumber(field.maxSizeMb);
    if (maxSizeMb != null && maxSizeMb > 0) exported.maxSize = Math.round(maxSizeMb * 1_000_000);
  }
  const validators = {};
  const format = FORMAT_CHECKS[field.type];
  if (format) {
    if (field.formatCheck === false) validators[format.key] = false;
    else if (field.type === 'currency') {
      const rules = {};
      const min = optionalNumber(field.currencyMin);
      const max = optionalNumber(field.currencyMax);
      if (min != null) rules.min = min;
      if (max != null) rules.max = max;
      if (storedText(field.formatMessage)) rules.message = storedText(field.formatMessage);
      if (Object.keys(rules).length) validators.currency = rules;
    } else if (storedText(field.formatMessage)) {
      validators[format.key] = storedText(field.formatMessage);
    }
  }
  if (field.type === 'number') {
    const min = optionalNumber(field.min);
    const max = optionalNumber(field.max);
    if (min != null && storedText(field.minMessage)) {
      validators.min = { value: min, message: storedText(field.minMessage) };
    }
    if (max != null && storedText(field.maxMessage)) {
      validators.max = { value: max, message: storedText(field.maxMessage) };
    }
  }
  if (Object.keys(validators).length) exported.validators = validators;
  return exported;
}

export function exportSchema(fields, page) {
  const schema = {};
  if (page.title.trim()) schema.title = page.title.trim();
  if (page.columns > 1) schema.columns = page.columns;
  if (page.submitLabel.trim()) schema.submitLabel = page.submitLabel.trim();
  schema.fields = fields.map(exportField);
  return schema;
}

function BlockPreview({ field, appearance }) {
  const schema = useMemo(() => ({ fields: [exportField(field)] }), [field]);
  return <FormGenerator schema={schema} button={false} {...appearance} />;
}

function Inspector({ field, columns, onChange }) {
  const patch = (partial) => onChange({ ...field, ...partial });

  return (
    <div className="block-settings">
      <label>
        Label
        <input value={field.label} onChange={(event) => patch({ label: event.target.value })} />
      </label>
      <label>
        Name
        <input
          value={field.name}
          onChange={(event) => patch({ name: event.target.value, nameCustom: true })}
        />
      </label>
      {TEXT_TYPES.has(field.type) ? (
        <label>
          Placeholder
          <input
            value={field.placeholder || ''}
            onChange={(event) => patch({ placeholder: event.target.value })}
          />
        </label>
      ) : null}
      <label>
        Helper text
        <input
          value={field.helperText || ''}
          onChange={(event) => patch({ helperText: event.target.value })}
        />
      </label>
      <div className="block-validation">
        <span>Validation</span>
        <label className="block-check">
          <input
            type="checkbox"
            checked={Boolean(field.required)}
            onChange={(event) => patch({ required: event.target.checked })}
          />
          Required
        </label>
        {field.required ? (
          <label>
            Required message
            <input
              value={field.requiredMessage || ''}
              placeholder="This field is required"
              onChange={(event) => patch({ requiredMessage: event.target.value })}
            />
          </label>
        ) : (
          <span />
        )}
        {LENGTH_TYPES.has(field.type) ? (
          <>
            <label>
              Min length
              <input
                type="number"
                min="0"
                value={field.minLength ?? ''}
                onChange={(event) => patch({ minLength: event.target.value })}
              />
            </label>
            <label>
              Min length message
              <input
                value={field.minLengthMessage || ''}
                placeholder="Use at least … characters"
                onChange={(event) => patch({ minLengthMessage: event.target.value })}
              />
            </label>
            <label>
              Max length
              <input
                type="number"
                min="0"
                value={field.maxLength ?? ''}
                onChange={(event) => patch({ maxLength: event.target.value })}
              />
            </label>
            <label>
              Max length message
              <input
                value={field.maxLengthMessage || ''}
                placeholder="Use at most … characters"
                onChange={(event) => patch({ maxLengthMessage: event.target.value })}
              />
            </label>
          </>
        ) : null}
        {field.type === 'number' ? (
          <>
            <label>
              Min
              <input
                type="number"
                value={field.min ?? ''}
                onChange={(event) => patch({ min: event.target.value })}
              />
            </label>
            <label>
              Min message
              <input
                value={field.minMessage || ''}
                placeholder="Enter a value of at least …"
                onChange={(event) => patch({ minMessage: event.target.value })}
              />
            </label>
            <label>
              Max
              <input
                type="number"
                value={field.max ?? ''}
                onChange={(event) => patch({ max: event.target.value })}
              />
            </label>
            <label>
              Max message
              <input
                value={field.maxMessage || ''}
                placeholder="Enter a value of at most …"
                onChange={(event) => patch({ maxMessage: event.target.value })}
              />
            </label>
          </>
        ) : null}
        {FORMAT_CHECKS[field.type] ? (
          <>
            <label className="block-check">
              <input
                type="checkbox"
                checked={field.formatCheck !== false}
                onChange={(event) =>
                  patch({ formatCheck: event.target.checked ? undefined : false })
                }
              />
              {FORMAT_CHECKS[field.type].label}
            </label>
            {field.formatCheck !== false ? (
              <label>
                Format message
                <input
                  value={field.formatMessage || ''}
                  placeholder={FORMAT_CHECKS[field.type].placeholder}
                  onChange={(event) => patch({ formatMessage: event.target.value })}
                />
              </label>
            ) : (
              <span />
            )}
          </>
        ) : null}
        {field.type === 'currency' && field.formatCheck !== false ? (
          <>
            <label>
              Min amount
              <input
                type="number"
                value={field.currencyMin ?? ''}
                onChange={(event) => patch({ currencyMin: event.target.value })}
              />
            </label>
            <label>
              Max amount
              <input
                type="number"
                value={field.currencyMax ?? ''}
                onChange={(event) => patch({ currencyMax: event.target.value })}
              />
            </label>
          </>
        ) : null}
        {field.type === 'file' ? (
          <label>
            Max size (MB)
            <input
              type="number"
              min="0"
              step="0.1"
              value={field.maxSizeMb ?? ''}
              onChange={(event) => patch({ maxSizeMb: event.target.value })}
            />
          </label>
        ) : null}
      </div>
      {columns > 1 ? (
        <label>
          Width
          <select
            value={String(field.columnSpan || 1)}
            onChange={(event) => patch({ columnSpan: Number(event.target.value) })}
          >
            <option value="1">One column</option>
            <option value="2">Full width</option>
          </select>
        </label>
      ) : null}
      {field.type === 'textarea' ? (
        <label>
          Rows
          <input
            type="number"
            min="2"
            max="12"
            value={field.rows || 4}
            onChange={(event) => patch({ rows: Number(event.target.value) })}
          />
        </label>
      ) : null}
      {field.type === 'currency' ? (
        <>
          <label>
            Currency
            <input
              value={field.currency || 'BRL'}
              onChange={(event) => patch({ currency: event.target.value })}
            />
          </label>
          <label>
            Locale
            <input
              value={field.locale || 'pt-BR'}
              onChange={(event) => patch({ locale: event.target.value })}
            />
          </label>
        </>
      ) : null}
      {field.type === 'file' ? (
        <>
          <label>
            Accept
            <input
              value={field.accept || ''}
              placeholder="image/*"
              onChange={(event) => patch({ accept: event.target.value })}
            />
          </label>
          <label className="block-check">
            <input
              type="checkbox"
              checked={Boolean(field.multiple)}
              onChange={(event) => patch({ multiple: event.target.checked })}
            />
            Multiple files
          </label>
        </>
      ) : null}
      {field.options ? (
        <div className="block-options">
          <span>Options</span>
          {field.options.map((option, index) => (
            <div key={`${field.id}-option-${index}`} className="option-row">
              <input
                aria-label={`Option ${index + 1} label`}
                value={option.label}
                placeholder="Label"
                onChange={(event) =>
                  patch({
                    options: editOption(field.options, index, { label: event.target.value }),
                  })
                }
              />
              <input
                aria-label={`Option ${index + 1} value`}
                value={option.value}
                placeholder="Value"
                onChange={(event) =>
                  patch({
                    options: editOption(field.options, index, { value: event.target.value }),
                  })
                }
              />
              <button
                type="button"
                aria-label={`Remove option ${index + 1}`}
                onClick={() =>
                  patch({ options: field.options.filter((_, item) => item !== index) })
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                options: [
                  ...field.options,
                  { value: `option${field.options.length + 1}`, label: 'New option' },
                ],
              })
            }
          >
            Add option
          </button>
        </div>
      ) : null}
    </div>
  );
}

function editOption(options, index, partial) {
  return options.map((option, item) => (item === index ? { ...option, ...partial } : option));
}

export default function Builder({ appearance }) {
  const stored = useMemo(() => readBuilder(), []);
  const [fields, setFields] = useState(() => stored?.fields ?? []);
  const [selectedId, setSelectedId] = useState(() => stored?.selectedId ?? null);
  const [dragId, setDragId] = useState(null);
  const [page, setPage] = useState(
    () => stored?.page ?? { title: '', columns: 1, submitLabel: '' },
  );
  const [copiedJson, setCopiedJson] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fields, page, selectedId }));
  }, [fields, page, selectedId]);
  const schema = useMemo(() => exportSchema(fields, page), [fields, page]);
  const json = JSON.stringify(schema, null, 2);
  const mode = appearance?.tokens?.mode;
  const copied = copiedJson === json;

  function addBlock(type) {
    const block = createBlock(type, fields);
    setFields((current) => [...current, block]);
    setSelectedId(block.id);
  }

  function updateField(next) {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== next.id) return field;
        if (!next.nameCustom && next.label !== field.label) {
          const others = current.filter((item) => item.id !== next.id);
          return { ...next, name: uniqueName(others, slugName(next.label)) };
        }
        return next;
      }),
    );
  }

  function move(fromId, toId) {
    if (!fromId || fromId === toId) return;
    setFields((current) => {
      const next = [...current];
      const from = next.findIndex((field) => field.id === fromId);
      const to = next.findIndex((field) => field.id === toId);
      if (from < 0 || to < 0) return current;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function shift(id, direction) {
    setFields((current) => {
      const index = current.findIndex((field) => field.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  async function copySchema() {
    try {
      await navigator.clipboard.writeText(json);
      setCopiedJson(json);
    } catch {
      setCopiedJson('');
    }
  }

  function downloadSchema() {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form-schema.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="builder">
      <div className="builder-canvas">
        <div className="builder-palette" role="toolbar" aria-label="Add a block">
          {BLOCKS.map((block) => (
            <button key={block.type} type="button" onClick={() => addBlock(block.type)}>
              {block.label}
            </button>
          ))}
        </div>

        <section
          className="builder-page"
          aria-label="Form page"
          style={{
            background: appearance?.tokens?.paper,
            color: appearance?.tokens?.text,
            borderColor: mode === 'dark' ? '#3c342c' : undefined,
            '--builder-columns': page.columns,
          }}
        >
          <div className="builder-page-head">
            <label>
              Form title
              <input
                value={page.title}
                placeholder="Untitled form"
                onChange={(event) =>
                  setPage((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label>
              Columns
              <select
                value={String(page.columns)}
                onChange={(event) =>
                  setPage((current) => ({ ...current, columns: Number(event.target.value) }))
                }
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
            <label>
              Submit label
              <input
                value={page.submitLabel}
                placeholder="Submit"
                onChange={(event) =>
                  setPage((current) => ({ ...current, submitLabel: event.target.value }))
                }
              />
            </label>
          </div>

          {fields.length === 0 ? (
            <div className="builder-empty">
              <p>This page is blank.</p>
              <p>Add a block above. Each one becomes a field in the schema.</p>
            </div>
          ) : (
            <div className="builder-stack">
              {fields.map((field, index) => {
                const meta = BLOCKS.find((block) => block.type === field.type);
                const selected = field.id === selectedId;
                return (
                  <article
                    key={field.id}
                    className={selected ? 'block is-selected' : 'block'}
                    data-span={page.columns > 1 ? field.columnSpan || 1 : 1}
                    onClick={() => setSelectedId(field.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      move(dragId || event.dataTransfer.getData('text/plain'), field.id);
                      setDragId(null);
                    }}
                  >
                    <div className="block-bar">
                      <button
                        type="button"
                        className="block-grip"
                        draggable
                        aria-label={`Drag ${field.label}`}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', field.id);
                          setDragId(field.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                      >
                        ⋮⋮
                      </button>
                      <span>{meta?.label || field.type}</span>
                      <div className="block-actions">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={index === 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            shift(field.id, -1);
                          }}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={index === fields.length - 1}
                          onClick={(event) => {
                            event.stopPropagation();
                            shift(field.id, 1);
                          }}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${field.label}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setFields((current) => current.filter((item) => item.id !== field.id));
                            if (selected) setSelectedId(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="block-preview">
                      <BlockPreview field={field} appearance={appearance} />
                    </div>
                    {selected ? (
                      <Inspector field={field} columns={page.columns} onChange={updateField} />
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
          {fields.length ? (
            <button
              type="button"
              className="builder-clear"
              onClick={() => {
                setFields([]);
                setSelectedId(null);
              }}
            >
              Clear page
            </button>
          ) : null}
        </section>
      </div>

      <aside className="builder-json" aria-label="Exported schema">
        <header>
          <div>
            <p className="eyebrow">Export</p>
            <h3>Schema</h3>
          </div>
          <div className="builder-json-actions">
            <button type="button" onClick={copySchema}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={downloadSchema}>
              Download
            </button>
          </div>
        </header>
        <pre>{json}</pre>
      </aside>
    </div>
  );
}
