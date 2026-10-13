import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NationalScopeNotice from './NationalScopeNotice';

describe('NationalScopeNotice', () => {
  it('renders the fixed notice without a dismiss control', () => {
    render(<NationalScopeNotice />);

    expect(
      screen.getByText(
        'This is a national government procedure that applies in Gattaran. Local office locations, hours, contacts and any local fees have not been verified by Better Gattaran. Confirm with the issuing agency.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
