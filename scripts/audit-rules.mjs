/**
 * Pure audit rules shared by scripts/audit-content.mjs and its tests.
 * Visibility rules and national source types come from the shared policy in
 * scripts/lib/visibility.mjs, which the app also uses.
 */
import { NATIONAL_SOURCE_TYPES } from './lib/visibility.mjs';

export const contentScopes = ['local', 'national_applicable'];
export const nationalSourceTypes = NATIONAL_SOURCE_TYPES;

/** Returns error messages (without a file prefix) for scope-related rules. */
export function validateScope(record) {
  const errors = [];
  const scope = record.scope ?? 'local';
  if (!contentScopes.includes(scope)) {
    errors.push(`invalid scope "${scope}"`);
    return errors;
  }
  if (scope === 'national_applicable') {
    const sources = record.provenance?.sources ?? [];
    if (!sources.some(source => nationalSourceTypes.includes(source.type))) {
      errors.push(
        'national_applicable content must cite at least one national_government or official_government_publication source'
      );
    }
  }
  return errors;
}

/** Returns error messages for locator rules on figures-bearing records. */
export function validateLocators(record) {
  const errors = [];
  if (record.containsFigures !== true) return errors;
  const sources = record.provenance?.sources ?? [];
  if (sources.length === 0) {
    errors.push('containsFigures content needs at least one source');
  }
  sources.forEach((source, index) => {
    if (typeof source.locator !== 'string' || !source.locator.trim()) {
      errors.push(`source ${index + 1} needs a locator (containsFigures)`);
    }
  });
  return errors;
}

const nonEmpty = value => typeof value === 'string' && value.trim() !== '';

/** Returns error messages for a content/projects/*.json record. */
export function validateProject(record) {
  const errors = [];
  const project = record.project;
  if (!project || typeof project !== 'object') {
    return ['project record needs a "project" object'];
  }
  for (const field of ['name', 'implementingAgency', 'status', 'location']) {
    if (!nonEmpty(project[field])) errors.push(`project.${field} is required`);
  }
  const amount = project.amount;
  if (
    !amount ||
    !nonEmpty(amount.text) ||
    !nonEmpty(amount.statement) ||
    typeof amount.value !== 'number' ||
    !Number.isFinite(amount.value)
  ) {
    errors.push(
      'project.amount needs text, a numeric value and the source statement'
    );
  }
  if (project.contractor !== undefined && !nonEmpty(project.contractor)) {
    errors.push('project.contractor must be omitted when the source has none');
  }
  if (record.containsFigures !== true) {
    errors.push('project records must set containsFigures to true');
  }
  if (record.scope !== undefined && record.scope !== 'local') {
    errors.push('project records must have local scope');
  }
  return errors;
}

const foiChannels = ['efoi', 'letter', 'email'];
const foiStatuses = [
  'pending',
  'acknowledged',
  'granted',
  'partially_granted',
  'denied',
  'no_response',
];
const isoDate = value =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Returns error messages for a content/requests/** record. */
export function validateRequest(record) {
  const errors = [];
  const request = record.request;
  if (!request || typeof request !== 'object') {
    return ['request record needs a "request" object'];
  }
  for (const field of ['agency', 'subject']) {
    if (!nonEmpty(request[field])) errors.push(`request.${field} is required`);
  }
  if (!foiChannels.includes(request.channel)) {
    errors.push(`request.channel must be one of ${foiChannels.join(', ')}`);
  }
  if (!foiStatuses.includes(request.status)) {
    errors.push(`request.status must be one of ${foiStatuses.join(', ')}`);
  }
  if (record.publicationStatus === 'published' && !isoDate(request.dateSent)) {
    errors.push('published requests need request.dateSent (YYYY-MM-DD)');
  }
  if (request.dateSent !== undefined && !isoDate(request.dateSent)) {
    errors.push('request.dateSent must be YYYY-MM-DD');
  }
  if (request.responseDate !== undefined && !isoDate(request.responseDate)) {
    errors.push('request.responseDate must be YYYY-MM-DD');
  }
  if (
    request.publicRequestUrl !== undefined &&
    !/^https?:\/\//.test(request.publicRequestUrl)
  ) {
    errors.push('request.publicRequestUrl must be an http(s) URL');
  }
  if (record.publicationStatus !== 'published' && request.dateSent) {
    errors.push('unpublished seed requests must not carry a sent date');
  }
  return errors;
}
