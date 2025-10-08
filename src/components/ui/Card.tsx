import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card = ({
  children,
  className,
  hoverable = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden',
        hoverable &&
          'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        className
      )}
      role="article"
      aria-label="Service card"
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn(
        'p-4 md:p-6 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      role="heading"
      aria-level={2}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardContent = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div
      className={cn('p-4 md:p-6', className)}
      role="region"
      aria-label="Service details"
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = ({ children, className, ...props }: CardFooterProps) => {
  return (
    <div
      className={cn(
        'p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardTitle = ({ children, className, ...props }: CardTitleProps) => {
  return (
    <div
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

const CardImage = ({ className, ...props }: CardImageProps) => {
  return (
    <div className="relative w-full h-48 overflow-hidden">
      <img
        className={cn('w-full h-full object-cover', className)}
        {...props}
        alt={props.alt || 'Card image'}
      />
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter, CardImage, CardTitle };
