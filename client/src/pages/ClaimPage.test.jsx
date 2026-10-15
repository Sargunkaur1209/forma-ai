import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import mockSchema from '../mocks/autoClaimSchema.json';
import { fetchFormSchema } from '../services/formService';
import { useFormStore } from '../store/useFormStore';
import ClaimPage from './ClaimPage';

vi.mock('../services/formService', () => ({
  fetchFormSchema: vi.fn(),
}));

function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function getRequestBody(url, method = 'POST') {
  const call = fetch.mock.calls.find(
    ([requestUrl, options]) => requestUrl.includes(url) && options?.method === method,
  );
  return call ? JSON.parse(call[1].body) : null;
}

function showClaimForm() {
  useFormStore.setState({ extractionStatus: 'success' });
}

function renderClaimPage() {
  return render(
    <MemoryRouter>
      <ClaimPage />
    </MemoryRouter>,
  );
}

describe('ClaimPage draft and submission flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://api.test');
    fetchFormSchema.mockResolvedValue(mockSchema);
    useFormStore.setState({
      values: {},
      extractionStatus: 'idle',
      extractionError: null,
      missingFields: [],
      lastStory: '',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
        throw new Error(`Unexpected request: ${url}`);
      }),
    );
    window.history.replaceState({}, '', '/claim');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
  });

  it('saves the current answers as a draft and shows the saved state', async () => {
    const user = userEvent.setup();
    showClaimForm();
    fetch.mockImplementation(async (url, options) => {
      if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
      if (url.endsWith('/api/drafts') && options.method === 'POST') {
        return jsonResponse({ id: 'draft-123' }, 201);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Type of incident' }),
      'collision',
    );
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByText('Draft saved.')).toBeInTheDocument();
    expect(getRequestBody('/api/drafts')).toEqual({
      formId: 'auto_claim_v1',
      formVersion: 1,
      answers: { incidentType: 'collision', vin: '' },
    });
  });

  it('shows a network failure when saving and preserves entered answers', async () => {
    const user = userEvent.setup();
    showClaimForm();
    fetch.mockImplementation(async (url, options) => {
      if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
      if (url.endsWith('/api/drafts') && options.method === 'POST') {
        throw new TypeError('Failed to fetch');
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    const incidentType = await screen.findByRole('combobox', { name: 'Type of incident' });
    await user.selectOptions(incidentType, 'collision');
    await user.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(
      await screen.findByText('Unable to reach the server. Check your connection and try again.'),
    ).toBeInTheDocument();
    expect(incidentType).toHaveValue('collision');
  });

  it('offers a recent draft and hydrates the form when resumed', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation(async (url) => {
      if (url.includes('/api/drafts?')) {
        return jsonResponse({
          drafts: [
            {
              id: 'recent-draft',
              formId: 'auto_claim_v1',
              formVersion: 1,
              answers: { incidentType: 'collision', vin: '1HGCM82633A004352' },
            },
          ],
          count: 1,
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    await user.click(await screen.findByRole('button', { name: 'Resume draft' }));

    expect(await screen.findByRole('combobox', { name: 'Type of incident' })).toHaveValue(
      'collision',
    );
    expect(screen.getByRole('textbox', { name: 'Vehicle VIN' })).toHaveValue('1HGCM82633A004352');
  });

  it('offers a draft from the URL and loads it by id', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/claim?draftId=linked-draft');
    fetch.mockImplementation(async (url) => {
      if (url.endsWith('/api/drafts/linked-draft')) {
        return jsonResponse({
          id: 'linked-draft',
          formId: 'auto_claim_v1',
          formVersion: 1,
          answers: { incidentType: 'theft' },
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    await user.click(await screen.findByRole('button', { name: 'Resume draft' }));

    expect(await screen.findByRole('combobox', { name: 'Type of incident' })).toHaveValue('theft');
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/drafts/linked-draft', undefined);
  });

  it('submits only fields visible under the current showIf values', async () => {
    const user = userEvent.setup();
    showClaimForm();
    fetch.mockImplementation(async (url, options) => {
      if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
      if (url.endsWith('/api/submissions') && options.method === 'POST') {
        return jsonResponse({ id: 'submission-456' }, 201);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    const incidentType = await screen.findByRole('combobox', { name: 'Type of incident' });
    await user.selectOptions(incidentType, 'animal_collision');
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Which animal?' }),
      'deer',
    );
    await user.selectOptions(incidentType, 'collision');
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Which animal?' })).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Submit claim' }));

    expect(await screen.findByTestId('submission-id')).toHaveTextContent('submission-456');
    expect(getRequestBody('/api/submissions')).toEqual({
      formId: 'auto_claim_v1',
      version: 1,
      answers: { incidentType: 'collision', vin: '' },
    });
  });

  it('maps server validation errors to the matching field', async () => {
    const user = userEvent.setup();
    showClaimForm();
    fetch.mockImplementation(async (url, options) => {
      if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
      if (url.endsWith('/api/submissions') && options.method === 'POST') {
        return jsonResponse(
          {
            error: 'Submission failed validation',
            details: [{ key: 'vin', reason: 'VIN must contain 17 characters' }],
          },
          400,
        );
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Type of incident' }),
      'collision',
    );
    await user.click(screen.getByRole('button', { name: 'Submit claim' }));

    expect(await screen.findByText('VIN must contain 17 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Vehicle VIN' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getByText('Some claim details need attention. Review the highlighted fields.'),
    ).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Vehicle VIN' }), '1HGCM82633A004352');
    expect(screen.queryByText('VIN must contain 17 characters')).not.toBeInTheDocument();
  });

  it('shows an expired-session message on a 401 response', async () => {
    const user = userEvent.setup();
    showClaimForm();
    fetch.mockImplementation(async (url, options) => {
      if (url.includes('/api/drafts?')) return jsonResponse({ drafts: [], count: 0 });
      if (url.endsWith('/api/drafts') && options.method === 'POST') {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    renderClaimPage();
    await user.click(await screen.findByRole('button', { name: 'Save draft' }));

    expect(
      await screen.findByText('Your session has expired. Please sign in again to continue.'),
    ).toBeInTheDocument();
  });
});
