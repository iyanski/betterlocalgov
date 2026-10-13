import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const entries = [1, 2, 3, 4].map(n => ({
  contentId: `government/departments/page-${n}`,
  title: `Page ${n}`,
  path: `/government/departments/page-${n}`,
  action: 'updated',
  date: `2026-10-0${n}`,
  changedFields: [],
}));

describe('WhatsNewTeaser', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows the three latest entries and a link to the full list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ lastUpdated: '2026-10-04', entries }),
      })
    );
    const { default: WhatsNewTeaser } = await import('./WhatsNewTeaser');
    render(
      <MemoryRouter>
        <WhatsNewTeaser />
      </MemoryRouter>
    );

    expect(await screen.findByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 3')).toBeInTheDocument();
    expect(screen.queryByText('Page 4')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'See all recent changes' })
    ).toHaveAttribute('href', '/whats-new');
  });

  it('renders nothing when the build data is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const { default: WhatsNewTeaser } = await import('./WhatsNewTeaser');
    const { container } = render(
      <MemoryRouter>
        <WhatsNewTeaser />
      </MemoryRouter>
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(container).toBeEmptyDOMElement();
  });
});
