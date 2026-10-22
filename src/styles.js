import { createTheme } from '@mui/material/styles';

function inkFor(color) {
  const hex = String(color || '').trim();
  const match = hex.match(/^#([\da-f]{6})$/i);
  if (!match) return '#ffffff';
  const value = match[1];
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const luma = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luma > 0.64 ? '#1d1914' : '#ffffff';
}

function mergeButton(userButton = {}) {
  const root = {
    textTransform: 'none',
    fontWeight: 650,
    letterSpacing: 0,
    ...(userButton.styleOverrides?.root || {}),
  };
  return {
    ...userButton,
    styleOverrides: {
      ...userButton.styleOverrides,
      root,
    },
  };
}

export function defineStyles(config = {}) {
  const mode = config.mode || 'light';
  const primary = config.primary || (mode === 'dark' ? '#e2b15a' : '#1f4d3a');
  const secondary = config.secondary || '#c4552a';
  const error = config.error || (mode === 'dark' ? '#ff8d7d' : '#9b2335');
  const background = config.background || (mode === 'dark' ? '#1c1915' : '#fbf7f2');
  const paper = config.paper || background;
  const text = config.text || (mode === 'dark' ? '#f6f1e8' : '#1d1914');
  const muted = config.muted || (mode === 'dark' ? '#b7ad9f' : '#6f675e');
  const radius = config.radius ?? 12;
  const density = config.density || 'comfortable';
  const gap = config.gap ?? (density === 'compact' ? 12 : 18);
  const columns = config.columns;
  const fontFamily = config.fontFamily || '"Outfit", "Segoe UI", sans-serif';
  const variant = config.variant || config.field?.variant || 'outlined';
  const { MuiButton: userButton, ...restComponents } = config.components || {};

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: secondary },
      error: { main: error },
      background: { default: background, paper },
      text: { primary: text, secondary: muted },
    },
    shape: { borderRadius: radius },
    typography: {
      fontFamily,
      button: { textTransform: 'none', fontWeight: 650 },
    },
    components: {
      MuiButton: mergeButton(userButton),
      ...restComponents,
    },
  });

  const tokens = {
    mode,
    primary,
    secondary,
    error,
    background,
    paper,
    text,
    muted,
    radius,
    density,
    gap,
    columns,
    variant,
    fontFamily,
  };

  return {
    theme,
    tokens,
    styles: {
      density,
      cssVars: {
        '--gr-primary': primary,
        '--gr-on-primary': inkFor(primary),
        '--gr-secondary': secondary,
        '--gr-text': text,
        '--gr-muted': muted,
        '--gr-paper': paper,
        '--gr-error': error,
        '--gr-radius': `${radius}px`,
        '--gr-gap': typeof gap === 'number' ? `${gap}px` : gap,
        '--gr-columns': String(columns || 1),
        '--gr-font': fontFamily,
        '--gr-border':
          config.border ||
          (mode === 'dark' ? 'rgba(246, 241, 232, 0.16)' : 'rgba(29, 25, 20, 0.12)'),
        '--gr-group-bg':
          config.groupBackground ||
          (mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.55)'),
        '--gr-group-padding': density === 'compact' ? '12px' : '16px 18px 18px',
        ...(config.cssVars || {}),
      },
      layout: {
        columns,
        gap,
      },
      field: {
        variant,
        size: config.field?.size || (density === 'compact' ? 'small' : 'medium'),
        fullWidth: config.field?.fullWidth !== false,
        sx: [
          {
            '& .MuiOutlinedInput-root, & .MuiFilledInput-root, & .MuiPickersOutlinedInput-root': {
              borderRadius: 'var(--gr-radius, 8px)',
            },
          },
          config.field?.sx,
        ],
      },
      button: {
        variant: config.button?.variant || 'contained',
        color: config.button?.color || 'primary',
        fullWidth: Boolean(config.button?.fullWidth),
        disableElevation: config.button?.disableElevation !== false,
        sx: [{ borderRadius: 'var(--gr-radius, 8px)' }, config.button?.sx],
      },
      group: config.group || {},
      form: config.form || {},
    },
    classNames: config.classNames || {},
  };
}

export const presetConfigs = {
  paper: {
    primary: '#1f4d3a',
    secondary: '#c4552a',
    background: '#fbf7f2',
    paper: '#fbf7f2',
    text: '#1d1914',
    muted: '#6f675e',
    radius: 14,
    fontFamily: '"Outfit", "Segoe UI", sans-serif',
  },
  night: {
    mode: 'dark',
    primary: '#e2b15a',
    secondary: '#8fb9a8',
    background: '#1c1915',
    paper: '#26221c',
    text: '#f6f1e8',
    muted: '#b7ad9f',
    error: '#ff8d7d',
    radius: 14,
    fontFamily: '"Outfit", "Segoe UI", sans-serif',
  },
  tide: {
    primary: '#0e4d6c',
    secondary: '#e07a3d',
    background: '#f4f7f8',
    paper: '#ffffff',
    text: '#14262e',
    muted: '#5d6c74',
    radius: 6,
    variant: 'filled',
    density: 'compact',
    fontFamily: '"Outfit", "Segoe UI", sans-serif',
  },
};

export const stylePresets = Object.fromEntries(
  Object.entries(presetConfigs).map(([name, config]) => [name, defineStyles(config)]),
);

export function isMuiTheme(value) {
  return Boolean(value && typeof value === 'object' && typeof value.spacing === 'function');
}
