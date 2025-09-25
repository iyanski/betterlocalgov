/**
 * Table component with view toggle functionality
 */

import {
  type ReactNode,
  type HTMLAttributes,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { Table, List } from 'lucide-react';
import { type TypographyTheme } from './typographyThemes';

// Helper functions to extract text from React children
const extractTextFromChildren = (children: ReactNode): string[] => {
  const texts: string[] = [];

  const processNode = (node: ReactNode): void => {
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (trimmed) texts.push(trimmed);
    } else if (typeof node === 'number') {
      texts.push(node.toString());
    } else if (Array.isArray(node)) {
      node.forEach(processNode);
    } else if (node && typeof node === 'object' && 'props' in node) {
      const nodeProps = node as { props?: { children?: ReactNode } };
      if (nodeProps.props?.children) {
        processNode(nodeProps.props.children);
      }
    }
  };

  processNode(children);
  return texts;
};

const extractRowsFromChildren = (
  children: ReactNode
): Array<Record<string, string>> => {
  const rows: Array<Record<string, string>> = [];

  const processNode = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(processNode);
    } else if (node && typeof node === 'object' && 'props' in node) {
      const nodeProps = node as {
        props?: { children?: ReactNode; className?: string };
        key?: string;
      };

      // Check if this is a table row (tr element) by key or className
      if (
        nodeProps.key?.includes('tr') ||
        nodeProps.props?.className?.includes('tr')
      ) {
        // Extract text from all direct children (td/th elements)
        const cellTexts = extractTextFromChildren(nodeProps.props?.children);

        if (cellTexts.length > 0) {
          const row: Record<string, string> = {};
          cellTexts.forEach((text, index) => {
            row[`column_${index}`] = text;
          });
          rows.push(row);
        }
      } else if (nodeProps.props?.children) {
        processNode(nodeProps.props.children);
      }
    }
  };

  processNode(children);
  return rows;
};

// Custom Table Component with view toggle
export const TableWithToggle = ({
  children,
  theme,
  ...props
}: {
  children: ReactNode;
  theme: TypographyTheme;
} & HTMLAttributes<HTMLTableElement>) => {
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [isMobile, setIsMobile] = useState(false);

  // Set responsive default view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Set default view based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    } else {
      setViewMode('table');
    }
  }, [isMobile]);

  // Extract table data for list view
  const tableData = useMemo(() => {
    if (viewMode === 'table') return null;

    const rows: Array<Record<string, string>> = [];
    const headers: string[] = [];

    // Parse the table structure from children
    const processTableElement = (element: ReactNode): void => {
      if (
        typeof element === 'object' &&
        element !== null &&
        'props' in element
      ) {
        const elementProps = element as {
          props?: { children?: ReactNode; className?: string };
          key?: string;
        };

        // Check by key first (for thead/tbody elements)
        if (elementProps.key?.includes('thead')) {
          const headerCells = extractTextFromChildren(
            elementProps.props?.children
          );
          headers.push(...headerCells);
        } else if (elementProps.key?.includes('tbody')) {
          const bodyRows = extractRowsFromChildren(
            elementProps.props?.children
          );
          rows.push(...bodyRows);
        } else if (elementProps.key?.includes('tr')) {
          const rowCells = extractTextFromChildren(
            elementProps.props?.children
          );
          if (rowCells.length > 0) {
            const row: Record<string, string> = {};
            rowCells.forEach((text, index) => {
              row[`column_${index}`] = text;
            });
            rows.push(row);
          }
        } else if (elementProps.props?.className?.includes('thead')) {
          const headerCells = extractTextFromChildren(
            elementProps.props.children
          );
          headers.push(...headerCells);
        } else if (elementProps.props?.className?.includes('tbody')) {
          const bodyRows = extractRowsFromChildren(elementProps.props.children);
          rows.push(...bodyRows);
        } else if (elementProps.props?.className?.includes('tr')) {
          const rowCells = extractTextFromChildren(elementProps.props.children);
          if (rowCells.length > 0) {
            const row: Record<string, string> = {};
            rowCells.forEach((text, index) => {
              row[`column_${index}`] = text;
            });
            rows.push(row);
          }
        } else {
          // Recursively process children
          if (elementProps.props?.children) {
            if (Array.isArray(elementProps.props.children)) {
              elementProps.props.children.forEach(child => {
                processTableElement(child);
              });
            } else {
              processTableElement(elementProps.props.children);
            }
          }
        }
      }
    };

    if (Array.isArray(children)) {
      children.forEach(processTableElement);
    } else {
      processTableElement(children);
    }

    // Map row data to headers
    const mappedRows = rows.map(row => {
      const mappedRow: Record<string, string> = {};
      headers.forEach((header, index) => {
        mappedRow[header] = row[`column_${index}`] || '';
      });
      return mappedRow;
    });

    return { headers, rows: mappedRows };
  }, [children, viewMode]);

  return (
    <div className="-mx-4 sm:mx-0 mb-6">
      {/* View Toggle Buttons */}
      <div className="flex justify-end mb-4 gap-2 px-4 sm:px-0">
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Table size={16} />
          Table
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <List size={16} />
          List
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table
            className={`${theme.components.table} sticky-table`}
            style={
              {
                '--first-col-width': '12rem',
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </table>
        </div>
      ) : (
        <div className="space-y-4 px-4 sm:px-0">
          {tableData?.rows && tableData.rows.length > 0 ? (
            tableData.rows.map((row, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mx-2 sm:mx-0"
              >
                <div className="grid gap-3">
                  {tableData.headers.map((header, headerIndex) => (
                    <div
                      key={headerIndex}
                      className="flex flex-col sm:flex-row sm:items-center"
                    >
                      <div className="font-semibold text-gray-800 text-sm mb-1 sm:mb-0 sm:w-1/3 sm:pr-4">
                        {header}:
                      </div>
                      <div className="text-gray-700 text-sm sm:w-2/3">
                        {row[header] || ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-2 sm:mx-0">
              <div className="text-yellow-800 text-sm">
                <strong>Debug Info:</strong>
                <br />
                Headers: {JSON.stringify(tableData?.headers || [])}
                <br />
                Rows: {JSON.stringify(tableData?.rows || [])}
                <br />
                Children type: {typeof children}
                <br />
                Children is array: {Array.isArray(children) ? 'Yes' : 'No'}
                <br />
                Children length:{' '}
                {Array.isArray(children) ? children.length : 'N/A'}
                <br />
                <br />
                <strong>Check browser console for detailed parsing logs</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
