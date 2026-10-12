import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownContent } from '../lib/markdownLoader';

const loadMarkdownContent = vi.fn();

vi.mock('../lib/markdownLoader', () => ({
  loadMarkdownContent: (...args: unknown[]) => loadMarkdownContent(...args),
}));

import Document from './Document';

const NOTICE =
  /This is a national government procedure that applies in Gattaran/;

function page(overrides: Partial<MarkdownContent>): MarkdownContent {
  return {
    title: 'Sample national procedure',
    description: 'Summary.',
    content: '# Sample national procedure\n\nSummary.',
    publicationStatus: 'published',
    scope: 'national_applicable',
    containsFigures: false,
    provenance: {
      verificationStatus: 'sourced',
      lastUpdatedAt: '2026-10-12',
      sources: [
        {
          title: 'Agency page',
          organization: 'Philippine Statistics Authority',
          url: 'https://psa.gov.ph/example',
          type: 'national_government',
        },
      ],
    },
    ...overrides,
  };
}

function renderDocument() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/services/social-welfare/sample']}>
        <Routes>
          <Route
            path="/services/:category/:documentSlug"
            element={<Document categoryType="service" />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('Document scope handling', () => {
  beforeEach(() => loadMarkdownContent.mockReset());

  it('shows the national notice for national_applicable records', async () => {
    loadMarkdownContent.mockResolvedValue(page({}));
    renderDocument();

    expect(await screen.findByText(NOTICE)).toBeInTheDocument();
    expect(
      screen.getByText('Philippine Statistics Authority', { exact: false })
    ).toBeInTheDocument();
  });

  it('does not show the national notice for local records', async () => {
    loadMarkdownContent.mockResolvedValue(
      page({
        scope: 'local',
        provenance: {
          verificationStatus: 'verified',
          lastVerifiedAt: '2026-10-12',
          lastUpdatedAt: '2026-10-12',
          sources: [],
        },
      })
    );
    renderDocument();

    expect(
      await screen.findByRole('heading', { name: 'Sample national procedure' })
    ).toBeInTheDocument();
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });

  it('withholds a national_applicable record without a national source', async () => {
    loadMarkdownContent.mockResolvedValue(
      page({
        provenance: {
          verificationStatus: 'sourced',
          sources: [
            {
              title: 'News story',
              organization: 'Media outlet',
              url: 'https://example.test/story',
              type: 'other_public_source',
            },
          ],
        },
      })
    );
    renderDocument();

    expect(
      await screen.findByText('Information awaiting verification', {
        selector: 'p, h2, h3, div',
      })
    ).toBeInTheDocument();
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });
});
