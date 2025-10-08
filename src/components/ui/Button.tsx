import { cn } from '../../lib/utils';

const BUTTON_STYLES = {
  primary:
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm px-4 py-2 h-10 shadow-xs bg-primary-600 hover:bg-primary-700 text-white',
  subtle: 'flex items-center text-sm text-gray-600 hover:text-gray-900',
};
const BUTTON_DISABLED_STYLES = {
  primary: 'bg-gray-400 cursor-not-allowed',
  subtle: 'text-gray-400 cursor-not-allowed',
};
const BUTTON_CIRCLE_STYLES = {
  primary:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm w-8 h-8 shadow-xs bg-primary-600 hover:bg-primary-700 text-white',
  subtle:
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm w-8 h-8 shadow-xs hover:bg-gray-300 text-gray-700',
};

export default function Button({
  children,
  onClick,
  appearance = 'primary',
  href,
  target = '_blank',
  disabled = false,
  rel = 'noopener noreferrer',
  icon,
  circle = false,
  className,
}: {
  children?: React.ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  appearance?: 'primary' | 'subtle';
  href?: string;
  target?: string;
  disabled?: boolean;
  rel?: string;
  icon?: React.ReactNode;
  circle?: boolean;
  className?: string;
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
  const finalStyles = `${buttonStyles} ${disabledStyles}`;

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
