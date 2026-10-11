import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App routing', () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, '', '/');
  });

  it('shows a helpful page and home link for an unknown route', () => {
    window.history.replaceState({}, '', '/route-that-does-not-exist');

    render(<App />);

    expect(screen.getByRole('heading', { name: "We couldn't find that page." })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to home' })).toHaveAttribute('href', '/');
  });
});
