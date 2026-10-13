import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import Hotlines from './Hotlines';

describe('Hotlines page', () => {
  it('renders eligible records with call links and provenance', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Hotlines />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Verified emergency hotlines' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Call Gattaran Emergency Hospital at 0995-323-4947',
      })
    ).toHaveAttribute('href', 'tel:+639953234947');
    expect(screen.getAllByText('Verified public information')).toHaveLength(3);
    expect(
      screen.getAllByText(/Provincial Government of Cagayan/)
    ).toHaveLength(4);
    expect(screen.getAllByText('September 23, 2026')).toHaveLength(6);
    expect(
      screen.getAllByRole('link', { name: 'Report incorrect information' })
    ).toHaveLength(3);
    expect(document.body).not.toHaveTextContent('0926-652-6027');
  });
});
