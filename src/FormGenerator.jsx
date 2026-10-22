import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FormField from './FormField';
import { applyMask, unmaskValue } from './masks';
import { defaultValue, isVisible, normalizeSchema, visibleFields } from './schema';
import { isMuiTheme } from './styles';
import { validateField } from './validators';
import './generaptor.css';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function buildValues(fields) {
  const values = {};
  fields.forEach((field) => {
    if (field.type === 'button') return;
    values[field.name] = defaultValue(field);
  });
  return values;
}

function isFormValid(fields, values) {
  return visibleFields(fields, values).every(
    (field) => !validateField(field, values[field.name], values),
  );
}

function payloadFor(fields, values) {
  const visible = {};
  const raw = {};
  visibleFields(fields, values).forEach((field) => {
    visible[field.name] = values[field.name];
    raw[field.name] = unmaskValue(field, values[field.name]);
  });
  return { values: visible, raw };
}

function spanStyle(field, columns) {
  const span = Math.min(Number(field.columnSpan) || 1, columns);
  if (span <= 1) return undefined;
  return { gridColumn: `span ${span}` };
}

function FieldGrid({
  fields,
  columns,
  values,
  errors,
  onChange,
  onBlur,
  appearance,
  classNames,
  components,
}) {
  return (
    <div className="generaptor-grid" style={{ '--gr-columns': columns }}>
      {fields
        .filter((field) => isVisible(field, values))
        .map((field) => (
          <div
            key={field.id}
            className="generaptor-item"
            data-field={field.name}
            data-type={field.type}
            style={spanStyle(field, columns)}
          >
            <FormField
              field={field}
              value={values[field.name]}
              values={values}
              error={errors[field.name]}
              onChange={onChange}
              onBlur={onBlur}
              appearance={appearance}
              classNames={classNames}
              components={components}
            />
          </div>
        ))}
    </div>
  );
}

function GroupList({ groups, fields, columns, ...rest }) {
  const byName = new Map(fields.map((field) => [field.name, field]));
  return groups.map((group) => {
    const groupFields = group.fieldNames.map((name) => byName.get(name)).filter(Boolean);
    const visible = groupFields.filter((field) => isVisible(field, rest.values));
    if (!visible.length) return null;
    return (
      <section key={group.id} className={cx('generaptor-group', rest.classNames.group)}>
        {group.label || group.description ? (
          <div className="generaptor-group-head">
            {group.label ? <h3>{group.label}</h3> : null}
            {group.description ? <p>{group.description}</p> : null}
          </div>
        ) : null}
        <FieldGrid {...rest} fields={groupFields} columns={group.columns || columns} />
      </section>
    );
  });
}

