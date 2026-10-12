import {
  collectPublicRoutes,
  loadDefaultInput,
  type PublicContentInput,
  type PublicRoute,
} from './publicRoutes';
import { renderRouteBody, type RenderContext } from './render';
import { applyTemplate, buildRobots, buildSitemap } from './seo';
import { buildSiteWhatsNew } from './whatsNew';
import {
  WHATS_NEW_DESCRIPTION,
  WHATS_NEW_TITLE,
  type WhatsNewData,
} from '../lib/whatsNew';

export interface PrerenderOutput {
  /** Relative file path inside the build directory, e.g. `services/index.html`. */
  file: string;
  html: string;
}

export function fileForPath(path: string): string {
  return path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`;
}

export function prerenderRoutes(
  routes: PublicRoute[],
  template: string,
  context: RenderContext = {}
): PrerenderOutput[] {
  return routes.map(route => ({
    file: fileForPath(route.path),
    html: applyTemplate(template, route, renderRouteBody(route, context)),
  }));
}

function whatsNewRoute(data: WhatsNewData): PublicRoute {
  return {
    path: '/whats-new',
    kind: 'whats-new',
    title: WHATS_NEW_TITLE,
    description: WHATS_NEW_DESCRIPTION,
    lastModified: data.lastUpdated,
  };
}

export async function buildPrerender(
  template: string,
  input?: PublicContentInput
) {
  const resolved = input ?? (await loadDefaultInput());
  const contentRoutes = collectPublicRoutes(resolved);
  const whatsNew = buildSiteWhatsNew(contentRoutes, resolved);
  const routes = [...contentRoutes, whatsNewRoute(whatsNew)];

  return {
    routes,
    pages: prerenderRoutes(routes, template, { whatsNew }),
    sitemap: buildSitemap(routes),
    robots: buildRobots(),
    whatsNew,
  };
}
