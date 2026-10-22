import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Generaptor, { FormGenerator, applyMask, createForm } from './index';

function setup(ui) {
  const user = userEvent.setup();
  const view = render(ui);
  return { user, ...view };
}

describe('FormGenerator', () => {
  it('renders a text field from the legacy input type and submits it', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(
      <FormGenerator
        schema={{
          fields: [
            {
              id: 'nameInput',
              name: 'nameInput',
              type: 'input',
              inputType: 'text',
              label: 'Name',
              placeholder: 'Name',
            },
          ],
        }}
        button={{ label: 'Save' }}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByRole('textbox', { name: /name/i });
    expect(input).toHaveAttribute('placeholder', 'Name');
    await user.type(input, 'Ada');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { nameInput: 'Ada' },
      expect.objectContaining({ valid: true, raw: { nameInput: 'Ada' } }),
    );
  });

  it('blocks submit until required and email rules pass', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(
      <FormGenerator
        schema={{
          fields: [
            { name: 'email', type: 'email', label: 'Email', required: 'Work email is required' },
            {
              name: 'code',
              label: 'Code',
              required: true,
              minLength: { value: 4, message: 'Use 4 characters' },
            },
          ],
        }}
        onSubmit={onSubmit}
        button={{ label: 'Join' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Join' }));
    expect(screen.getByText('Work email is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email');
    await user.type(screen.getByRole('textbox', { name: /code/i }), 'ab');
    await user.click(screen.getByRole('button', { name: 'Join' }));
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Use 4 characters')).toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: /email/i }));
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@example.com');
    await user.type(screen.getByRole('textbox', { name: /code/i }), 'cd');
    await user.click(screen.getByRole('button', { name: 'Join' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { email: 'ada@example.com', code: 'abcd' },
      expect.objectContaining({ valid: true }),
    );
  });

  it('formats CPF, phone, and currency and submits the raw values', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(
      <FormGenerator
        schema={{
          fields: [
            { name: 'cpf', type: 'cpf', label: 'CPF' },
            { name: 'phone', type: 'phone', label: 'Phone' },
            { name: 'amount', type: 'currency', label: 'Amount', locale: 'pt-BR', currency: 'BRL' },
          ],
        }}
        button={{ label: 'Pay' }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('textbox', { name: 'CPF' }));
    await user.paste('52998224725');
    expect(screen.getByRole('textbox', { name: 'CPF' })).toHaveValue('529.982.247-25');
    await user.click(screen.getByRole('textbox', { name: 'Phone' }));
    await user.paste('11987654321');
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('(11) 98765-4321');
    await user.click(screen.getByRole('textbox', { name: 'Amount' }));
    await user.paste('123456');
    await user.click(screen.getByRole('button', { name: 'Pay' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf: '529.982.247-25',
        phone: '(11) 98765-4321',
      }),
      expect.objectContaining({
        raw: expect.objectContaining({
          cpf: '52998224725',
          phone: '11987654321',
          amount: 1234.56,
        }),
      }),
    );
  });

  it('hides conditional fields and skips their validation', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(
      <FormGenerator
        schema={{
          fields: [
            {
              name: 'kind',
              type: 'radio',
              label: 'Kind',
              initialValue: 'personal',
              options: [
                { value: 'personal', label: 'Personal' },
                { value: 'company', label: 'Company' },
              ],
            },
            {
              name: 'company',
              label: 'Company',
              required: 'Company is required',
              showIf: { field: 'kind', equals: 'company' },
            },
          ],
        }}
        button={{ label: 'Continue' }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByRole('textbox', { name: 'Company' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('company');

    await user.click(screen.getByRole('radio', { name: 'Company' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Company is required')).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders groups, tabs, and custom components', async () => {
    const onSubmit = vi.fn();
    function Score({ value, onChange, error }) {
      return (
        <div>
          <button type="button" onClick={() => onChange(5)}>
            Set score
          </button>
          <output>{value === '' || value == null ? 'empty' : value}</output>
          {error ? <span>{error}</span> : null}
        </div>
      );
    }

    const { user } = setup(
      <FormGenerator
        schema={{
          layout: 'groups',
          groups: [
            {
              id: 'patient',
              label: 'Patient',
              fields: [{ name: 'patientName', label: 'Patient name', required: true }],
            },
            {
              id: 'visit',
              label: 'Visit',
              fields: [{ name: 'reason', type: 'textarea', label: 'Reason' }],
            },
          ],
        }}
        button={{ label: 'Book' }}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Patient' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visit' })).toBeInTheDocument();

    render(
      <FormGenerator
        schema={{
          layout: 'tabs',
          groups: [
            { id: 'profile', label: 'Profile', fields: [{ name: 'role', label: 'Role' }] },
            { id: 'notes', label: 'Notes', fields: [{ name: 'note', label: 'Note' }] },
          ],
        }}
        button={false}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Note' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Notes' }));
    expect(screen.getByRole('textbox', { name: 'Note' })).toBeInTheDocument();

    render(
      <FormGenerator
        schema={{
          fields: [
            { name: 'score', type: 'custom', component: 'score', label: 'Score', required: true },
          ],
        }}
        components={{ score: Score }}
        button={{ label: 'Rate' }}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: 'Rate' })[0]);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Set score' }));
    await user.click(screen.getAllByRole('button', { name: 'Rate' })[0]);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5 }),
      expect.objectContaining({ valid: true }),
    );
  });

  it('renders date, time, and file fields', () => {
    render(
      <FormGenerator
        schema={{
          fields: [
            { name: 'when', type: 'date', label: 'When', format: 'dd/MM/yyyy' },
            { name: 'hour', type: 'hour', label: 'Hour' },
            { name: 'attachment', type: 'upload', label: 'Attachment', accept: 'image/*' },
          ],
        }}
        button={false}
      />,
    );

    expect(screen.getByRole('group', { name: 'When' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Hour' })).toBeInTheDocument();
    expect(screen.getByText('Attachment')).toBeInTheDocument();
  });

  it('applies letter and digit pattern masks', () => {
    expect(applyMask({ mask: 'AA-####' }, 'ab1234')).toBe('AB-1234');
    expect(applyMask({ type: 'cep' }, '01310100')).toBe('01310-100');
    expect(applyMask({ type: 'ssn' }, '123456789')).toBe('123-45-6789');
    expect(applyMask({ type: 'postal' }, '941071234')).toBe('94107-1234');
  });

  it('places the submit button from the schema', () => {
    render(
      <FormGenerator
        schema={{
          submitLabel: 'Send intake',
          button: { fullWidth: true, align: 'center' },
          fields: [{ name: 'city', label: 'City' }],
        }}
      />,
    );

    const button = screen.getByRole('button', { name: 'Send intake' });
    const actions = button.parentElement;
    expect(button).toHaveClass('MuiButton-fullWidth');
    expect(actions).toHaveAttribute('data-align', 'center');
    expect(actions).toHaveAttribute('data-wide', 'true');
  });

  it('keeps a typed value when the label changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FormGenerator schema={{ fields: [{ name: 'city', label: 'City' }] }} button={false} />,
    );

    await user.type(screen.getByRole('textbox', { name: 'City' }), 'Lisbon');
    rerender(
      <FormGenerator
        schema={{ fields: [{ name: 'city', label: 'Town', placeholder: 'Lisbon' }] }}
        button={false}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Town' })).toHaveValue('Lisbon');
    expect(screen.getByPlaceholderText('Lisbon')).toBeInTheDocument();
  });

  it('checks a pattern and a URL from the schema', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(
      <FormGenerator
        schema={{
          validateOn: 'change',
          fields: [
            {
              name: 'code',
              label: 'Code',
              validators: {
                pattern: { value: '^[A-Z]{2}\\d{2}$', message: 'Two letters, two digits' },
              },
            },
            { name: 'site', type: 'url', label: 'Site' },
          ],
        }}
        button={{ label: 'Check' }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Code' }), 'a1');
    expect(screen.getByText('Two letters, two digits')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Site' }), 'nope');
    expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: 'Code' }));
    await user.type(screen.getByRole('textbox', { name: 'Code' }), 'AB12');
    await user.clear(screen.getByRole('textbox', { name: 'Site' }));
    await user.type(screen.getByRole('textbox', { name: 'Site' }), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(onSubmit).toHaveBeenCalledWith(
      { code: 'AB12', site: 'https://example.com' },
      expect.anything(),
    );
  });

  it('keeps the factory API', () => {
    const element = new Generaptor().create(
      { fields: [{ name: 'city', label: 'City' }] },
      { button: { label: 'Send city' } },
    );
    render(element);
    expect(screen.getByRole('textbox', { name: 'City' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send city' })).toBeInTheDocument();
    render(createForm({ fields: [{ name: 'zip', type: 'cep', label: 'CEP' }] }, { button: false }));
    expect(screen.getByRole('textbox', { name: 'CEP' })).toBeInTheDocument();
  });
});
