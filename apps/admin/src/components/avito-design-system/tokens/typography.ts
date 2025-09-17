import { AvitoTypography } from '../types/theme';

export const avitoTypography: AvitoTypography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'monospace',
    ],
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

export const generateTypographyCSS = (): string => {
  const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = avitoTypography;

  return `
:root {
  --avito-font-sans: ${fontFamily.sans.join(', ')};
  --avito-font-mono: ${fontFamily.mono.join(', ')};

  --avito-font-size-xs: ${fontSize.xs};
  --avito-font-size-sm: ${fontSize.sm};
  --avito-font-size-base: ${fontSize.base};
  --avito-font-size-lg: ${fontSize.lg};
  --avito-font-size-xl: ${fontSize.xl};
  --avito-font-size-2xl: ${fontSize['2xl']};
  --avito-font-size-3xl: ${fontSize['3xl']};
  --avito-font-size-4xl: ${fontSize['4xl']};

  --avito-font-weight-normal: ${fontWeight.normal};
  --avito-font-weight-medium: ${fontWeight.medium};
  --avito-font-weight-semibold: ${fontWeight.semibold};
  --avito-font-weight-bold: ${fontWeight.bold};

  --avito-line-height-tight: ${lineHeight.tight};
  --avito-line-height-normal: ${lineHeight.normal};
  --avito-line-height-relaxed: ${lineHeight.relaxed};

  --avito-letter-spacing-tight: ${letterSpacing.tight};
  --avito-letter-spacing-normal: ${letterSpacing.normal};
  --avito-letter-spacing-wide: ${letterSpacing.wide};
}

.avito-body {
  font-family: var(--avito-font-sans);
  font-size: var(--avito-font-size-base);
  line-height: var(--avito-line-height-normal);
  color: var(--avito-color-neutral-900);
}

.avito-heading-1 {
  font-family: var(--avito-font-sans);
  font-size: var(--avito-font-size-4xl);
  font-weight: var(--avito-font-weight-bold);
  line-height: var(--avito-line-height-tight);
  color: var(--avito-color-neutral-950);
}

.avito-heading-2 {
  font-family: var(--avito-font-sans);
  font-size: var(--avito-font-size-3xl);
  font-weight: var(--avito-font-weight-bold);
  line-height: var(--avito-line-height-tight);
  color: var(--avito-color-neutral-950);
}

.avito-heading-3 {
  font-family: var(--avito-font-sans);
  font-size: var(--avito-font-size-2xl);
  font-weight: var(--avito-font-weight-semibold);
  line-height: var(--avito-line-height-tight);
  color: var(--avito-color-neutral-950);
}

.avito-text-sm {
  font-size: var(--avito-font-size-sm);
  line-height: var(--avito-line-height-normal);
}

.avito-text-xs {
  font-size: var(--avito-font-size-xs);
  line-height: var(--avito-line-height-normal);
}
`;
};