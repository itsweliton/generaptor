import { digits, parseCurrency } from './masks';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function configOf(config) {
  if (config === true || config == null) return {};
  if (typeof config === 'number') return { value: config };
  if (typeof config === 'string') return { message: config };
  if (typeof config === 'function') return { validate: config };
  return config;
}

function textOf(config, fallback) {
  return typeof config.message === 'string' && config.message ? config.message : fallback;
}

export function isEmpty(value, field) {
  if (field.type === 'checkbox' || field.type === 'switch') return value !== true;
  if (field.type === 'file') {
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  }
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function lengthOf(field, value) {
  if (field.mask || ['phone', 'cep', 'cpf', 'ssn', 'postal'].includes(field.type)) {
    return digits(value).length;
  }
  return String(value ?? '').length;
}

function filesOf(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function fileAllowed(file, accept) {
  const rules = String(accept)
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

function formatBytes(size) {
  if (size >= 1_000_000) {
    const mb = size / 1_000_000;
    return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
  }
  if (size >= 1000) return `${Math.round(size / 1000)} KB`;
  return `${size} B`;
}

export function isValidCpf(value) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const check = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10]);
}

function validateFile(field, value) {
  const files = filesOf(value);
  if (!files.length) return '';
  if (field.accept && files.some((file) => !fileAllowed(file, field.accept))) {
    return field.acceptMessage || 'This file type is not accepted';
  }
  if (field.maxSize && files.some((file) => file.size > field.maxSize)) {
    return field.maxSizeMessage || `Each file must be under ${formatBytes(field.maxSize)}`;
  }
  return '';
}

function validateCustom(value, values, config) {
  const fn = config.validate || config.validator;
  if (typeof fn !== 'function') return '';
  const result = fn(value, values);
  if (result === true || result == null || result === '') return '';
  if (result === false) return textOf(config, 'Invalid value');
  return String(result);
}

const VALIDATORS = {
  required(value, config, field) {
    if (!isEmpty(value, field)) return '';
    return textOf(config, 'This field is required');
  },
  minLength(value, config, field) {
    if (isEmpty(value, field)) return '';
    const min = config.value;
    if (lengthOf(field, value) < min) {
      return textOf(config, `Use at least ${min} characters`);
    }
    return '';
  },
  maxLength(value, config, field) {
    if (isEmpty(value, field)) return '';
    const max = config.value;
    if (lengthOf(field, value) > max) {
      return textOf(config, `Use at most ${max} characters`);
    }
    return '';
  },
  min(value, config, field) {
    if (isEmpty(value, field)) return '';
    const numeric = field.type === 'currency' ? parseCurrency(value) : Number(value);
    if (Number.isNaN(numeric) || numeric < config.value) {
      return textOf(config, `Enter a value of at least ${config.value}`);
    }
    return '';
  },
  max(value, config, field) {
    if (isEmpty(value, field)) return '';
    const numeric = field.type === 'currency' ? parseCurrency(value) : Number(value);
    if (Number.isNaN(numeric) || numeric > config.value) {
      return textOf(config, `Enter a value of at most ${config.value}`);
    }
    return '';
  },
  email(value, config, field) {
    if (isEmpty(value, field)) return '';
    if (!EMAIL.test(String(value).trim())) return textOf(config, 'Enter a valid email');
    return '';
  },
  telephone(value, config, field) {
    if (isEmpty(value, field)) return '';
    const numbers = digits(value);
    const area = Number(numbers.slice(0, 2));
    const valid = (numbers.length === 10 || numbers.length === 11) && area >= 11 && area <= 99;
    if (!valid) return textOf(config, 'Enter a valid phone number');
    return '';
  },
  phone(value, config, field) {
    return VALIDATORS.telephone(value, config, field);
  },
  cpf(value, config, field) {
    if (isEmpty(value, field)) return '';
    if (!isValidCpf(value)) return textOf(config, 'Enter a valid CPF');
    return '';
  },
  cep(value, config, field) {
    if (isEmpty(value, field)) return '';
    if (digits(value).length !== 8) return textOf(config, 'Enter a valid CEP');
    return '';
  },
  ssn(value, config, field) {
    if (isEmpty(value, field)) return '';
    const number = digits(value);
    const area = number.slice(0, 3);
    const group = number.slice(3, 5);
    const serial = number.slice(5);
    const valid =
      number.length === 9 &&
      !/^(\d)\1+$/.test(number) &&
      area !== '000' &&
      area !== '666' &&
      !area.startsWith('9') &&
      group !== '00' &&
      serial !== '0000';
    if (!valid) return textOf(config, 'Enter a valid Social Security number');
    return '';
  },
  postal(value, config, field) {
    if (isEmpty(value, field)) return '';
    const length = digits(value).length;
    if (length !== 5 && length !== 9) return textOf(config, 'Enter a valid postal code');
    return '';
  },
  currency(value, config, field) {
    if (isEmpty(value, field)) return '';
    const amount = parseCurrency(value);
    if (amount == null || Number.isNaN(amount)) return textOf(config, 'Enter a valid amount');
    if (config.min != null && amount < config.min) {
      return textOf(config, `Enter at least ${config.min}`);
    }
    if (config.max != null && amount > config.max) {
      return textOf(config, `Enter at most ${config.max}`);
    }
    return '';
  },
  url(value, config, field) {
    if (isEmpty(value, field)) return '';
    let parsed = null;
    try {
      parsed = new URL(String(value).trim());
    } catch {
      parsed = null;
    }
    if (parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) return '';
    return textOf(config, 'Enter a valid URL');
  },
  pattern(value, config, field) {
    if (isEmpty(value, field)) return '';
    const source = config instanceof RegExp ? config : (config.value ?? config.pattern);
    if (!source) return '';
    let expression;
    try {
      expression = source instanceof RegExp ? source : new RegExp(String(source));
    } catch {
      return '';
    }
    if (!expression.test(String(value))) return textOf(config, 'Use the expected format');
    return '';
  },
  date(value, config, field) {
    if (isEmpty(value, field)) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return textOf(config, 'Enter a valid date');
    return '';
  },
  custom(value, config, _field, values) {
    if (Array.isArray(config)) {
      for (const item of config) {
        const error = validateCustom(value, values, configOf(item));
        if (error) return error;
      }
      return '';
    }
    return validateCustom(value, values, config);
  },
};

export function validateField(field, value, values = {}) {
  if (field.type === 'file') {
    const fileError = validateFile(field, value);
    if (fileError) return fileError;
  }

  const entries = Object.entries(field.validators || {});
  for (const [name, rawConfig] of entries) {
    if (rawConfig === false || rawConfig == null) continue;
    const validator = VALIDATORS[name];
    if (!validator) continue;
    const error = validator(value, configOf(rawConfig), field, values);
    if (error) return error;
  }
  return '';
}

export function validateFields(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    if (field.type === 'button') return;
    errors[field.name] = validateField(field, values[field.name], values);
  });
  return errors;
}

export { VALIDATORS };
