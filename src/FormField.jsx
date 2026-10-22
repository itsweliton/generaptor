import { createElement } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { isRequired } from './schema';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

const TEXT_TYPES = new Set([
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'textarea',
  'phone',
  'cep',
  'cpf',
  'currency',
]);

function htmlType(type) {
  if (
    type === 'textarea' ||
    type === 'phone' ||
    type === 'cep' ||
    type === 'cpf' ||
    type === 'currency'
  ) {
    return 'text';
  }
  return type;
}

function inputMode(type) {
  if (type === 'phone' || type === 'cep' || type === 'cpf') return 'numeric';
  if (type === 'currency' || type === 'number') return 'decimal';
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  return undefined;
}

function shared(field, appearance, classNames) {
  return {
    variant: field.variant || appearance.field?.variant || 'outlined',
    size: field.size || appearance.field?.size || 'medium',
    fullWidth: field.fullWidth ?? appearance.field?.fullWidth !== false,
    className: cx('generaptor-field', classNames.field, field.className),
    sx: [appearance.field?.sx, field.sx],
  };
}

function helper(error, field) {
  return error || field.helperText || undefined;
}

function TextInput({ field, value, error, onChange, onBlur, appearance, classNames }) {
  const look = shared(field, appearance, classNames);
  const maxLength =
    !field.mask && typeof field.validators?.maxLength === 'number'
      ? field.validators.maxLength
      : field.validators?.maxLength?.value;

  return (
    <TextField
      {...field.componentProps}
      id={field.id}
      name={field.name}
      label={field.label}
      placeholder={field.placeholder}
      type={htmlType(field.type)}
      value={value ?? ''}
      onChange={(event) => onChange(field.name, event.target.value)}
      onBlur={() => onBlur(field.name)}
      error={Boolean(error)}
      helperText={helper(error, field)}
      required={isRequired(field)}
      disabled={field.disabled}
      multiline={field.type === 'textarea'}
      rows={field.type === 'textarea' ? field.rows || 4 : undefined}
      variant={look.variant}
      size={look.size}
      fullWidth={look.fullWidth}
      className={look.className}
      sx={look.sx}
      slotProps={{
        htmlInput: {
          min: field.type === 'number' ? field.min : undefined,
          max: field.type === 'number' ? field.max : undefined,
          step: field.step,
          autoComplete: field.autoComplete,
          inputMode: inputMode(field.type),
          maxLength: field.mask ? undefined : maxLength,
          readOnly: field.readOnly,
          'aria-invalid': error ? true : undefined,
          ...field.inputProps,
        },
        ...field.slotProps,
      }}
    />
  );
}

function Choice({ field, checked, error, onChange, onBlur, appearance, classNames, control }) {
  const look = shared(field, appearance, classNames);
  return (
    <FormControl
      className={cx(look.className, 'generaptor-choice')}
      error={Boolean(error)}
      disabled={field.disabled}
      required={isRequired(field)}
      sx={look.sx}
    >
      <FormControlLabel
        label={field.label}
        labelPlacement={field.labelPlacement || 'end'}
        control={control({
          name: field.name,
          checked,
          color: field.color || 'primary',
          disabled: field.disabled,
          onChange: (event) => onChange(field.name, event.target.checked),
          onBlur: () => onBlur(field.name),
          inputProps: { 'aria-invalid': error ? true : undefined },
        })}
      />
      {helper(error, field) ? <FormHelperText>{helper(error, field)}</FormHelperText> : null}
    </FormControl>
  );
}

