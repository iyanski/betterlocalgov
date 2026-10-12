import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from 'lucide-react';
import {
  fundLabel,
  sortProjects,
  type ProjectRecord,
  type ProjectSortKey,
  type SortDirection,
} from '../../lib/projects';
import {
  sourceTypeLabels,
  verificationStatusDetails,
} from '../../lib/contentGovernance';

interface ProjectsTableProps {
  projects: ProjectRecord[];
}

const columns: { key: ProjectSortKey; label: string }[] = [
  { key: 'name', label: 'Project' },
  { key: 'implementingAgency', label: 'Implementing agency' },
  { key: 'fund', label: 'Fund source and year' },
  { key: 'amount', label: 'Amount as stated' },
  { key: 'status', label: 'Status as stated' },
  { key: 'location', label: 'Location as stated' },
];

const NOT_STATED = 'Not stated in the source';

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const [sort, setSort] = useState<{
    key: ProjectSortKey;
    direction: SortDirection;
  }>({ key: 'name', direction: 'asc' });

  const rows = sortProjects(projects, sort.key, sort.direction);

  const toggle = (key: ProjectSortKey) =>
    setSort(current => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <caption className="sr-only">
          National-agency projects located in Gattaran, from the agencies’
          published sources
        </caption>
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => {
              const active = sort.key === column.key;
              const Icon = !active
                ? ArrowUpDown
                : sort.direction === 'asc'
                  ? ArrowUp
                  : ArrowDown;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="px-4 py-3 font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => toggle(column.key)}
                    className="inline-flex items-center gap-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    {column.label}
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
              Contractor
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
              Source and location in source
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white align-top">
          {rows.map(record => {
            const { project, provenance } = record;
            const status =
              verificationStatusDetails[provenance.verificationStatus];
            return (
              <tr key={record.id}>
                <th scope="row" className="px-4 py-3 font-medium text-gray-900">
                  {project.name}
                </th>
                <td className="px-4 py-3">{project.implementingAgency}</td>
                <td className="px-4 py-3">
                  {fundLabel(project) || NOT_STATED}
                </td>
                <td className="px-4 py-3">
                  {project.amount.text}
                  <span className="block text-xs text-gray-600">
                    Source wording: “{project.amount.statement}”
                  </span>
                </td>
                <td className="px-4 py-3">{project.status}</td>
                <td className="px-4 py-3">{project.location}</td>
                <td className="px-4 py-3">
                  {project.contractor ?? NOT_STATED}
                </td>
                <td className="px-4 py-3">
                  {provenance.sources.map(source => (
                    <div key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 underline underline-offset-2 hover:text-primary-900"
                      >
                        {source.title}{' '}
                        <ExternalLink
                          className="inline h-3.5 w-3.5"
                          aria-label="(opens in a new tab)"
                        />
                      </a>
                      <span className="block text-xs">
                        {source.organization} · {sourceTypeLabels[source.type]}
                      </span>
                      {source.locator && (
                        <span className="block text-xs">
                          Location in source: {source.locator}
                        </span>
                      )}
                    </div>
                  ))}
                  <span className="mt-1 block text-xs font-medium">
                    {status.label}
                    {provenance.lastVerifiedAt
                      ? ` · checked ${provenance.lastVerifiedAt}`
                      : ''}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
