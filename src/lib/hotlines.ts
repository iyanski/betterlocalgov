import nationalEmergency from '../../content/hotlines/national-emergency-911.json';
import gattaranEmergencyHospital from '../../content/hotlines/gattaran-emergency-hospital.json';
import cagayanPdrrmo from '../../content/hotlines/cagayan-pdrrmo.json';
import {
  isPubliclyVisible,
  type ContentProvenance,
  type PublicationStatus,
} from './contentGovernance';
import { contentGovernanceConfig } from '../config/contentGovernance';

export interface HotlineRecord {
  id: string;
  name: string;
  phone: string;
  displayPhone: string;
  category: string;
  publicationStatus: PublicationStatus;
  provenance: ContentProvenance;
}

const hotlineRecords: HotlineRecord[] = [
  { id: 'national-emergency-911', ...nationalEmergency },
  { id: 'gattaran-emergency-hospital', ...gattaranEmergencyHospital },
  { id: 'cagayan-pdrrmo', ...cagayanPdrrmo },
] as HotlineRecord[];

export function hasValidTelephoneValue(value: string): boolean {
  return /^\+?\d{3,15}$/.test(value);
}

export function getPublicHotlines(
  records: HotlineRecord[] = hotlineRecords
): HotlineRecord[] {
  return records.filter(
    record =>
      hasValidTelephoneValue(record.phone) &&
      record.provenance.sources.length > 0 &&
      Boolean(record.provenance.lastVerifiedAt) &&
      isPubliclyVisible(
        record.publicationStatus,
        record.provenance.verificationStatus,
        contentGovernanceConfig.allowSourcedContent
      )
  );
}

export const publicHotlines = getPublicHotlines();
