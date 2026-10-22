const NAMED_MASKS = new Set(['phone', 'cep', 'cpf', 'ssn', 'postal', 'currency']);

export function digits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function formatPhone(value) {
  const numbers = digits(value).slice(0, 11);
  if (!numbers) return '';
  if (numbers.length < 3) return `(${numbers}`;
  const area = numbers.slice(0, 2);
  const rest = numbers.slice(2);
  if (numbers.length < 7) return `(${area}) ${rest}`;
  if (numbers.length < 11) return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function formatCep(value) {
  const numbers = digits(value).slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

export function formatSsn(value) {
  const numbers = digits(value).slice(0, 9);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
}

export function formatPostal(value) {
  const numbers = digits(value).slice(0, 9);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

export function formatCpf(value) {
  const numbers = digits(value).slice(0, 11);
  const parts = [
    numbers.slice(0, 3),
    numbers.slice(3, 6),
    numbers.slice(6, 9),
    numbers.slice(9, 11),
  ];
  let formatted = parts[0];
  if (parts[1]) formatted += `.${parts[1]}`;
  if (parts[2]) formatted += `.${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;
  return formatted;
}

export function formatCurrency(value, field = {}) {
  const numbers = digits(value);
  if (!numbers) return '';
  const amount = Number(numbers) / 100;
  return new Intl.NumberFormat(field.locale || 'pt-BR', {
    style: 'currency',
    currency: field.currency || 'BRL',
  }).format(amount);
}

export function parseCurrency(value) {
  const numbers = digits(value);
  if (!numbers) return null;
  return Number(numbers) / 100;
}

export function applyPattern(pattern, value) {
  const raw = String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  let index = 0;
  let formatted = '';

  for (let cursor = 0; cursor < pattern.length; cursor += 1) {
    const token = pattern[cursor];
    if (token !== '#' && token !== 'A') {
      if (index >= raw.length) break;
      formatted += token;
      continue;
    }
    if (index >= raw.length) break;
    const char = raw[index];
    const matches = token === '#' ? /\d/.test(char) : /[A-Z]/.test(char);
    if (!matches) {
      index += 1;
      cursor -= 1;
      continue;
    }
    formatted += char;
    index += 1;
  }

  return formatted;
}

const FORMATTERS = {
  phone: formatPhone,
  cep: formatCep,
  cpf: formatCpf,
  ssn: formatSsn,
  postal: formatPostal,
  currency: formatCurrency,
};

export function maskName(field) {
  if (
    typeof field.mask === 'string' &&
    (FORMATTERS[field.mask] || field.mask.includes('#') || field.mask.includes('A'))
  ) {
    return field.mask;
  }
  if (typeof field.mask === 'function') return field.mask;
  if (FORMATTERS[field.type]) return field.type;
  return null;
}

export function applyMask(field, value) {
  const mask = maskName(field);
  if (!mask || value == null) return value ?? '';
  if (typeof mask === 'function') return mask(value, field);
  if (FORMATTERS[mask]) return FORMATTERS[mask](value, field);
  return applyPattern(mask, value);
}

export function unmaskValue(field, value) {
  if (typeof field.unmask === 'function') return field.unmask(value, field);
  const mask = maskName(field);
  if (!mask || typeof mask === 'function') return value;
  if (mask === 'currency' || field.type === 'currency') return parseCurrency(value);
  if (FORMATTERS[mask]) return digits(value);
  if (typeof mask === 'string' && (mask.includes('#') || mask.includes('A'))) {
    return String(value ?? '').replace(/[^a-z0-9]/gi, '');
  }
  return value;
}

export function isMasked(field) {
  return Boolean(maskName(field));
}

export { NAMED_MASKS };
