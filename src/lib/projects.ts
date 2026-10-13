import { isRecordPublic, type ContentProvenance } from './contentGovernance';
import { parseProvenanceData } from './markdownLoader';
import { contentGovernanceConfig } from '../config/contentGovernance';

export interface ProjectAmount {
  /** The figure exactly as the source writes it, e.g. "P50 million". */
  text: string;
  /** The same figure in pesos, used only for sorting. */
  value: number;
  /** The source's own wording around the figure. */
  statement: string;
}

export interface ProjectDetails {
  name: string;
  implementingAgency: string;
  fundSource?: string;
  fundYear?: string;
  amount: ProjectAmount;
  /** Company name only, and only when the source names one. */
  contractor?: string;
  /** Status in the source's words. */
  status: string;
  /** Barangay or location in the source's words. */
  location: string;
}

export interface ProjectRecord {
  id: string;
  publicationStatus: 'draft' | 'published' | 'archived';
  scope: 'local';
  provenance: ContentProvenance;
  project: ProjectDetails;
}

export type ProjectSortKey =
  'name' | 'implementingAgency' | 'fund' | 'amount' | 'status' | 'location';

export type SortDirection = 'asc' | 'desc';

const projectFiles = import.meta.glob('/content/projects/*.json', {
  import: 'default',
  eager: true,
}) as Record<string, Record<string, unknown>>;

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Returns a record only when every required field is present and typed. */
export function parseProjectRecord(
  id: string,
  data: Record<string, unknown>
): ProjectRecord | undefined {
  const project = data.project as Record<string, unknown> | undefined;
  const amount = project?.amount as Record<string, unknown> | undefined;
  const provenance = parseProvenanceData(data.provenance);
  const publicationStatus = data.publicationStatus;
  if (
    !project ||
    !amount ||
    !provenance ||
    (publicationStatus !== 'draft' &&
      publicationStatus !== 'published' &&
      publicationStatus !== 'archived')
  ) {
    return undefined;
  }

  const name = text(project.name);
  const implementingAgency = text(project.implementingAgency);
  const status = text(project.status);
  const location = text(project.location);
  const amountText = text(amount.text);
  const statement = text(amount.statement);
  if (
    !name ||
    !implementingAgency ||
    !status ||
    !location ||
    !amountText ||
    !statement ||
    typeof amount.value !== 'number' ||
    !Number.isFinite(amount.value)
  ) {
    return undefined;
  }

  return {
    id,
    publicationStatus,
    scope: 'local',
    provenance,
    project: {
      name,
      implementingAgency,
      fundSource: text(project.fundSource),
      fundYear: text(project.fundYear),
      amount: { text: amountText, value: amount.value, statement },
      contractor: text(project.contractor),
      status,
      location,
    },
  };
}

export function getPublicProjects(
  records: ProjectRecord[],
  allowSourced = contentGovernanceConfig.allowSourcedContent
): ProjectRecord[] {
  return records.filter(
    record =>
      record.provenance.sources.length > 0 &&
      record.provenance.sources.every(source => Boolean(source.locator)) &&
      isRecordPublic(record, allowSourced)
  );
}

function fundLabel(project: ProjectDetails): string {
  return [project.fundYear, project.fundSource].filter(Boolean).join(' ');
}

export function sortProjects(
  records: ProjectRecord[],
  key: ProjectSortKey,
  direction: SortDirection = 'asc'
): ProjectRecord[] {
  const factor = direction === 'asc' ? 1 : -1;
  const compare = (a: ProjectRecord, b: ProjectRecord): number => {
    switch (key) {
      case 'amount':
        return a.project.amount.value - b.project.amount.value;
      case 'fund':
        return fundLabel(a.project).localeCompare(fundLabel(b.project));
      default:
        return a.project[key].localeCompare(b.project[key]);
    }
  };
  return [...records].sort((a, b) => factor * compare(a, b));
}

export { fundLabel };

const allProjects = Object.entries(projectFiles).flatMap(([path, data]) => {
  const id = path.replace(/^\/content\/projects\//, '').replace(/\.json$/, '');
  const record = parseProjectRecord(id, data);
  return record ? [record] : [];
});

export const publicProjects = getPublicProjects(allProjects);
