import { RatingField } from './widgets';

const membership = {
  columns: 1,
  fields: [
    {
      name: 'fullName',
      label: 'Full name',
      placeholder: 'Ada Lovelace',
      required: true,
      autoComplete: 'name',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'ada@analytical.dev',
      required: true,
      autoComplete: 'email',
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      minLength: { value: 8, message: 'Use at least 8 characters' },
      autoComplete: 'new-password',
    },
    {
      name: 'guests',
      type: 'number',
      label: 'Guests',
      min: 1,
      max: 8,
      step: 1,
      helperText: 'Including you',
    },
    {
      name: 'plan',
      type: 'select',
      label: 'Plan',
      required: 'Choose a plan',
      helperText: 'You can change this later',
      options: [
        { value: 'community', label: 'Community' },
        { value: 'studio', label: 'Studio' },
        { value: 'house', label: 'House' },
      ],
    },
    { name: 'start', type: 'date', label: 'Start date', format: 'dd/MM/yyyy' },
    { name: 'hour', type: 'hour', label: 'Preferred time', format: 'HH:mm' },
    { name: 'notes', type: 'checkbox', label: 'Send me product notes' },
    {
      name: 'contact',
      type: 'radio',
      label: 'How should we reach you?',
      initialValue: 'email',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'post', label: 'Post', disabled: true },
      ],
    },
    { name: 'draft', type: 'button', label: 'Save draft', variant: 'text' },
  ],
};

const validation = {
  fields: [
    {
      name: 'username',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: { value: 16, message: 'Keep it under 16 characters' },
      helperText: 'Letters, numbers, no spaces needed',
    },
    { name: 'email', type: 'email', label: 'Email', required: 'Email is required' },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      minLength: { value: 8, message: 'Use at least 8 characters' },
    },
    {
      name: 'confirm',
      type: 'password',
      label: 'Confirm password',
      required: true,
      validators: {
        custom: (value, values) => value === values.password || 'Passwords do not match',
      },
    },
    {
      name: 'age',
      type: 'number',
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      helperText: 'Studios are 18+',
    },
  ],
};

const masks = {
  fields: [
    { name: 'name', label: 'Name', required: true },
    {
      name: 'phone',
      type: 'phone',
      label: 'Phone',
      required: true,
      helperText: 'Brazil, with area code',
    },
    { name: 'cpf', type: 'cpf', label: 'CPF', required: true },
    { name: 'cep', type: 'cep', label: 'CEP', required: true },
    {
      name: 'amount',
      type: 'currency',
      label: 'Amount',
      required: true,
      currency: 'BRL',
      locale: 'pt-BR',
      currencyRules: { min: 10, message: 'Minimum is R$ 10,00' },
      helperText: 'Type the digits. The last two are cents.',
    },
    {
      name: 'badge',
      label: 'Badge',
      mask: 'AA-####',
      placeholder: 'AB-1234',
      helperText: 'A pattern mask: AA-####',
    },
  ],
};

const groups = {
  layout: 'groups',
  columns: 2,
  groups: [
    {
      id: 'patient',
      label: 'Patient',
      description: 'Who is coming in.',
      columns: 2,
      fields: [
        { name: 'patientName', label: 'Name', required: true, columnSpan: 2 },
        { name: 'birth', type: 'date', label: 'Date of birth', format: 'dd/MM/yyyy' },
        { name: 'email', type: 'email', label: 'Email', required: true },
      ],
    },
    {
      id: 'visit',
      label: 'Visit',
      description: 'What you need from the clinic.',
      columns: 2,
      fields: [
        {
          name: 'department',
          type: 'select',
          label: 'Department',
          required: true,
          options: [
            { value: 'clinical', label: 'Clinical' },
            { value: 'imaging', label: 'Imaging' },
            { value: 'dental', label: 'Dental' },
          ],
        },
        { name: 'when', type: 'datetime', label: 'Appointment', format: 'dd/MM/yyyy HH:mm' },
        { name: 'reason', type: 'textarea', label: 'Reason', rows: 4, columnSpan: 2 },
      ],
    },
    {
      id: 'consent',
      label: 'Consent',
      fields: [
        {
          name: 'consent',
          type: 'switch',
          label: 'I agree to be contacted about this visit',
          required: true,
        },
      ],
    },
  ],
};

