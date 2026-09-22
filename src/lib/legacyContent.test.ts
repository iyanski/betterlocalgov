import { describe, expect, it } from 'vitest';
import { sanitizeLegacyServiceContent } from './legacyContent';

describe('sanitizeLegacyServiceContent', () => {
  it('replaces inherited Lapu-Lapu content with a neutral verification notice', () => {
    const result = sanitizeLegacyServiceContent({
      title: 'Legacy health guide',
      content: '# Lapu-Lapu City Health Services\n\nLegacy local details.',
    });

    expect(result.title).toBe('Service guide pending verification');
    expect(result.content).toContain('refers to another locality');
    expect(result.content).not.toMatch(/Lapu[\s-]?Lapu/i);
  });

  it('leaves non-legacy content unchanged', () => {
    const content = { title: 'General guide', content: '# General guidance' };

    expect(sanitizeLegacyServiceContent(content)).toBe(content);
  });
});
