import { useMemo } from 'react';
import { useQueryState } from 'nuqs';

export interface Column<R> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  /** Cell renderer. Numbers should come back already formatted. */
  render?: (row: R) => React.ReactNode;
  /** Sort value. Defaults to `row[key]`. */
  sortValue?: (row: R) => string | number | null;
  /** Dimmed, for a derived column like a percentage share. */
  muted?: boolean;
}

/**
 * The table under the chart.
 *
 * Every chart on this site is a lossy summary of a table that exists, and for
 * a reader who wants the actual figures the table IS the content -- so it is a
 * real `<table>` with a real `<caption>`, not a grid of divs.
 *
 * Sorting, when enabled, is held in the URL via nuqs so a sorted view can be
 * linked to. That matters for a public-records site: "sorted by unobligated
 * allotments, descending" is frequently the whole point of someone's link.
 */
export default function DataTable<R extends object>({
  columns,
  rows,
  caption,
  rowKey,
  sortable = false,
  sortParam = 'sort',
  sticky = false,
  initialSort,
}: {
  columns: Column<R>[];
  rows: R[];
  /** Visually hidden unless you also pass a visible heading above. */
  caption?: string;
  rowKey: (row: R, i: number) => string;
  sortable?: boolean;
  /** Query-string key, so two tables on one page do not fight. */
  sortParam?: string;
  sticky?: boolean;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
}) {
  const [sort, setSort] = useQueryState(sortParam);

  const active = useMemo(() => {
    const raw =
      sort ?? (initialSort ? `${initialSort.key}:${initialSort.dir}` : null);
    if (!raw) return null;
    const [key, dir] = raw.split(':');
    if (!columns.some(c => c.key === key)) return null;
    return { key, dir: dir === 'asc' ? 'asc' : ('desc' as 'asc' | 'desc') };
  }, [sort, initialSort, columns]);

  const sorted = useMemo(() => {
    if (!active) return rows;
    const col = columns.find(c => c.key === active.key);
    if (!col) return rows;
    const value = (r: R) =>
      col.sortValue
        ? col.sortValue(r)
        : (r as Record<string, unknown>)[col.key];

    return [...rows].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      // Nulls sink, whichever direction is asked for: a missing figure is not
      // a small one, and it should never top a ranking.
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      return active.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, active]);

  const toggle = (key: string) => {
    const dir =
      active && active.key === key && active.dir === 'desc' ? 'asc' : 'desc';
    setSort(`${key}:${dir}`);
  };

  const head =
    'border-b border-gray-200 py-2 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-gray-400';

  return (
    <div className={`overflow-x-auto${sticky ? ' sticky-table' : ''}`}>
      <table className="mt-2 w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c, i) => {
              const align = c.align === 'right' ? 'text-right' : 'text-left';
              const pad = i < columns.length - 1 ? ' pr-3' : '';
              const isActive = active?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={`${head} ${align}${pad}`}
                  aria-sort={
                    isActive
                      ? active.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className="uppercase tracking-[0.1em] hover:text-gray-700"
                    >
                      {c.label}
                      {isActive ? (active.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c, j) => {
                const align = c.align === 'right' ? 'text-right' : 'text-left';
                const pad = j < columns.length - 1 ? ' pr-3' : '';
                const numeric =
                  c.align === 'right' ? ' font-mono tabular-nums' : '';
                const tone = c.muted ? 'text-gray-400' : 'text-gray-700';
                return (
                  <td
                    key={c.key}
                    className={`border-b border-gray-100 py-2 ${align}${pad}${numeric} ${tone}`}
                  >
                    {c.render
                      ? c.render(row)
                      : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
