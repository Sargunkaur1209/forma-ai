import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ClaimTypePage from './ClaimTypePage';

function CurrentPath() {
  const location = useLocation();
  return <output aria-label="Current page">{location.pathname}</output>;
}

function renderClaimTypePage() {
  return render(
    <MemoryRouter initialEntries={['/claim']}>
      <Routes>
        <Route path="/claim" element={<ClaimTypePage />} />
        <Route path="/claim/auto" element={<p>Auto claim description</p>} />
      </Routes>
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe('ClaimTypePage', () => {
  it('offers the implemented auto claim and clearly marks other claim types as coming soon', () => {
    renderClaimTypePage();

    expect(
      screen.getByRole('heading', { name: 'What kind of claim is this?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Auto/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Health/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Home/ })).toBeDisabled();
    expect(screen.getAllByText('Coming soon')).toHaveLength(2);
  });

  it('continues to the auto claim description flow', async () => {
    const user = userEvent.setup();
    renderClaimTypePage();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Auto claim description')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /Current page/i })).toHaveTextContent('/claim/auto');
  });
});
