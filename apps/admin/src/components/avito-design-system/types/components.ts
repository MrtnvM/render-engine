// Component prop types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined';
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outlined';
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'full';
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'new';
}

export interface DotBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  shape?: 'circle' | 'square';
}

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  price?: string;
  image?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  status?: 'active' | 'inactive' | 'pending';
  featured?: boolean;
  actions?: React.ReactNode;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  rightContent?: React.ReactNode;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  fluid?: boolean;
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
  background?: 'white' | 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  divider?: boolean;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: number;
  colStart?: number;
  rowSpan?: number;
  rowStart?: number;
}

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}