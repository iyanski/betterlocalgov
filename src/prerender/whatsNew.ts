import revisionsFile from '../../governance/revisions.json';
import {
  buildWhatsNew,
  type PublicTarget,
  type Revision,
  type WhatsNewData,
} from '../lib/whatsNew';
import type { PublicContentInput, PublicRoute } from './publicRoutes';

/**
 * Maps repository content IDs to the public page that shows them. Only
 * records that survived the visibility policy are present, so revisions of
 * drafts and blocked records cannot be listed.
 */
export function collectPublicTargets(
  routes: PublicRoute[],
  input: PublicContentInput
): Map<string, PublicTarget> {
  const targets = new Map<string, PublicTarget>();

  for (const route of routes) {
    if (route.kind === 'document') {
      targets.set(route.path.slice(1), {
        title: route.title,
        path: route.path,
      });
    }
  }
  for (const hotline of input.hotlines) {
    targets.set(`hotlines/${hotline.id}`, {
      title: hotline.name,
      path: `/hotlines#${hotline.id}`,
    });
  }
  for (const record of input.projects) {
    targets.set(`projects/${record.id}`, {
      title: record.project.name,
      path: '/government/projects',
    });
  }
  for (const request of input.foiRequests) {
    targets.set(`requests/${request.id}`, {
      title: request.subject,
      path: '/foi-requests',
    });
  }
  return targets;
}

export function buildSiteWhatsNew(
  routes: PublicRoute[],
  input: PublicContentInput,
  revisions: Revision[] = revisionsFile.revisions as Revision[]
): WhatsNewData {
  return buildWhatsNew(revisions, collectPublicTargets(routes, input));
}