const tabs = {
  layout: 'tabs',
  groups: [
    {
      id: 'profile',
      label: 'Profile',
      description: 'Start here. Errors on another tab are marked when you submit.',
      fields: [
        { name: 'roleName', label: 'Name', required: true },
        { name: 'roleEmail', type: 'email', label: 'Email', required: true },
        {
          name: 'track',
          type: 'select',
          label: 'Track',
          required: true,
          options: [
            { value: 'design', label: 'Design' },
            { value: 'engineering', label: 'Engineering' },
            { value: 'research', label: 'Research' },
          ],
        },
      ],
    },
    {
      id: 'experience',
      label: 'Experience',
      fields: [
        {
          name: 'years',
          type: 'number',
          label: 'Years of experience',
          min: 0,
          max: 60,
          required: true,
        },
        { name: 'portfolio', type: 'url', label: 'Portfolio', placeholder: 'https://' },
        { name: 'summary', type: 'textarea', label: 'Summary', rows: 4, maxLength: 280 },
      ],
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Anything else we should know.',
      fields: [
        { name: 'notice', type: 'checkbox', label: 'I can start within 30 days' },
        { name: 'extra', type: 'textarea', label: 'Note', rows: 3 },
      ],
    },
  ],
};

const conditional = {
  fields: [
    {
      name: 'request',
      type: 'radio',
      label: 'Request',
      initialValue: 'new',
      options: [
        { value: 'new', label: 'New project' },
        { value: 'change', label: 'Change request' },
      ],
    },
    {
      name: 'ticket',
      label: 'Ticket',
      placeholder: 'PR-1042',
      required: 'A ticket is required for changes',
      showIf: { field: 'request', equals: 'change' },
    },
    {
      name: 'budget',
      type: 'currency',
      label: 'Budget',
      currency: 'USD',
      locale: 'en-US',
      helperText: 'Optional. Last two digits are cents.',
    },
    { name: 'hosting', type: 'checkbox', label: 'This needs hosting' },
    {
      name: 'region',
      type: 'select',
      label: 'Region',
      required: true,
      showIf: { field: 'hosting', equals: true },
      options: [
        { value: 'gru', label: 'São Paulo' },
        { value: 'iad', label: 'Virginia' },
        { value: 'dub', label: 'Dublin' },
      ],
    },
    {
      name: 'launch',
      type: 'date',
      label: 'Target date',
      showIf: (values) => values.request === 'new',
    },
  ],
};

const upload = {
  fields: [
    { name: 'title', label: 'Title', required: true, placeholder: 'Spring press kit' },
    {
      name: 'cover',
      type: 'file',
      label: 'Cover image',
      accept: 'image/*',
      maxSize: 2_000_000,
      required: true,
      buttonLabel: 'Upload cover',
      helperText: 'PNG or JPG, up to 2 MB',
    },
    {
      name: 'files',
      type: 'upload',
      label: 'Attachments',
      multiple: true,
      accept: '.pdf,.zip,image/*',
      maxSize: 5_000_000,
      helperText: 'PDF, ZIP, or images. 5 MB each.',
    },
    { name: 'rights', type: 'checkbox', label: 'I can share these files', required: true },
  ],
};

