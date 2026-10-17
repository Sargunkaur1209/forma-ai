import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App routing', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('shows a helpful page and home link for an unknown route', () => {
    window.history.replaceState({}, '', '/route-that-does-not-exist');

    render(<App />);

    expect(screen.getByRole('heading', { name: "We couldn't find that page." })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to home' })).toHaveAttribute('href', '/');
  });

  it('renders the submitted placeholder with the active sidebar link without fetching', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    window.history.replaceState({}, '', '/submitted');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Submitted claims' })).toBeInTheDocument();
    expect(screen.getByText('Your submitted claims will appear here soon.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to my drafts' })).toHaveAttribute('href', '/drafts');
    expect(screen.getByRole('link', { name: 'Submitted' })).toHaveAttribute('aria-current', 'page');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
