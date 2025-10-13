import { cn } from '../../lib/utils';

const BUTTON_STYLES = {
  primary:
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm px-4 py-2 h-10 shadow-xs bg-primary-600 hover:bg-primary-700 text-white',
  secondary:
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm px-4 py-2 h-10 shadow-xs bg-green-600 hover:bg-green-700 text-white',
  subtle: 'flex items-center text-sm text-gray-600 hover:text-gray-900',
  ghost:
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm px-4 py-2 h-10 shadow-xs border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300',
};
const BUTTON_DISABLED_STYLES = {
  primary: 'bg-gray-400 cursor-not-allowed',
  secondary: 'bg-gray-400 cursor-not-allowed',
  subtle: 'text-gray-400 cursor-not-allowed',
  ghost:
    'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700',
};
const BUTTON_CIRCLE_STYLES = {
  primary:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm w-8 h-8 shadow-xs bg-primary-600 hover:bg-primary-700 text-white',
  secondary:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm w-8 h-8 shadow-xs bg-green-600 hover:bg-green-700 text-white',
  subtle:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm w-8 h-8 shadow-xs hover:bg-gray-300 text-gray-700',
  ghost:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm w-8 h-8 shadow-xs border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300',
};

const BUTTON_COLOR_STYLES = {
  green: 'bg-green-600 hover:bg-green-700 text-white',
  blue: 'bg-blue-600 hover:bg-blue-700 text-white',
  red: 'bg-red-600 hover:bg-red-700 text-white',
};

const GHOST_COLOR_STYLES = {
  green:
    'border-green-300 text-green-700 dark:border-gray-600 dark:text-green-400',
  blue: 'border-blue-300 text-blue-700 dark:border-gray-600 dark:text-blue-400',
  red: 'border-red-300 text-red-700 dark:border-gray-600 dark:text-red-400',
};

export default function Button({
  children,
  onClick,
  appearance = 'primary',
  block = false,
  href,
  target = '_blank',
  disabled = false,
  rel = 'noopener noreferrer',
  icon,
  circle = false,
  className,
  color = 'blue',
}: {
  children?: React.ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  appearance?: 'primary' | 'secondary' | 'subtle' | 'ghost';
  block?: boolean;
  href?: string;
  target?: string;
  disabled?: boolean;
  rel?: string;
  icon?: React.ReactNode;
  circle?: boolean;
  className?: string;
  color?: 'green' | 'blue' | 'red';
}) {
  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };
  const buttonStyles = circle
    ? BUTTON_CIRCLE_STYLES[appearance]
    : BUTTON_STYLES[appearance];
  const disabledStyles = disabled ? BUTTON_DISABLED_STYLES[appearance] : '';

  // Apply color-specific styles
  let colorStyles = '';
  if (appearance === 'ghost') {
    colorStyles = GHOST_COLOR_STYLES[color] || GHOST_COLOR_STYLES.blue;
  } else {
    colorStyles = BUTTON_COLOR_STYLES[color] || BUTTON_COLOR_STYLES.blue;
  }

  const finalStyles = `${buttonStyles} ${disabledStyles} ${block ? 'w-full' : ''} ${colorStyles}`;

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        className={cn(finalStyles, className)}
        onClick={e => handleClick(e)}
        aria-disabled={disabled}
      >
        {children}
      </a>
    );
  }

  if (icon) {
    return (
      <button
        className={cn(finalStyles, className)}
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {icon}
        {children}
      </button>
    );
  }
  return (
    <button
      className={cn(finalStyles, className)}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
