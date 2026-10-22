[![npm](https://img.shields.io/npm/v/generaptor.svg?maxAge=2592000)](https://www.npmjs.com/package/generaptor)
[![downloads](https://img.shields.io/npm/dt/generaptor.svg?maxAge=2592000)](https://www.npmjs.com/package/generaptor)

Generaptor builds a React form from a schema. It covers the usual fields, Brazilian masks, validation, groups, tabs, conditional fields, uploads, and custom components. Styles are a separate object, so the same schema can wear more than one look.

The examples page is the fastest way to see it. It includes a form builder: a blank page of blocks on the left, and the schema those blocks export on the right.

```bash
npm install
npm run dev
```

## Install

```bash
npm install generaptor react react-dom @mui/material @emotion/react @emotion/styled @mui/x-date-pickers date-fns
```

```jsx
import { FormGenerator, defineStyles } from 'generaptor';
import 'generaptor/style.css';

const look = defineStyles({
  primary: '#1f4d3a',
  secondary: '#c4552a',
  radius: 14,
  variant: 'outlined',
  density: 'comfortable',
});

export function Join() {
  return (
    <FormGenerator
      schema={schema}
      {...look}
      className="join-form"
      button={{ label: 'Create account' }}
      onSubmit={(values, { raw }) => {
        console.log(values, raw);
      }}
    />
  );
}
```

`values` are what the inputs show. `raw` is the unmasked payload: digits for phone, Social Security number, and postal code, and a number for currency.

The older factory still works:

```js
import Generaptor from 'generaptor';

const form = new Generaptor().create(schema, {
  button: { label: 'Save' },
  onSubmit: (values) => console.log(values),
});
```

## Schema

```js
const schema = {
  layout: 'stack', // stack | groups | tabs
  columns: 2,
  fields: [
    { name: 'name', label: 'Name', required: true, placeholder: 'Ada' },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'password', type: 'password', label: 'Password', minLength: 8 },
    { name: 'seats', type: 'number', label: 'Seats', min: 1, max: 10 },
    { name: 'about', type: 'textarea', label: 'About', columnSpan: 2 },
    {
      name: 'plan',
      type: 'select',
      label: 'Plan',
      options: [
        { value: 'studio', label: 'Studio' },
        { value: 'house', label: 'House' },
      ],
    },
    {
      name: 'contact',
      type: 'radio',
      label: 'Contact',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone', disabled: true },
      ],
    },
    { name: 'updates', type: 'checkbox', label: 'Send notes' },
    { name: 'alerts', type: 'switch', label: 'Alerts' },
    { name: 'start', type: 'date', label: 'Start', format: 'dd/MM/yyyy' },
    { name: 'hour', type: 'time', label: 'Time', format: 'HH:mm' },
    {
      name: 'cover',
      type: 'file',
      label: 'Cover',
      accept: 'image/*',
      maxSize: 2_000_000,
    },
  ],
};
```

Older field names still resolve: `type: 'input'` with `inputType`, `type: 'hour'`, and `type: 'upload'`.

A field accepts `helperText`, `placeholder`, `disabled`, `readOnly`, `autoComplete`, `sx`, `className`, `variant`, and `size`.

## Validation

Validators run on blur, then again as the field changes. Submit validates everything and cancels the submit when something is wrong.

```js
{
  name: 'email',
  type: 'email',
  label: 'Email',
  required: 'Email is required',
  validators: {
    custom: (value) => value.endsWith('@studio.dev') || 'Use your studio email',
  },
}
```

Built in: `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `telephone`, `ssn`, `postal`, `currency`, `date`, and `custom`.

`type: 'email' | 'phone' | 'ssn' | 'postal' | 'currency' | 'date'` turns the matching check on for you. Pass `validators: { ssn: false }` to opt out. A string or `{ message }` replaces the default error. `minLength` and `maxLength` accept a number or `{ value, message }`. `verifyValidation(valid, errors, values)` runs after each check. A ref can call `validate()`, `getValues()`, `getRawValues()`, and `reset()`.

```jsx
<FormGenerator
  ref={formRef}
  validateOn="blur" // blur | change | submit
  onChange={(values, meta) => meta.valid}
  onSubmit={(values, meta) => meta.raw}
  onInvalid={(values, errors) => errors}
  verifyValidation={(valid, errors) => valid}
/>
```

`onHandleChange` is the same callback as `onChange`. `onClick` and `button.onClick` run after a valid submit.

## Masks

| Mask     | Type              | What you see      | `raw` on submit                   |
| -------- | ----------------- | ----------------- | --------------------------------- |
| Phone    | `phone`           | `(11) 98765-4321` | digits                            |
| Social Security number | `ssn`    | `123-45-6789`     | 9 digits                          |
| Postal code            | `postal` | `94107` or `94107-1234` | 5 or 9 digits               |
| CEP (legacy)           | `cep`    | `01310-100`       | 8 digits                          |
| CPF (legacy)           | `cpf`    | `529.982.247-25`  | 11 digits                         |
| Currency | `currency`        | `R$ 10,00`        | number, last two digits are cents |
| Pattern  | `mask: 'AA-####'` | `AB-1234`         | letters and digits                |

`#` is a digit and `A` is a letter. Currency uses `locale` and `currency` (`pt-BR` / `BRL` by default). You can also pass `mask` as a function.

## Layout

Groups and tabs use the same `groups` list. `columns` on the schema or a group sets the grid. `columnSpan` lets one field cross columns. `layout: 'tabs'` keeps the groups in tabs and moves to the first invalid tab on submit.

```js
const schema = {
  layout: 'groups',
  groups: [
    {
      id: 'patient',
      label: 'Patient',
      description: 'Who is coming in.',
      columns: 2,
      fields: [
        { name: 'name', label: 'Name', required: true, columnSpan: 2 },
        { name: 'email', type: 'email', label: 'Email' },
      ],
    },
  ],
};
```

Flat fields can set `group: 'Patient'` instead of a `groups` array.

## Conditional fields

```js
{ name: 'ticket', label: 'Ticket', showIf: { field: 'request', equals: 'change' } }
{ name: 'region', label: 'Region', showIf: { field: 'hosting', equals: true } }
{ name: 'launch', type: 'date', label: 'Launch', showIf: (values) => values.request === 'new' }
```

`oneOf` and `notEquals` work the same way. Hidden fields stay out of validation and out of the submit payload.

## Custom components

```jsx
function RatingField({ field, value, onChange, error }) {
  return (
    <fieldset>
      <legend>{field.label}</legend>
      {[1, 2, 3, 4, 5].map((step) => (
        <button type="button" key={step} onClick={() => onChange(step)}>
          {step}
        </button>
      ))}
      {error ? <p>{error}</p> : null}
    </fieldset>
  );
}

<FormGenerator
  components={{ rating: RatingField }}
  schema={{
    fields: [
      { name: 'score', type: 'custom', component: 'rating', label: 'Score', required: true },
    ],
  }}
/>;
```

A component in `components` whose key matches a built-in `type` replaces that control everywhere.

## Styles

`defineStyles` returns a Material theme plus the `styles` and `classNames` props Generaptor understands. Spread it onto the form.

```js
defineStyles({
  mode: 'light', // or dark
  primary: '#1f4d3a',
  secondary: '#c4552a',
  background: '#fbf7f2',
  paper: '#fbf7f2',
  text: '#1d1914',
  muted: '#6f675e',
  error: '#9b2335',
  radius: 14,
  gap: 18,
  columns: 2,
  density: 'comfortable', // or compact
  variant: 'outlined', // outlined | filled | standard
  fontFamily: '"Outfit", sans-serif',
  field: { size: 'medium', sx: { maxWidth: 480 } },
  button: { variant: 'contained', fullWidth: false },
  classNames: { form: 'join-form', field: 'join-field' },
  components: {
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#fff' } },
    },
  },
});
```

Presets you can start from: `stylePresets.paper`, `stylePresets.night`, `stylePresets.tide`.

You can also pass a Material `theme` yourself. Per-field `sx`, `className`, `variant`, and `size` win over the shared field style.

These CSS variables are set on the form, so your own components and the group chrome follow the same tokens:

```css
.my-form {
  --gr-primary: #9a3412;
  --gr-on-primary: #fff;
  --gr-text: #1d1914;
  --gr-muted: #6f675e;
  --gr-paper: #fff8f3;
  --gr-error: #9b2335;
  --gr-radius: 18px;
  --gr-gap: 20px;
  --gr-columns: 2;
  --gr-font: Georgia, serif;
  --gr-border: #eadfd4;
  --gr-group-bg: #fff;
}
```

Hooks you can target: `.generaptor`, `.generaptor-field`, `.generaptor-group`, `.generaptor-grid`, `.generaptor-actions`, plus `data-layout`, `data-density`, and `data-variant` on the form.

## Builder

The first item in the examples nav is the builder. Add a block for any field the library renders: text, email, password, number, long text, select, radio, checkbox, switch, date, time, date and time, phone, Social Security number, postal code, currency, and upload. Add a group when the form should be split into sections, the same layout as the Groups example. Click a block to edit its label, name, placeholder, helper text, options, width, and which group it belongs to.

Every form gets a `formId`. Clearing the page starts a new form and a new id. The id is stored with the draft and written on the schema as `formId`.

The panel on the right can show the schema or the finished form. Schema is the object you pass to `FormGenerator`. Form renders that schema with the current theme. Edits to a block show on that block straight away, and on the finished form while it is open.

The submit control has a label, a wide option, and left, center, or right alignment. The label is `submitLabel`. Width and alignment are `button.fullWidth` and `button.align` (`left`, `center`, or `right`). The same button is drawn at the bottom of the page and on the finished form.

Validation on a block is written into the schema:

- required, with an optional message
- min and max length, with optional messages
- min and max for numbers, with optional messages
- the format check for email, phone, Social Security number, postal code, currency, and date, which you can turn off or give a message
- min and max amount for currency
- max file size in megabytes

Copy or download the schema from that panel. The draft, including groups, validation, and `formId`, stays in `localStorage` under `generaptor.builder`, so leaving the builder or reloading the page keeps the form.

## Deploy the examples

`npm run build` writes the library to `dist/`. The examples site is a separate build, which is what Vercel runs:

```bash
npm run build:site
```

`vercel.json` points that command at the `site/` folder. Import the GitHub repository in Vercel and leave the defaults from that file.

## Scripts

```bash
npm run dev        # examples page
npm test           # vitest
npm run build      # library build in dist/
npm run build:site # examples site in site/
```
