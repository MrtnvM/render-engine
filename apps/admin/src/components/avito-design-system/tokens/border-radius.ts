import { AvitoBorderRadius } from '../types/theme';

export const avitoBorderRadius: AvitoBorderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  full: '9999px',
};

export const generateBorderRadiusCSS = (): string => {
  const { none, sm, md, lg, xl, full } = avitoBorderRadius;

  return `
:root {
  --avito-border-radius-none: ${none};
  --avito-border-radius-sm: ${sm};
  --avito-border-radius-md: ${md};
  --avito-border-radius-lg: ${lg};
  --avito-border-radius-xl: ${xl};
  --avito-border-radius-full: ${full};
}
`;
};