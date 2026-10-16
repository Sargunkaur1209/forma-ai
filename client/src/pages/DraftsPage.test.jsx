import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import DraftsPage from './DraftsPage';

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function CurrentLocation() {
  const location = useLocation();
  return (
    <output role="status" aria-label="Current location">
      {`${location.pathname}${location.search}`}
    </output>
  );
}

function renderDraftsPage(initialEntry = '/drafts') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/claim" element={<p>Claim resume destination</p>} />
      </Routes>
      <CurrentLocation />
    </MemoryRouter>,
  );
}

describe('DraftsPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.test');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders sorted cards with story previews, relative times, status, and answered field counts', async () => {
    fetch.mockResolvedValue(
      jsonResponse({
        drafts: [
          {
            id: 'older',
            story: 'Older claim story',
            answers: { location: 'Ranchi' },
            updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'newer',
            story: `${'A'.repeat(121)} more story`,
            answers: { incidentType: 'collision', location: '', incidentDate: null, injury: false },
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ],
        count: 2,
      }),
    );

    renderDraftsPage();

    expect(await screen.findByText(`${'A'.repeat(120)}…`)).toBeInTheDocument();
    expect(screen.getByText('Updated 2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('2 answered fields')).toBeInTheDocument();
    expect(screen.getByText('1 answered field')).toBeInTheDocument();
    expect(screen.getAllByText('Draft')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Resume' })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'My drafts' })).toHaveAttribute('aria-current', 'page');
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/drafts?formId=auto_claim_v1', undefined);

    const storyParagraphs = screen.getAllByText(/claim story|^A{120}/);
    expect(storyParagraphs[0]).toHaveTextContent('A'.repeat(120));
    expect(storyParagraphs[1]).toHaveTextContent('Older claim story');
  });

  it('shows an empty state and a new claim action', async () => {
    fetch.mockResolvedValue(jsonResponse({ drafts: [], count: 0 }));

    renderDraftsPage();

    expect(await screen.findByRole('heading', { name: 'No drafts yet' })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'New claim' })).toHaveAttribute(
      'href',
      '/claim',
    );
  });

  it('shows a network error and retries successfully', async () => {
    const user = userEvent.setup();
    fetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse({ drafts: [], count: 0 }));

    renderDraftsPage();

    expect(
      await screen.findByText('Unable to reach the server. Check your connection and try again.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'No drafts yet' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('navigates to the claim resume URL when Resume is selected', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue(
      jsonResponse({
        drafts: [
          {
            id: 'draft-123',
            story: 'A claim story',
            answers: {},
            updatedAt: new Date().toISOString(),
          },
        ],
        count: 1,
      }),
    );

    renderDraftsPage();
    await user.click(await screen.findByRole('link', { name: 'Resume' }));

    expect(screen.getByRole('status', { name: 'Current location' })).toHaveTextContent(
      '/claim?draftId=draft-123',
    );
    expect(screen.getByText('Claim resume destination')).toBeInTheDocument();
  });

  it('shows the session-expired message for a 401 response', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: 'Unauthorized' }, 401));

    renderDraftsPage();

    expect(
      await screen.findByText('Your session has expired. Please sign in again to continue.'),
    ).toBeInTheDocument();
  });
});
