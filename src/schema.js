const TYPE_FROM_INPUT = {
  number: 'number',
  email: 'email',
  mail: 'email',
  password: 'password',
  checkbox: 'checkbox',
  radio: 'radio',
  tel: 'phone',
  phone: 'phone',
};

export function normalizeType(field) {
  const type = String(field.type || 'text').toLowerCase();
  const inputType = String(field.inputType || '').toLowerCase();

  if (type === 'input') return TYPE_FROM_INPUT[inputType] || 'text';
  if (type === 'mail') return 'email';
  if (type === 'hour' || type === 'timepicker') return 'time';
  if (type === 'datepicker') return 'date';
  if (type === 'datetime-local') return 'datetime';
  if (type === 'upload') return 'file';
  if (type === 'tel' || type === 'telephone') return 'phone';
  if (type === 'money') return 'currency';
  return type;
}

function validatorBag(field, type) {
  const source = { ...(field.validators || {}) };

  const assign = (name, value) => {
    if (value == null || source[name] != null) return;
    source[name] = value === true ? true : value;
  };

  assign('required', field.required);
  assign('minLength', field.minLength);
  assign('maxLength', field.maxLength);
  if (field.pattern != null && source.pattern == null) {
    source.pattern = { value: field.pattern, message: field.patternMessage };
  }
  if (type === 'number') {
    assign('min', field.min);
    assign('max', field.max);
  }
  if (type === 'email') assign('email', true);
  if (type === 'url') assign('url', true);
  if (type === 'phone') assign('telephone', true);
  if (type === 'cpf') assign('cpf', true);
  if (type === 'cep') assign('cep', true);
  if (type === 'ssn') assign('ssn', true);
  if (type === 'postal') assign('postal', true);
  if (type === 'currency') assign('currency', field.currencyRules || true);
  if (type === 'date' || type === 'time' || type === 'datetime') assign('date', true);

  return source;
}

export function isRequired(field) {
  return Boolean(field.required || field.validators?.required);
}

export function defaultValue(field) {
  const type = field.type || normalizeType(field);
  const hasInitial = Object.prototype.hasOwnProperty.call(field, 'initialValue');
  const hasDefault = Object.prototype.hasOwnProperty.call(field, 'defaultValue');
  let value;

  if (hasInitial && field.initialValue !== undefined) value = field.initialValue;
  else if (hasDefault) value = field.defaultValue;
  else if (type === 'checkbox' || type === 'switch') return false;
  else if (type === 'file') return field.multiple ? [] : null;
  else if (type === 'date' || type === 'time' || type === 'datetime') return null;
  else return '';

  if ((type === 'select' || type === 'radio') && value === false) return '';
  return value;
}

export function isVisible(field, values) {
  if (typeof field.showIf === 'function') return Boolean(field.showIf(values));
  if (typeof field.visible === 'function') return Boolean(field.visible(values));
  if (!field.showIf || typeof field.showIf !== 'object') return !field.hidden;

  const current = values[field.showIf.field];
  if ('equals' in field.showIf) return current === field.showIf.equals;
  if ('notEquals' in field.showIf) return current !== field.showIf.notEquals;
  if (Array.isArray(field.showIf.oneOf)) return field.showIf.oneOf.includes(current);
  if (typeof field.showIf.test === 'function') return Boolean(field.showIf.test(current, values));
  return true;
}

function normalizeField(field, index) {
  const type = normalizeType(field);
  const name = field.name || field.id || field.model || `field-${index}`;
  return {
    ...field,
    name,
    id: field.id || name,
    type,
    label: field.label ?? name,
    options: field.options || [],
    columnSpan: field.columnSpan || field.span || 1,
    validators: validatorBag(field, type),
  };
}

function groupsFromFields(fields) {
  const order = [];
  const grouped = new Map();

  fields.forEach((field) => {
    const key = field.group || '__default';
    if (!grouped.has(key)) {
      grouped.set(key, []);
      order.push(key);
    }
    grouped.get(key).push(field.name);
  });

  if (order.length === 1 && order[0] === '__default') return [];

  return order.map((key) => ({
    id: key,
    label: key === '__default' ? '' : key,
    description: '',
    columns: undefined,
    fieldNames: grouped.get(key),
  }));
}

export function normalizeSchema(schema = {}) {
  const explicitGroups = Array.isArray(schema.groups) ? schema.groups : null;
  const fields = [];
  let groups = [];

  if (explicitGroups) {
    explicitGroups.forEach((group, groupIndex) => {
      const fieldNames = [];
      (group.fields || []).forEach((field) => {
        const normalized = normalizeField(
          { ...field, group: field.group || group.id || group.label },
          fields.length,
        );
        fields.push(normalized);
        fieldNames.push(normalized.name);
      });
      groups.push({
        id: group.id || group.label || `group-${groupIndex}`,
        label: group.label || group.title || '',
        description: group.description || '',
        columns: group.columns,
        fieldNames,
      });
    });
  } else {
    (schema.fields || []).forEach((field) => {
      fields.push(normalizeField(field, fields.length));
    });
    groups = groupsFromFields(fields);
  }

  const layout = schema.layout || (groups.length ? 'groups' : 'stack');

  return {
    id: schema.id,
    formId: schema.formId,
    title: schema.title || '',
    description: schema.description || '',
    layout,
    columns: schema.columns || 1,
    submitLabel: schema.submitLabel,
    button: schema.button,
    validateOn: schema.validateOn,
    locale: schema.locale,
    fields,
    groups,
  };
}

export function visibleFields(fields, values) {
  return fields.filter((field) => field.type !== 'button' && isVisible(field, values));
}
