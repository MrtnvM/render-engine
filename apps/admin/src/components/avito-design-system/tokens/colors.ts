import { AvitoColorPalette } from '../types/theme';

export const avitoColors: AvitoColorPalette = {
  // Primary Green (Avito brand color #00A950)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Success Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Yellow/Orange
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Grays
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
};

// Generate CSS custom properties
export const generateCSSVariables = (): string => {
  const lines: string[] = [];

  // Primary colors
  Object.entries(avitoColors.primary).forEach(([shade, value]) => {
    lines.push(`  --avito-color-primary-${shade}: ${value};`);
  });

  // Semantic colors
  ['success', 'warning', 'error'].forEach((semantic) => {
    const colorGroup = avitoColors[semantic as keyof typeof avitoColors] as any;
    Object.entries(colorGroup).forEach(([shade, value]) => {
      lines.push(`  --avito-color-${semantic}-${shade}: ${value};`);
    });
  });

  // Neutral colors
  Object.entries(avitoColors.neutral).forEach(([shade, value]) => {
    lines.push(`  --avito-color-neutral-${shade}: ${value};`);
  });

  // Base colors
  lines.push(`  --avito-color-white: ${avitoColors.white};`);
  lines.push(`  --avito-color-black: ${avitoColors.black};`);

  return `:root {\n${lines.join('\n')}\n}`;
};