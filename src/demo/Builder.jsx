import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { FormGenerator } from '../FormGenerator';
import { applyMask } from '../masks';
import { present } from './widgets';

const BLOCKS = [
  { type: 'text', label: 'Text', defaultLabel: 'Text' },
  { type: 'email', label: 'Email', defaultLabel: 'Email' },
  { type: 'url', label: 'URL', defaultLabel: 'Website' },
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
  { type: 'ssn', label: 'Social Security', defaultLabel: 'Social Security number' },
  { type: 'postal', label: 'Postal code', defaultLabel: 'Postal code' },
  { type: 'currency', label: 'Currency', defaultLabel: 'Amount' },
  { type: 'file', label: 'Upload', defaultLabel: 'File' },
];

const TEXT_TYPES = new Set([
  'text',
  'email',
  'url',
  'password',
  'number',
  'textarea',
  'phone',
  'ssn',
  'postal',
  'currency',
]);
const FIELD_TYPES = new Set(BLOCKS.map((block) => block.type));
const LENGTH_TYPES = new Set([
  'text',
  'password',
  'textarea',
  'email',
  'url',
  'phone',
  'ssn',
  'postal',
]);
const PATTERN_TYPES = new Set(['text', 'password', 'textarea', 'email', 'url']);
const DATE_TYPES = new Set(['date', 'time', 'datetime']);
const CHOICE_TYPES = new Set(['select', 'radio']);
const TOGGLE_TYPES = new Set(['checkbox', 'switch']);
const AUTOCOMPLETE = [
  'off',
  'name',
  'given-name',
  'family-name',
  'email',
  'username',
  'new-password',
  'current-password',
  'tel',
  'street-address',
  'postal-code',
  'country-name',
  'organization',
  'url',
  'bday',
];
const FORMAT_CHECKS = {
  email: { key: 'email', label: 'Check email', placeholder: 'Enter a valid email' },
  url: { key: 'url', label: 'Check URL', placeholder: 'Enter a valid URL' },
  phone: { key: 'telephone', label: 'Check phone', placeholder: 'Enter a valid phone number' },
  ssn: {
    key: 'ssn',
    label: 'Check Social Security number',
    placeholder: 'Enter a valid Social Security number',
  },
  postal: { key: 'postal', label: 'Check postal code', placeholder: 'Enter a valid postal code' },
  currency: { key: 'currency', label: 'Check amount', placeholder: 'Enter a valid amount' },
  date: { key: 'date', label: 'Check date', placeholder: 'Enter a valid date' },
  time: { key: 'date', label: 'Check time', placeholder: 'Enter a valid time' },
  datetime: { key: 'date', label: 'Check date and time', placeholder: 'Enter a valid date' },
};
const STORAGE_KEY = 'generaptor.builder';
const SUBMIT_ALIGNS = ['left', 'center', 'right'];
const VALIDATE_ON = ['blur', 'change', 'submit'];
const EMPTY_PAGE = {
  title: '',
  description: '',
  columns: 1,
  layout: 'groups',
  validateOn: 'blur',
  submitLabel: '',
  submitWide: false,
  submitAlign: 'left',
};

