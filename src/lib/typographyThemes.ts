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

// Default theme with Tailwind classes and dark mode support
export const defaultTheme: TypographyTheme = {
  name: 'default',
  components: {
    h1: 'text-3xl font-bold mb-6 mt-2 text-gray-900 dark:text-white',
    h2: 'text-2xl font-semibold mb-4 mt-10 text-gray-900 dark:text-white',
    h3: 'text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4 mt-6',
    h4: 'text-xl text-gray-800 dark:text-gray-200 mb-3 mt-5',
    h5: 'text-lg text-gray-800 dark:text-gray-200 mb-3 mt-4',
    h6: 'text-base text-gray-800 dark:text-gray-200 mb-3 mt-4',
    p: 'text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed',
    small: 'text-sm text-gray-600 dark:text-gray-400 mb-3',
    ul: 'list-none mb-6 space-y-4 pl-0',
    ol: 'list-none mb-6 space-y-4 pl-0',
    li: 'text-base text-gray-700 dark:text-gray-300 leading-relaxed relative pl-6 mb-2 before:content-["•"] before:absolute before:left-0 before:text-gray-700 dark:before:text-gray-300 before:font-bold before:text-lg',
    'li.ordered':
      'text-base text-gray-700 dark:text-gray-300 leading-relaxed relative pl-8 mb-2 before:content-[counter(list-item)] before:absolute before:left-0 before:text-gray-700 dark:before:text-gray-300 before:font-bold before:text-base before:counter-increment-[list-item]',
    blockquote:
      'border-l-4 border-blue-600 dark:border-blue-400 pl-6 py-4 mb-6 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic text-base leading-relaxed',
    code: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono border border-gray-200 dark:border-gray-700',
    pre: 'bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto mb-6 border border-gray-700 dark:border-gray-600 font-mono text-sm leading-relaxed',
    a: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors duration-200',
    strong: 'font-bold text-gray-900 dark:text-white',
    em: 'italic text-gray-700 dark:text-gray-300',
    hr: 'border-t-2 border-gray-300 dark:border-gray-600 my-8',
    table:
      'w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden min-w-max',
    thead: 'bg-gray-50 dark:bg-gray-800',
    tbody: '',
    tr: 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors [&:hover_td:first-child]:bg-gray-100 dark:[&:hover_td:first-child]:bg-gray-800',
    th: 'text-left py-4 px-6 font-semibold text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600 text-base',
    td: 'py-4 px-6 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 text-base',
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
