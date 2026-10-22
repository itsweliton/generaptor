import { useMemo, useState } from 'react';
import { FormGenerator } from '../FormGenerator';
import { defineStyles, presetConfigs } from '../styles';
import Builder from './Builder';
import { examples, schemaSnippet } from './examples';
import { present } from './widgets';

const presets = [
  ['paper', 'Paper'],
  ['night', 'Night'],
  ['tide', 'Tide'],
];

const fonts = [
  ['"Outfit", "Segoe UI", sans-serif', 'Outfit'],
  ['"Fraunces", Georgia, serif', 'Fraunces'],
];

function styleSnippet(config) {
  const printable = {
    mode: config.mode || 'light',
    primary: config.primary,
    secondary: config.secondary,
    background: config.background,
    paper: config.paper,
    text: config.text,
    muted: config.muted,
    radius: config.radius ?? 12,
    variant: config.variant || 'outlined',
    density: config.density || 'comfortable',
    columns: config.columns ?? 1,
    fontFamily: config.fontFamily,
  };
  return `const look = defineStyles(${JSON.stringify(printable, null, 2)})

<FormGenerator schema={schema} {...look} className="my-form" />`;
}

function cssSnippet(config) {
  const gap = config.density === 'compact' ? 12 : (config.gap ?? 18);
  return `.my-form {
  --gr-primary: ${config.primary || '#1f4d3a'};
  --gr-text: ${config.text || '#1d1914'};
  --gr-muted: ${config.muted || '#6f675e'};
  --gr-paper: ${config.paper || '#fbf7f2'};
  --gr-radius: ${config.radius ?? 12}px;
  --gr-gap: ${gap}px;
  --gr-columns: ${config.columns ?? 1};
  --gr-font: ${config.fontFamily || 'Outfit, sans-serif'};
}`;
}

