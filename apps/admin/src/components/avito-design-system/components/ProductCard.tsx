import React from 'react';
import { cn } from '../utils/cn';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';

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

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  image,
  category,
  rating,
  reviews,
  status = 'active',
  featured = false,
  actions,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteClick,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'group relative bg-white border border-avito-neutral-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-avito-neutral-300',
        featured && 'ring-2 ring-avito-primary-500',
        className
      )}
      {...props}
    >
      {/* Image Section */}
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-avito-neutral-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Status Badge */}
          {status !== 'active' && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" size="sm" rounded="md">
                {status}
              </Badge>
            </div>
          )}

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="primary" size="sm" rounded="md">
                Featured
              </Badge>
            </div>
          )}

          {/* Favorite Button */}
          {showFavoriteButton && (
            <button
              onClick={onFavoriteClick}
              className={cn(
                'absolute top-2 right-2 p-1.5 rounded-lg transition-colors duration-200',
                isFavorite
                  ? 'bg-avito-error-100 text-avito-error-600 hover:bg-avito-error-200'
                  : 'bg-white/80 text-avito-neutral-600 hover:bg-white hover:text-avito-error-600',
                featured && 'right-10'
              )}
            >
              <svg
                className="w-4 h-4"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <div className="mb-2">
            <span className="text-xs font-medium text-avito-neutral-600 uppercase tracking-wide">
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-avito-neutral-900 mb-1 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-avito-neutral-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Rating and Reviews */}
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-2 mb-3">
            {rating !== undefined && (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.floor(rating)
                        ? 'text-avito-warning-500 fill-current'
                        : 'text-avito-neutral-300'
                    )}
                    viewBox="0 0 20 20"
                    fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-avito-neutral-600">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            {reviews !== undefined && (
              <span className="text-xs text-avito-neutral-500">
                ({reviews} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="mb-4">
            <span className="text-lg font-bold text-avito-neutral-900">
              {price}
            </span>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple List Item for services or other items
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

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  description,
  rightContent,
  badge,
  href,
  onClick,
  className,
  ...props
}) => {
  const Component = href ? 'a' : onClick ? 'button' : 'div';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 bg-white border border-avito-neutral-200 rounded-lg transition-colors duration-200 hover:bg-avito-neutral-50 hover:border-avito-neutral-300',
        (href || onClick) && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-avito-neutral-900 truncate">
            {title}
          </h4>
          {badge}
        </div>

        {subtitle && (
          <p className="text-sm text-avito-neutral-600 mb-1">
            {subtitle}
          </p>
        )}

        {description && (
          <p className="text-xs text-avito-neutral-500 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="flex-shrink-0 ml-2">
          {rightContent}
        </div>
      )}
    </Component>
  );
};