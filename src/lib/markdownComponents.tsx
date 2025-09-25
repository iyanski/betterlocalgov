/**
 * ReactMarkdown components with configurable typography themes
 */

import { type TypographyTheme } from './typographyThemes';
import { type ReactNode, type HTMLAttributes } from 'react';
import { TableWithToggle } from './TableWithToggle';

// Extended theme type to include dynamic component keys
type ExtendedTheme = TypographyTheme & {
  components: TypographyTheme['components'] & {
    [key: string]: string | undefined;
  };
};

/**
 * Creates ReactMarkdown components with custom styling based on typography theme
 */
export function createMarkdownComponents(theme: TypographyTheme) {
  const extendedTheme = theme as ExtendedTheme;
  return {
    h1: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={theme.components.h1} {...props}>
        {children}
      </h1>
    ),
    h2: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className={theme.components.h2} {...props}>
        {children}
      </h2>
    ),
    h3: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className={theme.components.h3} {...props}>
        {children}
      </h3>
    ),
    h4: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className={theme.components.h4} {...props}>
        {children}
      </h4>
    ),
    h5: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h5 className={theme.components.h5} {...props}>
        {children}
      </h5>
    ),
    h6: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
      <h6 className={theme.components.h6} {...props}>
        {children}
      </h6>
    ),
    p: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) => (
      <p className={theme.components.p} {...props}>
        {children}
      </p>
    ),
    small: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <small className={theme.components.small} {...props}>
        {children}
      </small>
    ),
    ul: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLUListElement>) => {
      // Debug: Log what we're getting
      console.log('UL Component - Props:', props);
      console.log('UL Component - Children:', children);

      // Check if this ul contains task list items
      const hasTaskItems =
        Array.isArray(children) &&
        children.some(
          child =>
            typeof child === 'object' &&
            child?.props?.className?.includes('task-list-item')
        );

      console.log('Has Task Items:', hasTaskItems);

      // For task lists, don't wrap with ul - just return children directly
      if (hasTaskItems) {
        return <>{children}</>;
      }

      // For regular lists, use the theme styling
      return (
        <ul className={theme.components.ul} {...props}>
          {children}
        </ul>
      );
    },
    ol: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLOListElement>) => (
      <ol
        className={`${theme.components.ol} [counter-reset:list-item]`}
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLLIElement>) => {
      // Check if this is a nested list item
      const isNested = props.className?.includes('nested') || false;

      // Use the appropriate li class based on context
      const liClass = theme.components.li || '';
      const orderedLiClass = extendedTheme.components['li.ordered'] || liClass;
      const taskLiClass =
        extendedTheme.components['li.task-list-item'] || liClass;

      // Detect if this is a task list item
      const isTaskList = props.className?.includes('task-list-item');

      // For now, we'll use a simple approach - detect if parent is ol
      // This is a simplified approach - in a real implementation, you might want to use React context
      const isOrderedList = props.className?.includes('ordered') || false;

      const finalClassName = isTaskList
        ? taskLiClass
        : isOrderedList
          ? orderedLiClass
          : liClass;

      // For task lists, replace checkbox with emoji
      if (isTaskList) {
        const processedChildren = Array.isArray(children)
          ? children.map((child: ReactNode) => {
              if (
                typeof child === 'object' &&
                child !== null &&
                'props' in child
              ) {
                const childElement = child as { props?: { type?: string } };
                if (childElement.props?.type === 'checkbox') {
                  // Replace checkbox with emoji
                  return '✅';
                }
              }
              return child;
            })
          : children;

        return (
          <li
            className={`${finalClassName} ${isNested ? 'ml-4' : ''}`}
            {...props}
          >
            <span className="pr-0">✅</span>
            {Array.isArray(processedChildren)
              ? processedChildren.filter((child: ReactNode) => child !== '✅')
              : processedChildren}
          </li>
        );
      }

      return (
        <li
          className={`${finalClassName} ${isNested ? 'ml-4' : ''}`}
          {...props}
        >
          {children}
        </li>
      );
    },
    blockquote: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className={theme.components.blockquote} {...props}>
        {children}
      </blockquote>
    ),
    code: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    } & HTMLAttributes<HTMLElement>) => {
      // Check if it's inline code or code block
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code className={theme.components.code} {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLPreElement>) => (
      <pre className={theme.components.pre} {...props}>
        {children}
      </pre>
    ),
    a: ({
      children,
      href,
      ...props
    }: {
      children?: ReactNode;
      href?: string;
    } & HTMLAttributes<HTMLAnchorElement>) => {
      // Check if it's an external link
      const isExternal =
        href && (href.startsWith('http://') || href.startsWith('https://'));

      return (
        <a
          href={href}
          className={theme.components.a}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
    strong: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <strong className={theme.components.strong} {...props}>
        {children}
      </strong>
    ),
    em: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <em className={theme.components.em} {...props}>
        {children}
      </em>
    ),
    hr: ({ ...props }: HTMLAttributes<HTMLHRElement>) => (
      <hr className={theme.components.hr} {...props} />
    ),
    table: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableElement>) => (
      <TableWithToggle theme={theme} {...props}>
        {children}
      </TableWithToggle>
    ),
    thead: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className={theme.components.thead} {...props}>
        {children}
      </thead>
    ),
    tbody: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className={theme.components.tbody} {...props}>
        {children}
      </tbody>
    ),
    tr: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableRowElement>) => (
      <tr className={theme.components.tr} {...props}>
        {children}
      </tr>
    ),
    th: ({
      children,
      ...props
    }: {
      children?: ReactNode;
    } & HTMLAttributes<HTMLTableHeaderCellElement>) => (
      <th className={theme.components.th} {...props}>
        {children}
      </th>
    ),
    td: ({
      children,
      ...props
    }: { children?: ReactNode } & HTMLAttributes<HTMLTableDataCellElement>) => (
      <td className={theme.components.td} {...props}>
        {children}
      </td>
    ),
  };
}
