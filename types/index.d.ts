import type { ComponentType, CSSProperties, ReactElement, ReactNode, Ref } from 'react';
import type { Theme, ThemeOptions } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

export type FieldValue = string | number | boolean | Date | File | File[] | null;

export interface FieldOption {
  value: string | number | boolean;
  label: ReactNode;
  disabled?: boolean;
}

export interface ShowIf {
  field: string;
  equals?: unknown;
  notEquals?: unknown;
  oneOf?: unknown[];
  test?: (value: unknown, values: Values) => boolean;
}

export type Values = Record<string, FieldValue | unknown>;

export interface ValidatorConfig {
  value?: number;
  min?: number;
  max?: number;
  message?: string;
  validate?: (value: unknown, values: Values) => boolean | string | null | undefined;
}

export interface Field {
  id?: string;
  name?: string;
  type?: string;
  inputType?: string;
  label?: ReactNode;
  placeholder?: string;
  helperText?: ReactNode;
  legend?: ReactNode;
  initialValue?: unknown;
  defaultValue?: unknown;
  required?: boolean | ValidatorConfig;
  minLength?: number | ValidatorConfig;
  maxLength?: number | ValidatorConfig;
  min?: number;
  max?: number;
  step?: number | string;
  mask?:
    | 'phone'
    | 'cep'
    | 'cpf'
    | 'ssn'
    | 'postal'
    | 'currency'
    | (string & {})
    | ((value: string, field: Field) => string);
  unmask?: (value: unknown, field: Field) => unknown;
  locale?: string;
  currency?: string;
  format?: string;
  options?: FieldOption[];
  validators?: Record<string, boolean | number | ValidatorConfig | ValidatorConfig['validate']>;
  showIf?: ShowIf | ((values: Values) => boolean);
  visible?: (values: Values) => boolean;
  hidden?: boolean;
  group?: string;
  columnSpan?: number;
  span?: number;
  disabled?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  rows?: number;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  className?: string;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
  component?: ComponentType<CustomFieldProps> | string;
  onClick?: (values: Values, event: unknown) => void;
  submit?: boolean;
  [key: string]: unknown;
}

export interface FieldGroup {
  id?: string;
  label?: string;
  title?: string;
  description?: string;
  columns?: number;
  fields: Field[];
}

export interface Schema {
  id?: string;
  formId?: string;
  title?: string;
  description?: string;
  layout?: 'stack' | 'grid' | 'groups' | 'group' | 'tabs';
  columns?: number;
  submitLabel?: string;
  button?: { label?: string; fullWidth?: boolean; align?: 'left' | 'center' | 'right' };
  locale?: unknown;
  fields?: Field[];
  groups?: FieldGroup[];
}

export interface StyleConfig {
  mode?: 'light' | 'dark';
  primary?: string;
  secondary?: string;
  error?: string;
  background?: string;
  paper?: string;
  text?: string;
  muted?: string;
  border?: string;
  radius?: number;
  gap?: number | string;
  columns?: number;
  density?: 'comfortable' | 'compact';
  variant?: 'outlined' | 'filled' | 'standard';
  fontFamily?: string;
  field?: { variant?: string; size?: 'small' | 'medium'; fullWidth?: boolean; sx?: SxProps<Theme> };
  button?: { variant?: string; color?: string; fullWidth?: boolean; sx?: SxProps<Theme> };
  classNames?: ClassNames;
  cssVars?: CSSProperties;
  components?: Theme['components'];
  form?: CSSProperties;
  group?: CSSProperties;
}

export interface DefinedStyles {
  theme: Theme;
  tokens: Record<string, unknown>;
  styles: {
    density?: string;
    cssVars?: CSSProperties;
    layout?: { columns?: number; gap?: number | string };
    field?: {
      variant?: string;
      size?: 'small' | 'medium';
      fullWidth?: boolean;
      sx?: SxProps<Theme>;
    };
    button?: { variant?: string; color?: string; fullWidth?: boolean; sx?: SxProps<Theme> };
    form?: CSSProperties;
    group?: CSSProperties;
  };
  classNames: ClassNames;
}

export interface ClassNames {
  form?: string;
  field?: string;
  group?: string;
  header?: string;
  actions?: string;
  submit?: string;
}

export interface CustomFieldProps {
  field: Field;
  value: unknown;
  values: Values;
  error: string;
  helperText: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export interface SubmitMeta {
  raw: Values;
  errors: Record<string, string>;
  valid: boolean;
  event?: unknown;
}

export interface FormGeneratorProps {
  schema: Schema;
  options?: Partial<FormGeneratorProps>;
  button?:
    | false
    | {
        label?: string;
        variant?: string;
        color?: string;
        fullWidth?: boolean;
        align?: 'left' | 'center' | 'right';
        onClick?: (values: Values, event: unknown) => void;
        sx?: SxProps<Theme>;
      };
  onSubmit?: (values: Values, meta: SubmitMeta) => void;
  onChange?: (
    values: Values,
    meta: {
      name: string;
      value: unknown;
      errors: Record<string, string>;
      valid: boolean;
      raw: Values;
    },
  ) => void;
  onHandleChange?: FormGeneratorProps['onChange'];
  onClick?: (values: Values, event: unknown) => void;
  onInvalid?: (values: Values, errors: Record<string, string>, event: unknown) => void;
  verifyValidation?: (valid: boolean, errors: Record<string, string>, values: Values) => void;
  theme?: Theme | ThemeOptions | ((outer: Theme) => Theme);
  styles?: DefinedStyles['styles'];
  className?: string;
  classNames?: ClassNames;
  components?: Record<string, ComponentType<CustomFieldProps>>;
  validateOn?: 'blur' | 'change' | 'submit';
  style?: CSSProperties;
  id?: string;
  ref?: Ref<FormGeneratorHandle>;
}

export interface FormGeneratorHandle {
  getValues: () => Values;
  getRawValues: () => Values;
  getErrors: () => Record<string, string>;
  validate: () => boolean;
  verifyValidation: () => boolean;
  reset: () => void;
  setValues: (partial: Values) => void;
}

export const FormGenerator: (props: FormGeneratorProps) => ReactElement;
export function defineStyles(config?: StyleConfig): DefinedStyles;
export const stylePresets: Record<'paper' | 'night' | 'tide', DefinedStyles>;
export const presetConfigs: Record<'paper' | 'night' | 'tide', StyleConfig>;
export function createForm(schema: Schema, options?: Partial<FormGeneratorProps>): ReactElement;

export default function Generaptor(): { create: typeof createForm };
