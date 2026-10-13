import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FoiRequestsList from './FoiRequestsList';

describe('FoiRequestsList', () => {
  it('shows an empty state when nothing has been filed', () => {
    render(<FoiRequestsList requests={[]} />);
    expect(
      screen.getByText(/No request has been filed yet/)
    ).toBeInTheDocument();
  });

  it('shows agency, channel, dates, status and the public eFOI link', () => {
    render(
      <FoiRequestsList
        requests={[
          {
            id: 'a',
            agency: 'Example Agency',
            channel: 'efoi',
            dateSent: '2026-11-02',
            subject: 'Example records',
            status: 'partially_granted',
            responseDate: '2026-11-20',
            publicRequestUrl: 'https://www.foi.gov.ph/requests/example',
          },
        ]}
      />
    );

    expect(screen.getByText('Example records')).toBeInTheDocument();
    expect(screen.getByText('Example Agency')).toBeInTheDocument();
    expect(screen.getByText('eFOI (foi.gov.ph)')).toBeInTheDocument();
    expect(screen.getByText('Partially granted')).toBeInTheDocument();
    expect(screen.getByText('November 2, 2026')).toHaveAttribute(
      'datetime',
      '2026-11-02'
    );
    expect(screen.getByText('November 20, 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Public eFOI request/ })
    ).toHaveAttribute('href', 'https://www.foi.gov.ph/requests/example');
  });
});