export const FormGenerator = forwardRef(function FormGenerator(props, ref) {
  const options = props.options || {};
  const schemaProp = props.schema;
  const button = props.button === undefined ? options.button : props.button;
  const onSubmit = props.onSubmit || options.onSubmit;
  const onChange = props.onChange || options.onChange || options.onHandleChange;
  const onHandleChange = props.onHandleChange || options.onHandleChange;
  const onClick = props.onClick || options.onClick || button?.onClick;
  const onInvalid = props.onInvalid || options.onInvalid;
  const verifyValidation = props.verifyValidation || options.verifyValidation;
  const validateOn = props.validateOn || options.validateOn || 'blur';
  const themeProp = props.theme === undefined ? options.theme : props.theme;
  const styles = props.styles || options.styles;
  const className = props.className || options.className;
  const classNamesProp = props.classNames || options.classNames;
  const components = props.components || options.components;
  const style = props.style || options.style;
  const id = props.id || options.id;

  const normalized = useMemo(() => normalizeSchema(schemaProp), [schemaProp]);
  const initialValues = useMemo(() => buildValues(normalized.fields), [normalized]);
  const structureKey = normalized.fields.map((field) => `${field.name}:${field.type}`).join('|');
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState(0);
  const formRef = useRef(null);
  const valuesRef = useRef(initialValues);
  const errorsRef = useRef({});
  const touchedRef = useRef({});
  const submittedRef = useRef(false);
  const skipSchemaReset = useRef(true);
  const seenStructure = useRef(structureKey);

  useEffect(() => {
    if (skipSchemaReset.current) {
      skipSchemaReset.current = false;
      seenStructure.current = structureKey;
      return;
    }
    if (seenStructure.current === structureKey) return;
    seenStructure.current = structureKey;
    const previous = valuesRef.current;
    const nextValues = buildValues(normalized.fields);
    normalized.fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(previous, field.name)) {
        nextValues[field.name] = previous[field.name];
      }
    });
    valuesRef.current = nextValues;
    errorsRef.current = {};
    touchedRef.current = {};
    submittedRef.current = false;
    setValues(nextValues);
    setErrors({});
    setTab(0);
  }, [structureKey, normalized]);

  const appearance = styles || {};
  const classNames = { ...classNamesProp, ...appearance.classNames };
  const columns = appearance.layout?.columns || normalized.columns || 1;
  const needsDates = normalized.fields.some((field) =>
    ['date', 'time', 'datetime'].includes(field.type),
  );

  const report = (nextValues, nextErrors) => {
    const valid = isFormValid(normalized.fields, nextValues);
    const payload = payloadFor(normalized.fields, nextValues);
    verifyValidation?.(valid, nextErrors, nextValues);
    return { valid, ...payload };
  };

  const validateAll = (nextValues) => {
    const nextErrors = {};
    normalized.fields.forEach((field) => {
      if (field.type === 'button') return;
      nextErrors[field.name] = isVisible(field, nextValues)
        ? validateField(field, nextValues[field.name], nextValues)
        : '';
    });
    return nextErrors;
  };

  const focusFirstInvalid = (nextErrors, nextValues) => {
    const field = visibleFields(normalized.fields, nextValues).find(
      (item) => nextErrors[item.name],
    );
    if (!field) return;
    if (normalized.layout === 'tabs') {
      const groupIndex = normalized.groups.findIndex((group) =>
        group.fieldNames.includes(field.name),
      );
      if (groupIndex >= 0) setTab(groupIndex);
    }
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector(`#${CSS.escape(field.id)}`)?.focus();
    });
  };

  const commit = (name, rawValue) => {
    const field = normalized.fields.find((item) => item.name === name);
    const value = field ? applyMask(field, rawValue) : rawValue;
    const nextValues = { ...valuesRef.current, [name]: value };
    valuesRef.current = nextValues;
    setValues(nextValues);

    const shouldValidate =
      validateOn === 'change' || submittedRef.current || touchedRef.current[name];
    const nextErrors = { ...errorsRef.current };
    let validated = false;
    normalized.fields.forEach((item) => {
      if (item.type === 'button') return;
      const active =
        item.name === name ? shouldValidate : submittedRef.current || touchedRef.current[item.name];
      if (!active) return;
      validated = true;
      nextErrors[item.name] = isVisible(item, nextValues)
        ? validateField(item, nextValues[item.name], nextValues)
        : '';
    });
    if (validated) {
      errorsRef.current = nextErrors;
      setErrors(nextErrors);
      report(nextValues, nextErrors);
    }

    const meta = {
      name,
      value,
      errors: nextErrors,
      valid: isFormValid(normalized.fields, nextValues),
      raw: payloadFor(normalized.fields, nextValues).raw,
    };
    onChange?.(nextValues, meta);
    onHandleChange?.(nextValues, meta);
  };

  const blur = (name) => {
    const field = normalized.fields.find((item) => item.name === name);
    touchedRef.current = { ...touchedRef.current, [name]: true };
    if (!field || validateOn === 'submit') return;
    const nextErrors = {
      ...errorsRef.current,
      [name]: isVisible(field, valuesRef.current)
        ? validateField(field, valuesRef.current[name], valuesRef.current)
        : '',
    };
    errorsRef.current = nextErrors;
    setErrors(nextErrors);
    report(valuesRef.current, nextErrors);
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateAll(valuesRef.current);
    errorsRef.current = nextErrors;
    setErrors(nextErrors);
    submittedRef.current = true;
    const result = report(valuesRef.current, nextErrors);
    if (!result.valid) {
      focusFirstInvalid(nextErrors, valuesRef.current);
      onInvalid?.(result.values, nextErrors, event);
      return;
    }
    onSubmit?.(result.values, { raw: result.raw, errors: nextErrors, valid: true, event });
    onClick?.(result.values, event);
  };

  const reset = () => {
    const nextValues = buildValues(normalized.fields);
    valuesRef.current = nextValues;
    errorsRef.current = {};
    touchedRef.current = {};
    submittedRef.current = false;
    setValues(nextValues);
    setErrors({});
    setTab(0);
  };

  useImperativeHandle(ref, () => ({
    getValues: () => valuesRef.current,
    getRawValues: () => payloadFor(normalized.fields, valuesRef.current).raw,
    getErrors: () => errorsRef.current,
    validate: () => {
      const nextErrors = validateAll(valuesRef.current);
      errorsRef.current = nextErrors;
      submittedRef.current = true;
      setErrors(nextErrors);
      return report(valuesRef.current, nextErrors).valid;
    },
    verifyValidation: () => {
      const nextErrors = validateAll(valuesRef.current);
      return report(valuesRef.current, nextErrors).valid;
    },
    reset,
    setValues: (partial) => {
      const nextValues = { ...valuesRef.current, ...partial };
      valuesRef.current = nextValues;
      setValues(nextValues);
    },
  }));

  const schemaButton =
    normalized.button && typeof normalized.button === 'object' ? normalized.button : {};
  const showButton =
    button !== false && (button || onSubmit || normalized.submitLabel || schemaButton.label);
  const buttonConfig = button && typeof button === 'object' ? button : {};
  const buttonLook = appearance.button || {};
  const submitAlign = ['left', 'center', 'right'].includes(buttonConfig.align || schemaButton.align)
    ? buttonConfig.align || schemaButton.align
    : 'left';
  const submitWide = Boolean(
    buttonConfig.fullWidth ?? schemaButton.fullWidth ?? buttonLook.fullWidth,
  );

  const gridProps = {
    values,
    errors,
    onChange: commit,
    onBlur: blur,
    appearance,
    classNames,
    components,
  };

  let body;
  if (normalized.layout === 'tabs' && normalized.groups.length) {
    const activeIndex = Math.min(tab, normalized.groups.length - 1);
    const active = normalized.groups[activeIndex];
    const byName = new Map(normalized.fields.map((field) => [field.name, field]));
    const activeFields = active.fieldNames.map((name) => byName.get(name)).filter(Boolean);
    body = (
      <>
        <Tabs
          className="generaptor-tabs"
          value={activeIndex}
          onChange={(_event, next) => setTab(next)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {normalized.groups.map((group) => {
            const invalid = group.fieldNames.some((name) => errors[name]);
            return (
              <Tab
                key={group.id}
                label={group.label || group.id}
                id={`${group.id}-tab`}
                sx={invalid ? { color: 'error.main' } : undefined}
              />
            );
          })}
        </Tabs>
        <div role="tabpanel" aria-labelledby={`${active.id}-tab`}>
          {active.description ? <p className="generaptor-help">{active.description}</p> : null}
          <FieldGrid fields={activeFields} columns={active.columns || columns} {...gridProps} />
        </div>
      </>
    );
  } else if (
    (normalized.layout === 'groups' || normalized.layout === 'group') &&
    normalized.groups.length
  ) {
    body = (
      <GroupList
        groups={normalized.groups}
        fields={normalized.fields}
        columns={columns}
        {...gridProps}
      />
    );
  } else {
    body = <FieldGrid fields={normalized.fields} columns={columns} {...gridProps} />;
  }

  const form = (
    <form
      ref={formRef}
      id={id || normalized.id}
      className={cx('generaptor', className, classNames.form)}
      style={{ ...appearance.cssVars, ...appearance.form, ...style }}
      data-layout={normalized.layout}
      data-density={appearance.density}
      data-variant={appearance.field?.variant}
      onSubmit={submit}
      noValidate
    >
      {normalized.title || normalized.description ? (
        <header className={cx('generaptor-header', classNames.header)}>
          {normalized.title ? <h2>{normalized.title}</h2> : null}
          {normalized.description ? <p>{normalized.description}</p> : null}
        </header>
      ) : null}
      {body}
      {showButton ? (
        <div
          className={cx('generaptor-actions', classNames.actions)}
          data-align={submitAlign}
          data-wide={submitWide ? 'true' : 'false'}
        >
          <Button
            type="submit"
            variant={buttonConfig.variant || buttonLook.variant || 'contained'}
            color={buttonConfig.color || buttonLook.color || 'primary'}
            size={buttonConfig.size || appearance.field?.size || 'medium'}
            fullWidth={submitWide}
            disableElevation={buttonConfig.disableElevation ?? buttonLook.disableElevation}
            className={cx(classNames.submit)}
            sx={[buttonLook.sx, buttonConfig.sx]}
          >
            {buttonConfig.label || schemaButton.label || normalized.submitLabel || 'Submit'}
          </Button>
        </div>
      ) : null}
    </form>
  );

  const themed = themeProp ? (
    <ThemeProvider
      theme={isMuiTheme(themeProp) ? themeProp : (outer) => createTheme(outer, themeProp)}
    >
      {form}
    </ThemeProvider>
  ) : (
    form
  );

  if (!needsDates) return themed;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={normalized.locale}>
      {themed}
    </LocalizationProvider>
  );
});

export default FormGenerator;
