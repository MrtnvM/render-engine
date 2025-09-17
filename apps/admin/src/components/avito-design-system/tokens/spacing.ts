export const avitoSpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

export const generateSpacingCSS = (): string => {
  return `
:root {
  --avito-spacing-xs: ${avitoSpacing.xs};
  --avito-spacing-sm: ${avitoSpacing.sm};
  --avito-spacing-md: ${avitoSpacing.md};
  --avito-spacing-lg: ${avitoSpacing.lg};
  --avito-spacing-xl: ${avitoSpacing.xl};
  --avito-spacing-2xl: ${avitoSpacing['2xl']};
  --avito-spacing-3xl: ${avitoSpacing['3xl']};
  --avito-spacing-4xl: ${avitoSpacing['4xl']};
}
`;
};