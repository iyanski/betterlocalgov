/**
 * Shared emergency hotline directory for Aparri.
 *
 * Single source of truth reused by the Navbar's quick strip and the
 * homepage's "Emergency & Quick Hotlines" section, so numbers only
 * need to be updated in one place.
 */
export interface Hotline {
  label: string;
  number: string;
  icon: string;
  description?: string;
}

export const emergencyHotlines: Hotline[] = [
  {
    label: 'MDRRMO',
    number: '09566542894',
    icon: 'ri-alarm-warning-line',
    description: 'Disaster & risk reduction',
  },
  {
    label: 'Police Station',
    number: '09172302003',
    icon: 'ri-police-badge-line',
    description: 'Police',
  },
  {
    label: 'Fire Station',
    number: '09164910946',
    icon: 'ri-fire-line',
    description: 'Fire protection',
  },
  {
    label: 'Coast Guard',
    number: '09568301802',
    icon: 'ri-ship-2-line',
    description: 'Coast guard',
  },
  {
    label: 'Provincial Hospital',
    number: '09363748430',
    icon: 'ri-hospital-line',
    description: 'Medical emergencies',
  },
  {
    label: 'RHU-East',
    number: '09531908364',
    icon: 'ri-first-aid-kit-line',
    description: 'Rural Health Unit (East)',
  },
  {
    label: 'RHU-West',
    number: '09359519786',
    icon: 'ri-first-aid-kit-line',
    description: 'Rural Health Unit (West)',
  },
];

export const primaryEmergencyHotlines = emergencyHotlines.filter(item =>
  ['MDRRMO', 'PNP', 'BFP'].includes(item.label)
);

export const secondaryEmergencyHotlines = emergencyHotlines.filter(
  item => !primaryEmergencyHotlines.includes(item)
);
