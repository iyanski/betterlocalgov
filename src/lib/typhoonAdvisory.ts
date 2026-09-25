/**
 * Sitewide typhoon / severe-weather advisory banner data source.
 *
 * PAGASA (the Philippines' official weather agency) does not publish a
 * public API or feed for tropical cyclone bulletins, so this uses
 * GDACS (Global Disaster Alert and Coordination System) — a free,
 * official, no-key-required feed run by the EU Joint Research Centre
 * with UN OCHA. GDACS gives a general regional severity level, not
 * PAGASA's local wind-signal number, so the banner links out to
 * PAGASA for the authoritative local advisory. See docs/plan/09-*.
 */

const GDACS_EVENT_LIST_URL =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=TC&alertlevel=orange;red';

export type AdvisoryAlertLevel = 'Orange' | 'Red';

export interface TyphoonAdvisory {
  /** Stable id for dismiss/session tracking: `${eventId}-${alertLevel}`. */
  id: string;
  eventId: number;
  name: string;
  alertLevel: AdvisoryAlertLevel;
  severityText: string;
  fromDate: string;
  toDate: string;
  reportUrl: string;
}

interface GdacsCountryRef {
  iso3?: string;
  countryname?: string;
}

interface GdacsFeatureProperties {
  eventid: number;
  eventname?: string;
  name?: string;
  alertlevel?: string;
  episodealertlevel?: string;
  fromdate?: string;
  todate?: string;
  affectedcountries?: GdacsCountryRef[];
  severitydata?: { severitytext?: string };
  url?: { report?: string; details?: string };
}

interface GdacsFeature {
  properties: GdacsFeatureProperties;
}

interface GdacsFeatureCollection {
  features?: GdacsFeature[];
}

function isPhilippinesAffected(
  countries: GdacsCountryRef[] | undefined
): boolean {
  if (!countries) return false;
  return countries.some(
    country => country.iso3 === 'PHL' || country.countryname === 'Philippines'
  );
}

function normalizeAlertLevel(
  raw: string | undefined
): AdvisoryAlertLevel | null {
  const level = raw?.trim().toLowerCase();
  if (level === 'orange') return 'Orange';
  if (level === 'red') return 'Red';
  return null;
}

/**
 * Fetches active tropical cyclone advisories (Orange/Red only — Green
 * is too noisy for a sitewide banner) that GDACS lists as affecting
 * the Philippines. Returns the most severe one, or null if none.
 */
export async function fetchActiveTyphoonAdvisory(
  signal?: AbortSignal
): Promise<TyphoonAdvisory | null> {
  const response = await fetch(GDACS_EVENT_LIST_URL, { signal });

  if (!response.ok) {
    throw new Error(`GDACS request failed with status ${response.status}`);
  }

  const data = (await response.json()) as GdacsFeatureCollection;
  const features = data.features ?? [];

  const advisories: TyphoonAdvisory[] = [];

  for (const feature of features) {
    const props = feature.properties;
    if (!isPhilippinesAffected(props.affectedcountries)) continue;

    const alertLevel = normalizeAlertLevel(
      props.episodealertlevel ?? props.alertlevel
    );
    if (!alertLevel) continue;

    advisories.push({
      id: `${props.eventid}-${alertLevel}`,
      eventId: props.eventid,
      name: props.eventname ?? props.name ?? 'Tropical Cyclone',
      alertLevel,
      severityText: props.severitydata?.severitytext ?? 'Tropical Cyclone',
      fromDate: props.fromdate ?? '',
      toDate: props.todate ?? '',
      reportUrl:
        props.url?.report ?? props.url?.details ?? 'https://www.gdacs.org/',
    });
  }

  if (advisories.length === 0) return null;

  // Red outranks Orange when more than one system is active.
  advisories.sort((a, b) =>
    a.alertLevel === b.alertLevel ? 0 : a.alertLevel === 'Red' ? -1 : 1
  );

  return advisories[0];
}
