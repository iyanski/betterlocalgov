/**
 * Typography theme configuration for markdown content
 */

export interface TypographyTheme {
  name: string;
  components: {
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    p?: string;
    small?: string;
    ul?: string;
    ol?: string;
    li?: string;
    'li.ordered'?: string; // Special styling for ordered list items
    blockquote?: string;
    code?: string;
    pre?: string;
    a?: string;
    strong?: string;
    em?: string;
    hr?: string;
    table?: string;
    thead?: string;
    tbody?: string;
    tr?: string;
    th?: string;
    td?: string;
  };
}

// Default theme — BetterGov.ph brand (https://bettergov.ph/design):
// Figtree headings, Inter body, Republic Blue links, ruled tables.
export const defaultTheme: TypographyTheme = {
  name: 'default',
  components: {
    h1: 'font-display text-[clamp(32px,5vw,48px)] font-bold leading-[1.08] tracking-[-0.02em] text-ed-ink mb-6 mt-2',
    h2: 'font-display text-[28px] font-bold leading-tight tracking-[-0.01em] text-ed-ink mb-4 mt-10',
    h3: 'font-display text-[22px] font-semibold leading-snug text-ed-ink mb-3 mt-8',
    h4: 'font-display text-lg font-semibold text-ed-ink mb-3 mt-6',
    h5: 'font-display text-base font-semibold text-ed-ink mb-2 mt-5',
    h6: 'eyebrow text-ed-ink-3 mb-2 mt-5',
    p: 'text-[17px] text-ed-ink-2 mb-4 leading-relaxed',
    small: 'text-sm text-ed-ink-2 mb-3',
    ul: 'list-none mb-6 space-y-3 pl-0',
    ol: 'list-none mb-6 space-y-3 pl-0',
    li: 'text-[17px] text-ed-ink-2 leading-relaxed relative pl-6 mb-2 before:content-[""] before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:bg-ed-navy',
    'li.ordered':
      'text-[17px] text-ed-ink-2 leading-relaxed relative pl-8 mb-2 before:content-[counter(list-item)] before:absolute before:left-0 before:font-mono before:text-sm before:font-medium before:text-ed-navy before:counter-increment-[list-item]',
    blockquote:
      'border-l-4 border-ed-navy bg-ed-paper-2 px-6 py-4 mb-6 text-ed-ink-2 text-[17px] leading-relaxed [&>p]:mb-0',
    code: 'bg-ed-paper-2 text-ed-ink px-1.5 py-0.5 text-[0.9em] font-mono border border-ed-rule',
    pre: 'bg-ed-ink text-ed-paper p-4 overflow-x-auto mb-6 font-mono text-sm leading-relaxed',
    a: 'text-ed-navy underline underline-offset-4 decoration-1 hover:decoration-2 font-medium',
    strong: 'font-semibold text-ed-ink',
    em: 'italic',
    hr: 'border-t border-ed-rule my-10',
    table: 'w-full border-collapse border border-ed-rule min-w-max text-left',
    thead: 'bg-ed-paper-2 border-b border-ed-ink',
    tbody: '',
    tr: 'border-b border-ed-rule hover:bg-ed-paper-2 transition-colors',
    th: 'py-3 px-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ed-ink-3 border-r border-ed-rule',
    td: 'py-3 px-5 text-[15px] text-ed-ink-2 border-r border-ed-rule',
  },
};

// Available themes
export const typographyThemes: Record<string, TypographyTheme> = {
  default: defaultTheme,
};

/**
 * Get a typography theme by name
 */
export function getTypographyTheme(
  themeName: string = 'default'
): TypographyTheme {
  return typographyThemes[themeName] || defaultTheme;
}