function optionalNumber(value) {
  if (value === '' || value == null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function storedText(value) {
  const text = value == null ? '' : String(value).trim();
  return text || undefined;
}

function publicType(type) {
  if (type === 'cpf') return 'ssn';
  if (type === 'cep') return 'postal';
  return type || 'text';
}

function newFormId() {
  return crypto.randomUUID();
}

function readField(field) {
  if (!field?.id) return null;
  const type = publicType(field.type);
  if (!FIELD_TYPES.has(type)) return null;
  return {
    kind: 'field',
    id: String(field.id),
    name: String(field.name || 'field'),
    type,
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
    acceptMessage: storedText(field.acceptMessage),
    maxSizeMessage: storedText(field.maxSizeMessage),
    buttonLabel: storedText(field.buttonLabel),
    multiple: Boolean(field.multiple) || undefined,
    defaultValue:
      typeof field.defaultValue === 'boolean' || typeof field.defaultValue === 'string'
        ? field.defaultValue
        : undefined,
    disabled: Boolean(field.disabled) || undefined,
    readOnly: Boolean(field.readOnly) || undefined,
    pattern: storedText(field.pattern),
    patternMessage: storedText(field.patternMessage),
    mask: storedText(field.mask),
    step: storedText(field.step),
    autoComplete: storedText(field.autoComplete),
    format: storedText(field.format),
    labelPlacement: storedText(field.labelPlacement),
    variant: storedText(field.variant),
    size: storedText(field.size),
    showField: storedText(field.showField),
    showOp: field.showOp === 'notEquals' ? 'notEquals' : 'equals',
    showValue: field.showValue == null ? '' : String(field.showValue),
    options: Array.isArray(field.options)
      ? field.options.map((option) => ({
          value: option?.value ?? '',
          label: String(option?.label ?? ''),
          disabled: Boolean(option?.disabled) || undefined,
        }))
      : undefined,
  };
}

function readBlock(block) {
  if (!block) return null;
  if (block.kind === 'group') {
    return {
      kind: 'group',
      id: String(block.id || newFormId()),
      label: String(block.label || 'Group'),
      description: String(block.description || ''),
      columns: Number(block.columns) === 2 ? 2 : 1,
      fields: (block.fields || []).map(readField).filter(Boolean),
    };
  }
  return readField(block);
}

function collectIds(blocks) {
  const ids = [];
  blocks.forEach((block) => {
    ids.push(block.id);
    if (block.kind === 'group') block.fields.forEach((field) => ids.push(field.id));
  });
  return ids;
}

function readBuilder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const source = Array.isArray(data?.blocks)
      ? data.blocks
      : Array.isArray(data?.fields)
        ? data.fields
        : null;
    if (!source) return null;
    const blocks = source.map(readBlock).filter(Boolean);
    return {
      formId: typeof data.formId === 'string' && data.formId ? data.formId : newFormId(),
      blocks,
      page: {
        title: String(data.page?.title || ''),
        description: String(data.page?.description || ''),
        columns: Number(data.page?.columns) === 2 ? 2 : 1,
        layout: data.page?.layout === 'tabs' ? 'tabs' : 'groups',
        validateOn: VALIDATE_ON.includes(data.page?.validateOn) ? data.page.validateOn : 'blur',
        submitLabel: String(data.page?.submitLabel || ''),
        submitWide: Boolean(data.page?.submitWide),
        submitAlign: SUBMIT_ALIGNS.includes(data.page?.submitAlign)
          ? data.page.submitAlign
          : 'left',
      },
      selectedId: collectIds(blocks).includes(data.selectedId) ? data.selectedId : null,
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

function choiceValue(field, raw) {
  const options = field.options || [];
  const index = options.findIndex(
    (option, position) => String(optionValue(option, position)) === String(raw),
  );
  return index < 0 ? undefined : optionValue(options[index], index);
}

function typedValue(field, raw) {
  if (TOGGLE_TYPES.has(field.type)) return raw === true || raw === 'true';
  if (raw == null || raw === '') return undefined;
  if (CHOICE_TYPES.has(field.type)) return choiceValue(field, raw);
  if (field.type === 'number') return optionalNumber(raw);
  return String(raw);
}

function exportDefault(field, exported) {
  if (field.defaultValue == null || field.defaultValue === '') return;
  if (TOGGLE_TYPES.has(field.type)) {
    if (field.defaultValue === true) exported.defaultValue = true;
    return;
  }
  if (CHOICE_TYPES.has(field.type)) {
    const value = choiceValue(field, field.defaultValue);
    if (value !== undefined) exported.defaultValue = value;
    return;
  }
  if (TEXT_TYPES.has(field.type)) {
    exported.defaultValue = applyMask(exported, String(field.defaultValue));
  }
}

function exportShowIf(field, fields) {
  if (!field.showField) return;
  const target = fields.find((item) => item.id === field.showField && item.id !== field.id);
  if (!target) return;
  const value = typedValue(target, field.showValue);
  if (value === undefined) return;
  return { field: target.name, [field.showOp === 'notEquals' ? 'notEquals' : 'equals']: value };
}

function exportField(field, fields = []) {
  const exported = {
    name: field.name || slugName(field.label),
    type: field.type,
    label: field.label || field.name,
  };
  if (field.placeholder) exported.placeholder = field.placeholder;
  if (field.helperText) exported.helperText = field.helperText;
  if (field.required) exported.required = storedText(field.requiredMessage) || true;
  if (field.columnSpan > 1) exported.columnSpan = field.columnSpan;
  if (field.disabled) exported.disabled = true;
  if (field.readOnly && TEXT_TYPES.has(field.type)) exported.readOnly = true;
  if (field.variant) exported.variant = field.variant;
  if (field.size) exported.size = field.size;
  if (field.autoComplete && TEXT_TYPES.has(field.type)) exported.autoComplete = field.autoComplete;
  if (field.mask && field.type === 'text') exported.mask = field.mask;
  if (field.type === 'number' && storedText(field.step)) {
    exported.step = optionalNumber(field.step) ?? field.step;
  }
  if (DATE_TYPES.has(field.type) && field.format) exported.format = field.format;
  if (TOGGLE_TYPES.has(field.type) && field.labelPlacement && field.labelPlacement !== 'end') {
    exported.labelPlacement = field.labelPlacement;
  }
  const showIf = exportShowIf(field, fields);
  if (showIf) exported.showIf = showIf;
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
      .map((option, index) => {
        const item = {
          value: optionValue(option, index),
          label: option.label || String(optionValue(option, index)),
        };
        if (option.disabled) item.disabled = true;
        return item;
      });
  }
  exportDefault(field, exported);
  if (field.type === 'currency') {
    exported.currency = field.currency || 'BRL';
    exported.locale = field.locale || 'pt-BR';
  }
  if (field.type === 'file') {
    if (field.accept) exported.accept = field.accept;
    if (field.accept && field.acceptMessage) exported.acceptMessage = field.acceptMessage;
    if (field.multiple) exported.multiple = true;
    if (field.buttonLabel) exported.buttonLabel = field.buttonLabel;
    const maxSizeMb = optionalNumber(field.maxSizeMb);
    if (maxSizeMb != null && maxSizeMb > 0) {
      exported.maxSize = Math.round(maxSizeMb * 1_000_000);
      if (field.maxSizeMessage) exported.maxSizeMessage = field.maxSizeMessage;
    }
  }
  const validators = {};
  if (PATTERN_TYPES.has(field.type) && field.pattern) {
    validators.pattern = storedText(field.patternMessage)
      ? { value: field.pattern, message: storedText(field.patternMessage) }
      : { value: field.pattern };
  }
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

function exportGroup(group, usedIds, fields) {
  const base = slugName(group.label);
  const id = uniqueName(
    usedIds.map((name) => ({ name })),
    !group.label || base === 'field' ? 'group' : base,
  );
  usedIds.push(id);
  const exported = {
    id,
    label: group.label || '',
    fields: group.fields.map((field) => exportField(field, fields)),
  };
  if (storedText(group.description)) exported.description = storedText(group.description);
  if (group.columns > 1) exported.columns = group.columns;
  return exported;
}

export function exportSchema(blocks, page, formId) {
  const schema = { formId };
  if (page.title.trim()) schema.title = page.title.trim();
  if (storedText(page.description)) schema.description = storedText(page.description);
  if (page.columns > 1) schema.columns = page.columns;
  if (page.validateOn && page.validateOn !== 'blur') schema.validateOn = page.validateOn;
  if (page.submitLabel.trim()) schema.submitLabel = page.submitLabel.trim();
  const button = {};
  if (page.submitWide) button.fullWidth = true;
  if (page.submitAlign && page.submitAlign !== 'left') button.align = page.submitAlign;
  if (Object.keys(button).length) schema.button = button;

  const fields = fieldsIn(blocks);
  const hasGroups = blocks.some((block) => block.kind === 'group');
  if (!hasGroups) {
    schema.fields = blocks.map((field) => exportField(field, fields));
    return schema;
  }

  const tabs = page.layout === 'tabs';
  const groups = [];
  const usedIds = [];
  let loose = [];
  const flush = () => {
    if (!loose.length) return;
    groups.push(
      exportGroup(
        { label: tabs ? 'General' : '', description: '', columns: 1, fields: loose },
        usedIds,
        fields,
      ),
    );
    loose = [];
  };
  blocks.forEach((block) => {
    if (block.kind === 'group') {
      flush();
      groups.push(exportGroup(block, usedIds, fields));
      return;
    }
    loose.push(block);
  });
  flush();
  schema.layout = tabs ? 'tabs' : 'groups';
  schema.groups = groups;
  return schema;
}

function fieldsIn(blocks) {
  return blocks.flatMap((block) => (block.kind === 'group' ? block.fields : [block]));
}

function renamed(blocks, previous, next) {
  if (!next.nameCustom && next.label !== previous.label) {
    const others = fieldsIn(blocks).filter((field) => field.id !== next.id);
    return { ...next, kind: 'field', name: uniqueName(others, slugName(next.label)) };
  }
  return { ...next, kind: 'field' };
}

function BlockPreview({ field, appearance }) {
  const schema = useMemo(
    () => ({ fields: [{ ...exportField(field), id: `preview-${field.id}` }] }),
    [field],
  );
  return (
    <FormGenerator
      schema={schema}
      button={false}
      theme={appearance?.theme}
      styles={appearance?.styles}
      classNames={appearance?.classNames}
    />
  );
}

function SubmitButton({ page, appearance }) {
  const label = page.submitLabel.trim() || 'Submit';
  const align = SUBMIT_ALIGNS.includes(page.submitAlign) ? page.submitAlign : 'left';
  const button = (
    <div
      className="generaptor-actions"
      data-align={align}
      data-wide={page.submitWide ? 'true' : 'false'}
    >
      <Button
        type="button"
        variant={appearance?.styles?.button?.variant || 'contained'}
        color={appearance?.styles?.button?.color || 'primary'}
        fullWidth={Boolean(page.submitWide)}
        disableElevation={appearance?.styles?.button?.disableElevation !== false}
        tabIndex={-1}
        sx={appearance?.styles?.button?.sx}
      >
        {label}
      </Button>
    </div>
  );
  if (!appearance?.theme) return button;
  return <ThemeProvider theme={appearance.theme}>{button}</ThemeProvider>;
}

function Section({ title, open = false, children }) {
  return (
    <details className="block-section" open={open}>
      <summary>{title}</summary>
      <div className="block-section-body">{children}</div>
    </details>
  );
}

function DefaultValue({ field, onPatch }) {
  if (TOGGLE_TYPES.has(field.type)) {
    return (
      <label className="block-check">
        <input
          type="checkbox"
          checked={field.defaultValue === true}
          onChange={(event) => onPatch({ defaultValue: event.target.checked || undefined })}
        />
        On by default
      </label>
    );
  }
  if (CHOICE_TYPES.has(field.type)) {
    return (
      <label>
        Default option
        <select
          value={field.defaultValue ?? ''}
          onChange={(event) => onPatch({ defaultValue: event.target.value || undefined })}
        >
          <option value="">None</option>
          {(field.options || []).map((option, index) => (
            <option key={`${field.id}-default-${index}`} value={String(optionValue(option, index))}>
              {option.label || String(optionValue(option, index))}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (!TEXT_TYPES.has(field.type)) return null;
  return (
    <label>
      Default value
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={field.defaultValue ?? ''}
        onChange={(event) => onPatch({ defaultValue: event.target.value })}
      />
    </label>
  );
}

function ShowWhen({ field, fields, onPatch }) {
  const others = fields.filter((item) => item.id !== field.id);
  const target = others.find((item) => item.id === field.showField);
  let valueInput = null;
  if (target && TOGGLE_TYPES.has(target.type)) {
    valueInput = (
      <select
        aria-label="Value"
        value={field.showValue === 'false' ? 'false' : 'true'}
        onChange={(event) => onPatch({ showValue: event.target.value })}
      >
        <option value="true">On</option>
        <option value="false">Off</option>
      </select>
    );
  } else if (target && CHOICE_TYPES.has(target.type)) {
    valueInput = (
      <select
        aria-label="Value"
        value={field.showValue}
        onChange={(event) => onPatch({ showValue: event.target.value })}
      >
        <option value="">Choose an option</option>
        {(target.options || []).map((option, index) => (
          <option key={`${target.id}-show-${index}`} value={String(optionValue(option, index))}>
            {option.label || String(optionValue(option, index))}
          </option>
        ))}
      </select>
    );
  } else if (target) {
    valueInput = (
      <input
        aria-label="Value"
        value={field.showValue}
        placeholder="Value"
        onChange={(event) => onPatch({ showValue: event.target.value })}
      />
    );
  }

  return (
    <div className="block-show">
      <label>
        Show when
        <select
          value={target ? target.id : ''}
          onChange={(event) => {
            const next = others.find((item) => item.id === event.target.value);
            onPatch({
              showField: next?.id,
              showOp: 'equals',
              showValue: next && TOGGLE_TYPES.has(next.type) ? 'true' : '',
            });
          }}
        >
          <option value="">Always</option>
          {others.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label || item.name}
            </option>
          ))}
        </select>
      </label>
      {target ? (
        <>
          <label>
            Is
            <select
              value={field.showOp}
              onChange={(event) => onPatch({ showOp: event.target.value })}
            >
              <option value="equals">equal to</option>
              <option value="notEquals">not equal to</option>
            </select>
          </label>
          <label>
            Value
            {valueInput}
          </label>
        </>
      ) : null}
    </div>
  );
}

function Inspector({ field, fields, columns, groups, groupId, onChange, onPlace }) {
  const patch = (partial) => onChange({ ...field, ...partial });

  return (
    <div className="block-settings">
      <Section title="Field" open>
        {groups?.length ? (
          <label>
            Section
            <select
              value={groupId || ''}
              onChange={(event) => onPlace(field.id, event.target.value)}
            >
              <option value="">Page</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label || 'Group'}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Label
          <input value={field.label} onChange={(event) => patch({ label: event.target.value })} />
        </label>
        <label>
          Name
          <input
            value={field.name}
            onChange={(event) => patch({ name: event.target.value, nameCustom: true })}
            onBlur={() => {
              if (!/^[A-Za-z_$][\w$]*$/.test(field.name)) patch({ name: slugName(field.name) });
            }}
          />
        </label>
        {TEXT_TYPES.has(field.type) || field.type === 'select' ? (
          <label>
            {field.type === 'select' ? 'Empty option text' : 'Placeholder'}
            <input
              value={field.placeholder || ''}
              placeholder={field.type === 'select' ? 'Select' : undefined}
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
        <DefaultValue field={field} onPatch={patch} />
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
                <label className="option-off" title="Disable this option">
                  <input
                    type="checkbox"
                    aria-label={`Disable option ${index + 1}`}
                    checked={Boolean(option.disabled)}
                    onChange={(event) =>
                      patch({
                        options: editOption(field.options, index, {
                          disabled: event.target.checked || undefined,
                        }),
                      })
                    }
                  />
                  Off
                </label>
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
      </Section>
      <Section title="Validation" open>
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
        {field.type === 'file' && optionalNumber(field.maxSizeMb) ? (
          <label>
            Max size message
            <input
              value={field.maxSizeMessage || ''}
              placeholder="Each file must be under …"
              onChange={(event) => patch({ maxSizeMessage: event.target.value })}
            />
          </label>
        ) : null}
        {field.type === 'file' && field.accept ? (
          <label>
            File type message
            <input
              value={field.acceptMessage || ''}
              placeholder="This file type is not accepted"
              onChange={(event) => patch({ acceptMessage: event.target.value })}
            />
          </label>
        ) : null}
        {PATTERN_TYPES.has(field.type) ? (
          <>
            <label>
              Pattern (regular expression)
              <input
                value={field.pattern || ''}
                placeholder="^[A-Z]{2}\d{4}$"
                spellCheck={false}
                onChange={(event) => patch({ pattern: event.target.value })}
              />
            </label>
            <label>
              Pattern message
              <input
                value={field.patternMessage || ''}
                placeholder="Use the expected format"
                onChange={(event) => patch({ patternMessage: event.target.value })}
              />
            </label>
          </>
        ) : null}
      </Section>
      <Section title="Behavior">
        <label className="block-check">
          <input
            type="checkbox"
            checked={Boolean(field.disabled)}
            onChange={(event) => patch({ disabled: event.target.checked || undefined })}
          />
          Disabled
        </label>
        {TEXT_TYPES.has(field.type) ? (
          <label className="block-check">
            <input
              type="checkbox"
              checked={Boolean(field.readOnly)}
              onChange={(event) => patch({ readOnly: event.target.checked || undefined })}
            />
            Read only
          </label>
        ) : null}
        <ShowWhen field={field} fields={fields} onPatch={patch} />
      </Section>
      <Section title="Input">
        {field.type === 'text' ? (
          <label>
            Mask
            <input
              value={field.mask || ''}
              placeholder="AA-####"
              spellCheck={false}
              onChange={(event) => patch({ mask: event.target.value })}
            />
          </label>
        ) : null}
        {field.type === 'number' ? (
          <label>
            Step
            <input
              value={field.step || ''}
              placeholder="1"
              onChange={(event) => patch({ step: event.target.value })}
            />
          </label>
        ) : null}
        {TEXT_TYPES.has(field.type) ? (
          <label>
            Autocomplete
            <select
              value={field.autoComplete || ''}
              onChange={(event) => patch({ autoComplete: event.target.value || undefined })}
            >
              <option value="">Browser default</option>
              {AUTOCOMPLETE.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {DATE_TYPES.has(field.type) ? (
          <label>
            Display format
            <input
              value={field.format || ''}
              placeholder={
                field.type === 'time'
                  ? 'HH:mm'
                  : field.type === 'datetime'
                    ? 'dd/MM/yyyy HH:mm'
                    : 'dd/MM/yyyy'
              }
              spellCheck={false}
              onChange={(event) => patch({ format: event.target.value })}
            />
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
            <label>
              Button text
              <input
                value={field.buttonLabel || ''}
                placeholder={field.multiple ? 'Choose files' : 'Choose file'}
                onChange={(event) => patch({ buttonLabel: event.target.value })}
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
        {TOGGLE_TYPES.has(field.type) ? (
          <label>
            Label position
            <select
              value={field.labelPlacement || 'end'}
              onChange={(event) => patch({ labelPlacement: event.target.value })}
            >
              <option value="end">After</option>
              <option value="start">Before</option>
              <option value="top">Above</option>
              <option value="bottom">Below</option>
            </select>
          </label>
        ) : null}
      </Section>
      <Section title="Appearance">
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
        {TEXT_TYPES.has(field.type) || field.type === 'select' || DATE_TYPES.has(field.type) ? (
          <label>
            Variant
            <select
              value={field.variant || ''}
              onChange={(event) => patch({ variant: event.target.value || undefined })}
            >
              <option value="">Theme default</option>
              <option value="outlined">Outlined</option>
              <option value="filled">Filled</option>
              <option value="standard">Standard</option>
            </select>
          </label>
        ) : null}
        {field.type !== 'radio' ? (
          <label>
            Size
            <select
              value={field.size || ''}
              onChange={(event) => patch({ size: event.target.value || undefined })}
            >
              <option value="">Theme default</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
            </select>
          </label>
        ) : null}
      </Section>
    </div>
  );
}

function editOption(options, index, partial) {
  return options.map((option, item) => (item === index ? { ...option, ...partial } : option));
}

function FieldBlock({
  field,
  fields,
  index,
  total,
  columns,
  groupId,
  groups,
  selected,
  appearance,
  onSelect,
  onShift,
  onDuplicate,
  onRemove,
  onChange,
  onPlace,
  onDragStart,
  onDrop,
}) {
  const meta = BLOCKS.find((block) => block.type === field.type);
  return (
    <article
      className={selected ? 'block is-selected' : 'block'}
      data-span={columns > 1 ? field.columnSpan || 1 : 1}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(field.id);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop(field.id);
      }}
    >
      <div className="block-bar">
        <button
          type="button"
          className="block-grip"
          draggable
          aria-label={`Drag ${field.label}`}
          onDragStart={(event) => {
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', field.id);
            onDragStart(field.id);
          }}
          onDragEnd={() => onDragStart(null)}
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
              onShift(groupId, field.id, -1);
            }}
          >
            Up
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={(event) => {
              event.stopPropagation();
              onShift(groupId, field.id, 1);
            }}
          >
            Down
          </button>
          <button
            type="button"
            aria-label={`Duplicate ${field.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(field.id);
            }}
          >
            Copy
          </button>
          <button
            type="button"
            aria-label={`Remove ${field.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(field.id);
            }}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="block-preview">
        <BlockPreview field={field} appearance={appearance} />
      </div>
      {field.showField ? <p className="block-note">Shown only when its condition is met.</p> : null}
      {selected ? (
        <Inspector
          field={field}
          fields={fields}
          columns={columns}
          groups={groups}
          groupId={groupId}
          onChange={onChange}
          onPlace={onPlace}
        />
      ) : null}
    </article>
  );
}

function moveList(list, id, direction) {
  const index = list.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function takeBlock(blocks, id) {
  let taken = null;
  const rest = blocks
    .map((block) => {
      if (block.id === id) {
        taken = block;
        return null;
      }
      if (block.kind !== 'group') return block;
      const index = block.fields.findIndex((field) => field.id === id);
      if (index < 0) return block;
      taken = block.fields[index];
      return { ...block, fields: block.fields.filter((field) => field.id !== id) };
    })
    .filter(Boolean);
  return [taken, rest];
}

function insertBefore(list, item, targetId) {
  const index = list.findIndex((entry) => entry.id === targetId);
  if (index < 0) return [...list, item];
  return [...list.slice(0, index), item, ...list.slice(index)];
}

function dropBlock(blocks, fromId, toId) {
  if (!fromId || fromId === toId) return blocks;
  const [moving, rest] = takeBlock(blocks, fromId);
  if (!moving) return blocks;
  const parent = rest.find(
    (block) => block.kind === 'group' && block.fields.some((field) => field.id === toId),
  );
  if (!parent) return insertBefore(rest, moving, toId);
  if (moving.kind === 'group') return insertBefore(rest, moving, parent.id);
  return rest.map((block) =>
    block.id === parent.id ? { ...block, fields: insertBefore(block.fields, moving, toId) } : block,
  );
}

function dropIntoGroup(blocks, fromId, groupId) {
  if (!fromId || fromId === groupId) return blocks;
  const [moving, rest] = takeBlock(blocks, fromId);
  if (!moving) return blocks;
  if (moving.kind === 'group') return insertBefore(rest, moving, groupId);
  return rest.map((block) =>
    block.id === groupId ? { ...block, fields: [...block.fields, moving] } : block,
  );
}

export default function Builder({ appearance }) {
  const stored = useMemo(() => readBuilder(), []);
  const [formId, setFormId] = useState(() => stored?.formId ?? newFormId());
  const [blocks, setBlocks] = useState(() => stored?.blocks ?? []);
  const [selectedId, setSelectedId] = useState(() => stored?.selectedId ?? null);
  const [dragId, setDragId] = useState(null);
  const [panel, setPanel] = useState('schema');
  const [previewValues, setPreviewValues] = useState(null);
  const [page, setPage] = useState(() => ({ ...EMPTY_PAGE, ...stored?.page }));
  const [copiedJson, setCopiedJson] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formId, blocks, page, selectedId }));
  }, [formId, blocks, page, selectedId]);
  const schema = useMemo(() => exportSchema(blocks, page, formId), [blocks, page, formId]);
  const json = JSON.stringify(schema, null, 2);
  const mode = appearance?.tokens?.mode;
  const copied = copiedJson === json;
  const groups = blocks.filter((block) => block.kind === 'group');
  const allFields = fieldsIn(blocks);
  const tabs = page.layout === 'tabs';
  const sectionName = tabs ? 'Tab' : 'Group';

  function addBlock(type) {
    if (type === 'group' || type === 'tab') {
      const nextLayout = type === 'tab' ? 'tabs' : groups.length ? page.layout : 'groups';
      const group = {
        kind: 'group',
        id: newFormId(),
        label: `${nextLayout === 'tabs' ? 'Tab' : 'Group'} ${groups.length + 1}`,
        description: '',
        columns: page.columns > 1 ? page.columns : 1,
        fields: [],
      };
      if (nextLayout !== page.layout) setPage((current) => ({ ...current, layout: nextLayout }));
      setBlocks((current) => [...current, group]);
      setSelectedId(group.id);
      return;
    }
    const field = { kind: 'field', ...createBlock(type, fieldsIn(blocks)) };
    setBlocks((current) => {
      const parent = current.find(
        (block) =>
          block.kind === 'group' &&
          (block.id === selectedId || block.fields.some((item) => item.id === selectedId)),
      );
      if (!parent) return [...current, field];
      return current.map((block) =>
        block.id === parent.id ? { ...block, fields: [...block.fields, field] } : block,
      );
    });
    setSelectedId(field.id);
  }

  function updateField(next) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.kind === 'group') {
          return {
            ...block,
            fields: block.fields.map((field) =>
              field.id === next.id ? renamed(current, field, next) : field,
            ),
          };
        }
        return block.id === next.id ? renamed(current, block, next) : block;
      }),
    );
  }

  function updateGroup(id, partial) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...partial } : block)),
    );
  }

  function placeField(fieldId, groupId) {
    setBlocks((current) => {
      let field = null;
      const without = current
        .map((block) => {
          if (block.kind === 'group') {
            return {
              ...block,
              fields: block.fields.filter((item) => {
                if (item.id !== fieldId) return true;
                field = item;
                return false;
              }),
            };
          }
          if (block.id === fieldId) {
            field = block;
            return null;
          }
          return block;
        })
        .filter(Boolean);
      if (!field) return current;
      if (!groupId) return [...without, field];
      return without.map((block) =>
        block.kind === 'group' && block.id === groupId
          ? { ...block, fields: [...block.fields, field] }
          : block,
      );
    });
  }

  function dropOn(targetId) {
    const fromId = dragId;
    setDragId(null);
    setBlocks((current) => dropBlock(current, fromId, targetId));
  }

  function dropInto(groupId) {
    const fromId = dragId;
    setDragId(null);
    setBlocks((current) => dropIntoGroup(current, fromId, groupId));
  }

  function duplicateField(id) {
    const source = fieldsIn(blocks).find((field) => field.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: crypto.randomUUID(),
      label: `${source.label} copy`,
      name: uniqueName(fieldsIn(blocks), `${source.name}Copy`),
      nameCustom: false,
      options: source.options?.map((option) => ({ ...option })),
    };
    setBlocks((current) =>
      current.flatMap((block) => {
        if (block.id === id) return [block, copy];
        if (block.kind !== 'group' || !block.fields.some((field) => field.id === id)) {
          return [block];
        }
        return [
          {
            ...block,
            fields: block.fields.flatMap((field) => (field.id === id ? [field, copy] : [field])),
          },
        ];
      }),
    );
    setSelectedId(copy.id);
  }

  function shift(parentId, id, direction) {
    setBlocks((current) => {
      if (!parentId) return moveList(current, id, direction);
      return current.map((block) =>
        block.id === parentId ? { ...block, fields: moveList(block.fields, id, direction) } : block,
      );
    });
  }

  function removeBlock(id) {
    setBlocks((current) =>
      current.flatMap((block) => {
        if (block.id === id) return [];
        if (block.kind !== 'group') return [block];
        return [{ ...block, fields: block.fields.filter((field) => field.id !== id) }];
      }),
    );
    if (selectedId === id) setSelectedId(null);
  }

  function startNewForm() {
    setFormId(newFormId());
    setBlocks([]);
    setSelectedId(null);
    setPreviewValues(null);
    setPage(EMPTY_PAGE);
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
          <button type="button" className="is-section" onClick={() => addBlock('group')}>
            Group
          </button>
          <button type="button" className="is-section" onClick={() => addBlock('tab')}>
            Tab
          </button>
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
            <label className="builder-page-description">
              Description
              <input
                value={page.description}
                placeholder="Shown under the title"
                onChange={(event) =>
                  setPage((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label>
              Sections
              <select
                value={page.layout}
                disabled={!groups.length}
                title={groups.length ? undefined : 'Add a group or a tab first'}
                onChange={(event) =>
                  setPage((current) => ({ ...current, layout: event.target.value }))
                }
              >
                <option value="groups">Stacked groups</option>
                <option value="tabs">Tabs</option>
              </select>
            </label>
            <label>
              Check fields
              <select
                value={page.validateOn}
                onChange={(event) =>
                  setPage((current) => ({ ...current, validateOn: event.target.value }))
                }
              >
                <option value="blur">When a field loses focus</option>
                <option value="change">While typing</option>
                <option value="submit">On submit</option>
              </select>
            </label>
          </div>
          <div className="builder-submit">
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
            <label className="block-check">
              <input
                type="checkbox"
                checked={Boolean(page.submitWide)}
                onChange={(event) =>
                  setPage((current) => ({ ...current, submitWide: event.target.checked }))
                }
              />
              Wide
            </label>
            <div className="builder-align" role="group" aria-label="Submit button alignment">
              {SUBMIT_ALIGNS.map((align) => (
                <button
                  key={align}
                  type="button"
                  aria-pressed={(page.submitAlign || 'left') === align}
                  className={(page.submitAlign || 'left') === align ? 'is-active' : undefined}
                  onClick={() => setPage((current) => ({ ...current, submitAlign: align }))}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="builder-formid">
            Form ID <code>{formId}</code>
          </p>

          {blocks.length === 0 ? (
            <div className="builder-empty">
              <p>This page is blank.</p>
              <p>Add a field, a group, or a tab. Each one is written into the schema.</p>
            </div>
          ) : (
            <div className="builder-stack">
              {blocks.map((block, index) =>
                block.kind === 'group' ? (
                  <section
                    key={block.id}
                    className={
                      block.id === selectedId ? 'builder-group is-selected' : 'builder-group'
                    }
                    onClick={() => setSelectedId(block.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      dropInto(block.id);
                    }}
                  >
                    <div className="block-bar">
                      <button
                        type="button"
                        className="block-grip"
                        draggable
                        aria-label={`Drag ${block.label}`}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', block.id);
                          setDragId(block.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                      >
                        ⋮⋮
                      </button>
                      <span>{sectionName}</span>
                      <div className="block-actions">
                        <button
                          type="button"
                          aria-label={`Move ${sectionName.toLowerCase()} up`}
                          disabled={index === 0}
                          onClick={(event) => {
                            event.stopPropagation();
                            shift(null, block.id, -1);
                          }}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${sectionName.toLowerCase()} down`}
                          disabled={index === blocks.length - 1}
                          onClick={(event) => {
                            event.stopPropagation();
                            shift(null, block.id, 1);
                          }}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${block.label}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeBlock(block.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {block.id === selectedId ? (
                      <div className="block-settings">
                        <label>
                          Label
                          <input
                            value={block.label}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              updateGroup(block.id, { label: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          Columns
                          <select
                            value={String(block.columns || 1)}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              updateGroup(block.id, { columns: Number(event.target.value) })
                            }
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                          </select>
                        </label>
                        <label className="builder-group-description">
                          Description
                          <input
                            value={block.description}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              updateGroup(block.id, { description: event.target.value })
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <h3 className="builder-group-title">{block.label}</h3>
                    )}
                    {block.fields.length === 0 ? (
                      <p className="builder-group-empty">
                        This {sectionName.toLowerCase()} is empty. Select it and add a field, or
                        drag a field here.
                      </p>
                    ) : (
                      <div
                        className="builder-stack"
                        style={{ '--builder-columns': block.columns || 1 }}
                      >
                        {block.fields.map((field, fieldIndex) => (
                          <FieldBlock
                            key={field.id}
                            field={field}
                            fields={allFields}
                            index={fieldIndex}
                            total={block.fields.length}
                            columns={block.columns || 1}
                            groupId={block.id}
                            groups={groups}
                            selected={field.id === selectedId}
                            appearance={appearance}
                            onSelect={setSelectedId}
                            onShift={shift}
                            onDuplicate={duplicateField}
                            onRemove={removeBlock}
                            onChange={updateField}
                            onPlace={placeField}
                            onDragStart={setDragId}
                            onDrop={dropOn}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ) : (
                  <FieldBlock
                    key={block.id}
                    field={block}
                    fields={allFields}
                    index={index}
                    total={blocks.length}
                    columns={page.columns}
                    groupId={null}
                    groups={groups}
                    selected={block.id === selectedId}
                    appearance={appearance}
                    onSelect={setSelectedId}
                    onShift={shift}
                    onDuplicate={duplicateField}
                    onRemove={removeBlock}
                    onChange={updateField}
                    onPlace={placeField}
                    onDragStart={setDragId}
                    onDrop={dropOn}
                  />
                ),
              )}
            </div>
          )}
          <div className="builder-submit-preview" aria-hidden="true">
            <SubmitButton page={page} appearance={appearance} />
          </div>
          {blocks.length ? (
            <button type="button" className="builder-clear" onClick={startNewForm}>
              New form
            </button>
          ) : null}
        </section>
      </div>

      <aside
        className={panel === 'form' ? 'builder-json is-form' : 'builder-json'}
        aria-label={panel === 'form' ? 'Rendered form' : 'Exported schema'}
      >
        <header>
          <div className="builder-switch" role="tablist" aria-label="Schema or form">
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'schema'}
              className={panel === 'schema' ? 'is-active' : undefined}
              onClick={() => setPanel('schema')}
            >
              Schema
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'form'}
              className={panel === 'form' ? 'is-active' : undefined}
              onClick={() => setPanel('form')}
            >
              Form
            </button>
          </div>
          {panel === 'schema' ? (
            <div className="builder-json-actions">
              <button type="button" onClick={copySchema}>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={downloadSchema}>
                Download
              </button>
            </div>
          ) : null}
        </header>
        {panel === 'schema' ? (
          <pre>{json}</pre>
        ) : (
          <div className="builder-preview">
            <FormGenerator
              key={formId}
              schema={schema}
              {...appearance}
              button={{
                label: page.submitLabel.trim() || 'Submit',
                fullWidth: Boolean(page.submitWide),
                align: page.submitAlign || 'left',
              }}
              onSubmit={(values) => setPreviewValues(present(values))}
            />
            {previewValues ? (
              <pre className="builder-preview-values">{JSON.stringify(previewValues, null, 2)}</pre>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
