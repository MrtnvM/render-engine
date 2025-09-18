import { AvitoBorderRadius } from '../types/theme';

export const avitoBorderRadius: AvitoBorderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
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