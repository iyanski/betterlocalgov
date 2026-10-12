import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { HotlineRecord } from '../../lib/hotlines';
import EmergencyHotlineStrip from './EmergencyHotlineStrip';

const hotline: HotlineRecord = {
  id: 'national-emergency-911',
  name: 'National Emergency Hotline',
  phone: '911',
  displayPhone: '911',
  category: 'national-emergency',
  publicationStatus: 'published',
  provenance: {
    verificationStatus: 'verified',
    lastVerifiedAt: '2026-09-23',
    lastUpdatedAt: '2026-09-23',
    sources: [
      {
        title: 'Official source',
        organization: 'Government agency',
        url: 'https://agency.gov.ph',
        type: 'national_government',
      },
    ],
  },
};

describe('EmergencyHotlineStrip', () => {
  it('renders valid click-to-call links', () => {
    render(
      <MemoryRouter>
        <EmergencyHotlineStrip hotlines={[hotline]} />
      </MemoryRouter>
    );

    screen
      .getAllByRole('link', { name: /Call National Emergency Hotline at 911/ })
      .forEach(link => expect(link).toHaveAttribute('href', 'tel:911'));
  });

  it('provides an accessible mobile disclosure', () => {
    render(
      <MemoryRouter>
        <EmergencyHotlineStrip hotlines={[hotline]} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: 'Hotlines' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Verified')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Sources and verification details' })
    ).toHaveAttribute('href', '/hotlines');
  });
});
