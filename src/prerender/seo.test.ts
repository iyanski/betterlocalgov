import { describe, expect, it } from 'vitest';
import { applyTemplate, buildHeadTags, buildRobots, buildSitemap } from './seo';
import { fileForPath } from './index';

const route = {
  path: '/hotlines',
  title: 'Verified emergency hotlines',
  description: 'Contacts with "sources" & <tags>.',
};

describe('buildHeadTags', () => {
  it('emits title, description, canonical and Open Graph tags', () => {
    const head = buildHeadTags(route);

    expect(head).toContain(
      '<title data-rh="true">Verified emergency hotlines | Better Gattaran</title>'
    );
    expect(head).toContain(
      'name="description" content="Contacts with &quot;sources&quot; &amp; &lt;tags&gt;."'
    );
    expect(head).toContain(
      'rel="canonical" href="https://bettergattaran.org/hotlines"'
    );
    expect(head).toContain(
      'property="og:url" content="https://bettergattaran.org/hotlines"'
    );
    expect(head).toContain(
      'property="og:image" content="https://bettergattaran.org/bettergattaran.png"'
    );
    expect(head).toContain('property="og:title"');
    expect(head).toContain('property="og:description"');
  });
});

describe('sitemap and robots', () => {
  it('lists exactly the routes it is given', () => {
    const xml = buildSitemap([
      { path: '/' },
      { path: '/hotlines', lastModified: '2026-09-23' },
    ]);

    expect(xml).toContain('<loc>https://bettergattaran.org/</loc>');
    expect(xml).toContain(
      '<loc>https://bettergattaran.org/hotlines</loc>\n    <lastmod>2026-09-23</lastmod>'
    );
    expect((xml.match(/<url>/g) ?? []).length).toBe(2);
  });

  it('points robots.txt at the sitemap', () => {
    expect(buildRobots()).toContain(
      'Sitemap: https://bettergattaran.org/sitemap.xml'
    );
  });
});

describe('applyTemplate', () => {
  const template =
    '<html><head><title data-rh="true">Default</title>\n<meta data-rh="true" name="description" content="Default" /></head><body><div id="root"></div></body></html>';

  it('replaces default head tags and fills the root element', () => {
    const html = applyTemplate(template, route, '<h1>Body</h1>');

    expect(html).not.toContain('>Default<');
    expect(html).toContain('<div id="root"><h1>Body</h1></div>');
    expect(html.match(/<title/g)).toHaveLength(1);
    expect(html).toContain('"/hotlines"');
  });

  it('refuses a template that is already pre-rendered', () => {
    expect(() =>
      applyTemplate('<head></head><div id="root">x</div>', route, '')
    ).toThrow(/#root/);
  });
});

describe('fileForPath', () => {
  it('maps routes to directory index files', () => {
    expect(fileForPath('/')).toBe('index.html');
    expect(fileForPath('/hotlines')).toBe('hotlines/index.html');
    expect(fileForPath('/government/departments/barangays')).toBe(
      'government/departments/barangays/index.html'
    );
  });
});
