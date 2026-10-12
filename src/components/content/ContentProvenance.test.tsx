import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ContentProvenance from './ContentProvenance';

describe('ContentProvenance', () => {
  it('renders multiple authoritative sources and verification dates', () => {
    render(
      <ContentProvenance
        provenance={{
          verificationStatus: 'verified',
          lastVerifiedAt: '2026-09-22',
          lastUpdatedAt: '2026-09-21',
          asOf: '2025-07-31',
          sources: [
            {
              title: 'Municipality of Gattaran',
              organization: 'Philippine Statistics Authority',
              url: 'https://psa.gov.ph/example',
              type: 'national_government',
            },
            {
              title: 'Official directory',
              organization: 'Provincial Government of Cagayan',
              url: 'https://cagayan.gov.ph/example',
              type: 'provincial_government',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Verified public information')).toBeInTheDocument();
    expect(screen.getByText('September 22, 2026')).toHaveAttribute(
      'datetime',
      '2026-09-22'
    );
    expect(screen.getByText('July 31, 2025')).toHaveAttribute(
      'datetime',
      '2025-07-31'
    );
    expect(
      screen.getByRole('link', {
        name: /Municipality of Gattaran.*opens in a new tab/,
      })
    ).toHaveAttribute('href', 'https://psa.gov.ph/example');
    expect(screen.getByText('Sources')).toBeInTheDocument();
  });

  it('renders a pending state without fabricating a source', () => {
    render(
      <ContentProvenance
        provenance={{
          verificationStatus: 'awaiting_verification',
          sources: [],
        }}
      />
    );

    expect(screen.getByText('Awaiting verification')).toBeInTheDocument();
    expect(screen.queryByText('Source')).not.toBeInTheDocument();
  });
});