const stylesForm = {
  columns: 1,
  fields: [
    { name: 'studio', label: 'Studio', required: true, placeholder: 'North Room' },
    { name: 'email', type: 'email', label: 'Email', required: true },
    {
      name: 'interest',
      type: 'select',
      label: 'Interest',
      options: [
        { value: 'forms', label: 'Forms' },
        { value: 'themes', label: 'Themes' },
        { value: 'both', label: 'Both' },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Message', rows: 3, columnSpan: 2 },
  ],
};

const custom = {
  fields: [
    { name: 'piece', label: 'Piece', required: true, placeholder: 'Oak bench' },
    {
      name: 'score',
      type: 'custom',
      component: 'rating',
      label: 'Score',
      required: 'Choose a score',
      helperText: '1 is rough, 5 is excellent.',
    },
    { name: 'comment', type: 'textarea', label: 'Comment', rows: 3 },
    { name: 'recommend', type: 'switch', label: 'I would recommend this' },
  ],
};

export const examples = [
  {
    id: 'membership',
    kicker: 'Fields',
    title: 'Membership',
    summary: 'Text, email, password, number, select, date, time, checkbox, radio, and a button.',
    submitLabel: 'Create membership',
    schema: membership,
  },
  {
    id: 'validation',
    kicker: 'Rules',
    title: 'Validation',
    summary: 'Required, length, email, number range, and a custom check that compares two fields.',
    submitLabel: 'Create account',
    schema: validation,
    code: `const schema = {
  fields: [
    { name: 'username', label: 'Username', required: true, minLength: 3, maxLength: 16 },
    { name: 'email', type: 'email', label: 'Email', required: 'Email is required' },
    { name: 'password', type: 'password', label: 'Password', required: true, minLength: 8 },
    {
      name: 'confirm',
      type: 'password',
      label: 'Confirm password',
      required: true,
      validators: {
        custom: (value, values) => value === values.password || 'Passwords do not match',
      },
    },
    { name: 'age', type: 'number', label: 'Age', required: true, min: 18, max: 120 },
  ],
}`,
  },
  {
    id: 'masks',
    kicker: 'Input',
    title: 'Masks',
    summary: 'Phone, CPF, CEP, currency, and a custom pattern. Submit receives the raw value too.',
    submitLabel: 'Save details',
    schema: masks,
  },
  {
    id: 'groups',
    kicker: 'Layout',
    title: 'Groups',
    summary: 'Sections with their own columns. A field can span more than one column.',
    submitLabel: 'Request visit',
    schema: groups,
  },
  {
    id: 'tabs',
    kicker: 'Layout',
    title: 'Tabs',
    summary: 'Same schema, split into tabs. A failed submit opens the tab that needs attention.',
    submitLabel: 'Submit application',
    schema: tabs,
  },
  {
    id: 'conditional',
    kicker: 'Logic',
    title: 'Conditional',
    summary:
      'Fields appear from a value match or from a function. Hidden fields are not submitted.',
    submitLabel: 'Send request',
    schema: conditional,
    code: `showIf: { field: 'request', equals: 'change' }
showIf: { field: 'hosting', equals: true }
showIf: (values) => values.request === 'new'`,
  },
  {
    id: 'upload',
    kicker: 'Files',
    title: 'Upload',
    summary: 'Single or multiple files, with accept and size checks.',
    submitLabel: 'Send files',
    schema: upload,
  },
  {
    id: 'styles',
    kicker: 'Theme',
    title: 'Styles',
    summary: 'Change the tokens beside the form. Copy defineStyles, or override the CSS variables.',
    submitLabel: 'Send note',
    schema: stylesForm,
  },
  {
    id: 'custom',
    kicker: 'Components',
    title: 'Custom field',
    summary: 'Pass your own component. It receives value, onChange, and the validation error.',
    submitLabel: 'Save review',
    schema: custom,
    components: { rating: RatingField },
    code: `function RatingField({ field, value, onChange, error }) {
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
  schema={schema}
  components={{ rating: RatingField }}
/>`,
  },
];

export function schemaSnippet(example) {
  if (example.code) return example.code;
  return `const schema = ${JSON.stringify(example.schema, null, 2)}`;
}
