import { cn } from '../../lib/utils';

const STACK_STYLES = 'flex flex-col gap-2';
const STACK_DIRECTION = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
};
const STACK_JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};
const STACK_ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  between: 'items-between',
  around: 'items-around',
};
const STACK_WRAP = {
  noWrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  wrapReverse: 'flex-wrap-reverse',
};
const STACK_GAP = {
  none: 'gap-0',
  small: 'gap-1',
  medium: 'gap-2',
  large: 'gap-3',
  xlarge: 'gap-4',
};

export default function Stack({
  children,
  className,
  direction = 'horizontal',
  gap = 'medium',
  justify = 'start',
  align = 'start',
  wrap = 'noWrap',
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: 'noWrap' | 'wrap' | 'wrapReverse';
}) {
  return (
    <div
      className={cn(
        STACK_STYLES,
        STACK_DIRECTION[direction],
        STACK_GAP[gap],
        STACK_JUSTIFY[justify],
        STACK_ALIGN[align],
        STACK_WRAP[wrap],
        className
      )}
    >
      {children}
    </div>
  );
}
