// Main exports
export { Button } from './components/Button';
export { Card, CardHeader, CardContent, CardFooter } from './components/Card';
export { Input, TextArea } from './components/Input';
export { Badge, StatusBadge, DotBadge } from './components/Badge';
export { Avatar, AvatarGroup } from './components/Avatar';
export { ProductCard, ListItem } from './components/ProductCard';
export { DesignSystemShowcase } from './components/Showcase';

// Layout components
export { Container, Section } from './layout/Container';
export { Grid, GridItem, Flex } from './layout/Grid';

// Utilities
export { cn } from './utils/cn';

// Types
export type {
  ButtonProps,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  InputProps,
  TextAreaProps,
  BadgeProps,
  StatusBadgeProps,
  DotBadgeProps,
  AvatarProps,
  AvatarGroupProps,
  ProductCardProps,
  ListItemProps,
  ContainerProps,
  SectionProps,
  GridProps,
  GridItemProps,
  FlexProps,
} from './types/components';

export type { AvitoTheme, AvitoColorPalette, AvitoTypography } from './types/theme';

// Tokens
export {
  avitoColors,
  avitoTypography,
  avitoSpacing,
  avitoBorderRadius,
  avitoShadow,
  generateCSSVariables,
  generateTypographyCSS,
  generateSpacingCSS,
  generateBorderRadiusCSS,
  generateShadowCSS,
} from './tokens';