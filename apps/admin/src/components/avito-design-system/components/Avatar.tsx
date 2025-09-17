import React from 'react';
import { cn } from '../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const shapeStyles = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

const statusSizeStyles = {
  sm: 'w-2.5 h-2.5 border-2',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

const statusStyles = {
  online: 'bg-avito-success-500 border-white',
  offline: 'bg-avito-neutral-400 border-white',
  away: 'bg-avito-warning-500 border-white',
  busy: 'bg-avito-error-500 border-white',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  shape = 'circle',
  fallback,
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      const words = alt.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return alt.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  const showFallback = !src || imageError;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'inline-flex items-center justify-center font-medium text-white bg-avito-neutral-400 overflow-hidden',
          sizeStyles[size],
          shapeStyles[shape],
          className
        )}
        {...props}
      >
        {showFallback ? (
          <span className="select-none">{getFallbackText()}</span>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            statusSizeStyles[size],
            statusStyles[status]
          )}
        />
      )}
    </div>
  );
};

// Avatar group for displaying multiple avatars
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

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
  shape = 'circle',
  className,
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const sizeClasses = {
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-4',
    xl: '-space-x-5',
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.fallback}
          size={size}
          shape={shape}
          className="border-2 border-white"
        />
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center font-medium text-avito-neutral-700 bg-avito-neutral-100 border-2 border-white',
            sizeStyles[size],
            shapeStyles[shape]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};