function Mast({ preset, onChoose }) {
  return (
    <header className="mast">
      <div className="brand">
        <span className="mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path
              d="M9 22.5 16 8.5l7 14"
              fill="none"
              stroke="#f6f1e8"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="eyebrow">Schema forms</p>
          <h1>Generaptor</h1>
        </div>
      </div>
      <p className="lede">
        Describe the fields. The form, the checks, and the layout come from that schema. Restyle it
        with tokens, a class, or a component of your own.
      </p>
      <div className="presets" role="group" aria-label="Form theme">
        {presets.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={preset === id ? 'is-active' : undefined}
            aria-pressed={preset === id}
            onClick={() => onChoose(id)}
          >
            <i className={`swatch swatch-${id}`} />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}

export default function App() {
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [preset, setPreset] = useState('paper');
  const [overrides, setOverrides] = useState({});
  const [live, setLive] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState('');

  const building = exampleId === 'builder';
  const example = examples.find((item) => item.id === exampleId) || examples[0];
  const styleConfig = useMemo(() => {
    const base = presetConfigs[preset];
    return !building && example.id === 'styles' ? { ...base, ...overrides } : base;
  }, [building, example.id, overrides, preset]);
  const appearance = useMemo(() => defineStyles(styleConfig), [styleConfig]);

  const schema = useMemo(() => {
    if (example.id !== 'membership') return example.schema;
    return {
      ...example.schema,
      fields: example.schema.fields.map((field) =>
        field.name === 'draft'
          ? { ...field, onClick: (values) => setDraft(present(values)) }
          : field,
      ),
    };
  }, [example]);

  function openExample(id) {
    setExampleId(id);
    setLive(null);
    setSubmitted(null);
    setDraft(null);
    setCopied('');
  }

  function choosePreset(id) {
    setPreset(id);
    setOverrides({});
  }

  function patch(partial) {
    setOverrides((current) => ({ ...current, ...partial }));
  }

  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
    } catch {
      setCopied('');
    }
  }

  const rawDiffers =
    live && JSON.stringify(present(live.values)) !== JSON.stringify(present(live.raw));

  return (
    <div className="page">
      <div className="layout">
        <div className="rail">
          <Mast preset={preset} onChoose={choosePreset} />
          <nav className="example-nav" aria-label="Examples">
            <button
              type="button"
              className={building ? 'is-active' : undefined}
              aria-current={building ? 'page' : undefined}
              onClick={() => openExample('builder')}
            >
              <span>00</span>
              Builder
            </button>
            {examples.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={!building && item.id === example.id ? 'is-active' : undefined}
                aria-current={!building && item.id === example.id ? 'page' : undefined}
                onClick={() => openExample(item.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </button>
            ))}
          </nav>
        </div>

        <main className="workspace">
          {building ? <Builder appearance={appearance} /> : null}
          {building ? null : (
            <div className="intro">
              <p className="eyebrow">{example.kicker}</p>
              <h2>{example.title}</h2>
              <p>{example.summary}</p>
            </div>
          )}

          {!building && example.id === 'styles' ? (
            <StyleLab config={styleConfig} copied={copied} onPatch={patch} onCopy={copy} />
          ) : null}
          {building ? null : (
            <>
              <div className="stage">
                <section
                  className="stage-card"
                  style={{
                    background: appearance.tokens.paper,
                    color: appearance.tokens.text,
                    borderColor: appearance.tokens.mode === 'dark' ? '#3c342c' : undefined,
                  }}
                >
                  <FormGenerator
                    key={example.id}
                    schema={schema}
                    components={example.components}
                    {...appearance}
                    button={{ label: example.submitLabel }}
                    onChange={(values, meta) =>
                      setLive({ values, raw: meta.raw, valid: meta.valid, errors: meta.errors })
                    }
                    verifyValidation={(valid, errors, values) =>
                      setLive((current) => ({
                        values,
                        raw: current?.raw,
                        valid,
                        errors,
                      }))
                    }
                    onSubmit={(values, meta) =>
                      setSubmitted({ values: present(values), raw: present(meta.raw) })
                    }
                  />
                </section>

                <aside className="readout" aria-live="polite">
                  <div>
                    <h3>Validation</h3>
                    <p className={live ? (live.valid ? 'is-valid' : 'is-invalid') : undefined}>
                      {live
                        ? live.valid
                          ? 'Ready to submit'
                          : 'Needs attention'
                        : 'Edit a field to check it'}
                    </p>
                  </div>
                  {draft ? (
                    <div>
                      <h3>Draft</h3>
                      <pre>{JSON.stringify(draft, null, 2)}</pre>
                    </div>
                  ) : null}
                  <div>
                    <h3>Live values</h3>
                    <pre>{live ? JSON.stringify(present(live.values), null, 2) : '—'}</pre>
                  </div>
                  {rawDiffers ? (
                    <div>
                      <h3>Raw values</h3>
                      <pre>{JSON.stringify(present(live.raw), null, 2)}</pre>
                    </div>
                  ) : null}
                  <div>
                    <h3>Last submit</h3>
                    <pre>
                      {submitted
                        ? JSON.stringify(submitted.values, null, 2)
                        : 'Submit the form to see the payload.'}
                    </pre>
                  </div>
                </aside>
              </div>

              <details className="schema">
                <summary>Schema</summary>
                <pre>
                  {example.id === 'styles' ? styleSnippet(styleConfig) : schemaSnippet(example)}
                </pre>
              </details>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function StyleLab({ config, copied, onPatch, onCopy }) {
  const js = styleSnippet(config);
  const css = cssSnippet(config);
  const fontValue = fonts.find(([value]) => value === config.fontFamily)?.[0] || fonts[0][0];

  return (
    <section className="lab" aria-label="Style tokens">
      <div className="lab-controls">
        <label>
          Primary
          <input
            type="color"
            value={config.primary || '#1f4d3a'}
            onChange={(event) => onPatch({ primary: event.target.value })}
          />
        </label>
        <label>
          Radius
          <input
            type="range"
            min="0"
            max="28"
            value={config.radius ?? 12}
            onChange={(event) => onPatch({ radius: Number(event.target.value) })}
          />
          <span>{config.radius ?? 12}px</span>
        </label>
        <label>
          Variant
          <select
            value={config.variant || 'outlined'}
            onChange={(event) => onPatch({ variant: event.target.value })}
          >
            <option value="outlined">Outlined</option>
            <option value="filled">Filled</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <label>
          Density
          <select
            value={config.density || 'comfortable'}
            onChange={(event) => onPatch({ density: event.target.value })}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <label>
          Columns
          <select
            value={String(config.columns ?? 1)}
            onChange={(event) => onPatch({ columns: Number(event.target.value) })}
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </label>
        <label>
          Font
          <select
            value={fontValue}
            onChange={(event) => onPatch({ fontFamily: event.target.value })}
          >
            {fonts.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="lab-code">
        <article>
          <header>
            <h3>defineStyles</h3>
            <button type="button" onClick={() => onCopy(js, 'js')}>
              {copied === 'js' ? 'Copied' : 'Copy'}
            </button>
          </header>
          <pre>{js}</pre>
        </article>
        <article>
          <header>
            <h3>CSS variables</h3>
            <button type="button" onClick={() => onCopy(css, 'css')}>
              {copied === 'css' ? 'Copied' : 'Copy'}
            </button>
          </header>
          <pre>{css}</pre>
        </article>
      </div>
    </section>
  );
}
