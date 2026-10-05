import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import mockSchema from '../mocks/autoClaimSchema.json';
import { fetchFormSchema } from '../services/formService';
import DynamicFormRenderer from './DynamicFormRenderer';

vi.mock('../services/formService', () => ({
  fetchFormSchema: vi.fn(),
}));

describe('DynamicFormRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchFormSchema.mockResolvedValue(mockSchema);
  });

  it('renders a loading state while the schema is being fetched', () => {
    fetchFormSchema.mockReturnValue(new Promise(() => {}));

    render(<DynamicFormRenderer formId="auto_claim_v1" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading form...');
  });

  it('renders schema fields once the schema has loaded', async () => {
    render(<DynamicFormRenderer formId="auto_claim_v1" />);

    expect(await screen.findByRole('combobox', { name: 'Type of incident' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Vehicle VIN' })).toBeInTheDocument();
  });

  it('shows nested animal fields only when their showIf conditions match', async () => {
    const user = userEvent.setup();
    render(<DynamicFormRenderer formId="auto_claim_v1" />);

    const incidentType = await screen.findByRole('combobox', { name: 'Type of incident' });
    expect(screen.queryByRole('combobox', { name: 'Which animal?' })).not.toBeInTheDocument();

    await user.selectOptions(incidentType, 'animal_collision');
    const animalType = await screen.findByRole('combobox', { name: 'Which animal?' });

    await user.selectOptions(animalType, 'deer');
    expect(screen.queryByRole('textbox', { name: 'Describe the animal' })).not.toBeInTheDocument();

    await user.selectOptions(animalType, 'other');
    expect(await screen.findByRole('textbox', { name: 'Describe the animal' })).toBeInTheDocument();
  });

  it('shows the required validation error when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<DynamicFormRenderer formId="auto_claim_v1" />);

    await screen.findByRole('combobox', { name: 'Type of incident' });
    await user.click(screen.getByRole('button', { name: 'Submit claim' }));

    expect(await screen.findByText('Type of incident is required')).toBeInTheDocument();
  });

  it('shows the VIN pattern error for an invalid VIN', async () => {
    const user = userEvent.setup();
    render(<DynamicFormRenderer formId="auto_claim_v1" />);

    const vinInput = await screen.findByRole('textbox', { name: 'Vehicle VIN' });
    await user.type(vinInput, '123');
    await user.click(screen.getByRole('button', { name: 'Submit claim' }));

    expect(await screen.findByText('Enter the 17-character VIN')).toBeInTheDocument();
  });
});
