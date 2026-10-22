import React from 'react';
import FormGenerator from './FormGenerator';

export { default as FormGenerator } from './FormGenerator';
export { defineStyles, stylePresets, presetConfigs } from './styles';
export { applyMask, unmaskValue, formatPhone, formatCep, formatCpf, formatCurrency } from './masks';
export { validateField, isValidCpf } from './validators';
export { normalizeSchema, isVisible } from './schema';

export function createForm(schema, options = {}) {
  return React.createElement(FormGenerator, { schema, ...options });
}

export default function Generaptor() {
  return { create: createForm };
}
