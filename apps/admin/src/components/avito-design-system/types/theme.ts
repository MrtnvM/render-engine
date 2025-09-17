export interface AvitoColorPalette {
  // Primary Green (Avito brand)
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Semantic Colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };

  // Neutral Grays
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Other
  white: string;
  black: string;
}

export interface AvitoTypography {
  fontFamily: {
    sans: string[];
    mono: string[];
  };

  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };

  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };

  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };

  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface AvitoSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface AvitoBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface AvitoShadow {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AvitoTheme {
  colors: AvitoColorPalette;
  typography: AvitoTypography;
  spacing: AvitoSpacing;
  borderRadius: AvitoBorderRadius;
  shadow: AvitoShadow;
}