function SelectInput({ field, value, error, onChange, onBlur, appearance, classNames }) {
  const look = shared(field, appearance, classNames);
  const labelId = `${field.id}-label`;
  const current = value ?? '';

  return (
    <FormControl
      className={look.className}
      error={Boolean(error)}
      disabled={field.disabled}
      required={isRequired(field)}
      variant={look.variant}
      size={look.size}
      fullWidth={look.fullWidth}
      sx={look.sx}
    >
      <InputLabel id={labelId}>{field.label}</InputLabel>
      <Select
        labelId={labelId}
        id={field.id}
        name={field.name}
        label={field.label}
        value={current}
        onChange={(event) => {
          const next = event.target.value;
          const match = field.options.find((option) => String(option.value) === String(next));
          onChange(field.name, match ? match.value : next);
        }}
        onBlur={() => onBlur(field.name)}
      >
        <MenuItem value="">
          <em>{field.placeholder || 'Select'}</em>
        </MenuItem>
        {field.options.map((option) => (
          <MenuItem
            value={option.value}
            key={`${field.id}-${option.value}`}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helper(error, field) ? <FormHelperText>{helper(error, field)}</FormHelperText> : null}
    </FormControl>
  );
}

function RadioInput({ field, value, error, onChange, onBlur, appearance, classNames }) {
  const look = shared(field, appearance, classNames);
  return (
    <FormControl
      className={cx(look.className, 'generaptor-choice')}
      component="fieldset"
      error={Boolean(error)}
      disabled={field.disabled}
      required={isRequired(field)}
      sx={look.sx}
    >
      <FormLabel component="legend">{field.legend || field.label}</FormLabel>
      <RadioGroup
        name={field.name}
        value={value == null ? '' : String(value)}
        onChange={(event) => {
          const next = event.target.value;
          const match = field.options.find((option) => String(option.value) === next);
          onChange(field.name, match ? match.value : next);
        }}
        onBlur={() => onBlur(field.name)}
      >
        {field.options.map((option) => (
          <FormControlLabel
            key={`${field.id}-${option.value}`}
            value={String(option.value)}
            label={option.label}
            disabled={option.disabled || field.disabled}
            control={<Radio color={field.color || 'primary'} />}
          />
        ))}
      </RadioGroup>
      {helper(error, field) ? <FormHelperText>{helper(error, field)}</FormHelperText> : null}
    </FormControl>
  );
}

function pickerValue(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function DateInput({ field, value, error, onChange, onBlur, appearance, classNames }) {
  const look = shared(field, appearance, classNames);
  const Picker =
    field.type === 'time' ? TimePicker : field.type === 'datetime' ? DateTimePicker : DatePicker;
  const format =
    field.format ||
    (field.type === 'time'
      ? 'HH:mm'
      : field.type === 'datetime'
        ? 'dd/MM/yyyy HH:mm'
        : 'dd/MM/yyyy');

  return (
    <Picker
      label={field.label}
      value={pickerValue(value)}
      format={format}
      disabled={field.disabled}
      onChange={(next) => onChange(field.name, next)}
      slotProps={{
        textField: {
          id: field.id,
          name: field.name,
          required: isRequired(field),
          error: Boolean(error),
          helperText: helper(error, field),
          variant: look.variant,
          size: look.size,
          fullWidth: look.fullWidth,
          className: look.className,
          sx: look.sx,
          onBlur: () => onBlur(field.name),
        },
        ...field.slotProps,
      }}
    />
  );
}

function FileInput({ field, value, error, onChange, onBlur, appearance, classNames }) {
  const look = shared(field, appearance, classNames);
  const files = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className={cx('generaptor-file', look.className)} style={field.style}>
      <span className="generaptor-file-label" id={`${field.id}-label`}>
        {field.label}
        {isRequired(field) ? ' *' : ''}
      </span>
      <Button
        component="label"
        variant={field.variant || 'outlined'}
        size={look.size}
        disabled={field.disabled}
        htmlFor={field.id}
      >
        {field.buttonLabel || (field.multiple ? 'Choose files' : 'Choose file')}
        <input
          id={field.id}
          name={field.name}
          hidden
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          onBlur={() => onBlur(field.name)}
          onChange={(event) => {
            const selected = Array.from(event.target.files || []);
            onChange(field.name, field.multiple ? selected : selected[0] || null);
            event.target.value = '';
          }}
        />
      </Button>
      {files.length ? (
        <ul className="generaptor-file-list">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      ) : (
        <p className="generaptor-file-name">No file selected</p>
      )}
      {helper(error, field) ? (
        <span className={error ? 'generaptor-error' : 'generaptor-help'}>
          {helper(error, field)}
        </span>
      ) : null}
    </div>
  );
}

function ButtonField({ field, values, appearance, classNames }) {
  const button = appearance.button || {};
  return (
    <Button
      type={field.submit ? 'submit' : 'button'}
      variant={field.variant || (field.submit ? button.variant : 'text') || 'text'}
      color={field.color || button.color || 'primary'}
      size={field.size || appearance.field?.size}
      disabled={field.disabled}
      className={cx('generaptor-field', classNames.field, field.className)}
      sx={[button.sx, field.sx]}
      onClick={
        field.submit
          ? undefined
          : (event) => {
              field.onClick?.(values, event);
            }
      }
    >
      {field.label}
    </Button>
  );
}

export default function FormField({
  field,
  value,
  values,
  error,
  onChange,
  onBlur,
  appearance = {},
  classNames = {},
  components,
}) {
  const provided =
    typeof field.component === 'function'
      ? field.component
      : (typeof field.component === 'string' && components?.[field.component]) ||
        (field.type === 'custom' && components?.[field.name]) ||
        components?.[field.type] ||
        null;

  if (provided) {
    return createElement(provided, {
      field,
      value,
      values,
      error: error || '',
      helperText: helper(error, field) || '',
      disabled: field.disabled,
      onBlur: () => onBlur(field.name),
      onChange: (next) => {
        if (next && next.target) {
          const target = next.target;
          onChange(field.name, target.type === 'checkbox' ? target.checked : target.value);
          return;
        }
        onChange(field.name, next);
      },
    });
  }

  const props = { field, value, error, onChange, onBlur, appearance, classNames, values };

  if (TEXT_TYPES.has(field.type)) return <TextInput {...props} />;
  if (field.type === 'checkbox') {
    return (
      <Choice
        {...props}
        checked={Boolean(value)}
        control={(control) => <Checkbox {...control} />}
      />
    );
  }
  if (field.type === 'switch') {
    return (
      <Choice {...props} checked={Boolean(value)} control={(control) => <Switch {...control} />} />
    );
  }
  if (field.type === 'select') return <SelectInput {...props} />;
  if (field.type === 'radio') return <RadioInput {...props} />;
  if (field.type === 'date' || field.type === 'time' || field.type === 'datetime') {
    return <DateInput {...props} />;
  }
  if (field.type === 'file') return <FileInput {...props} />;
  if (field.type === 'button') return <ButtonField {...props} />;

  return <TextInput {...props} field={{ ...field, type: 'text' }} />;
}
