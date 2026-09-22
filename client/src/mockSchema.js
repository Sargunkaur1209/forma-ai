/**
 * mockSchema.js
 *
 * A local stand-in for the form schema that will eventually come from the API.
 * The shape follows schema-contract.md exactly so the frontend can be built
 * and tested without a running backend.
 *
 * Used only for Day 3 demo / Day 4 DynamicFormRenderer development.
 * Replace with a real API call (GET /api/forms/auto_claim_v1) on Day 6+.
 */
const mockSchema = {
  formId: 'auto_claim_v1',
  title: 'Auto Insurance Claim',
  version: 1,
  sections: [
    {
      id: 'incident',
      title: 'Incident details',
      fields: [
        {
          key: 'claimantName',
          type: 'text',
          label: 'Full name',
          required: true,
          validation: {
            pattern: '^[A-Za-z\\s\\-]+$',
            message: 'Name can only contain letters, spaces and hyphens',
          },
        },
        {
          key: 'incidentType',
          type: 'select',
          label: 'Type of incident',
          required: true,
          options: [
            { value: 'animal_collision', label: 'Hit an animal' },
            { value: 'collision', label: 'Collision with a vehicle' },
            { value: 'theft', label: 'Theft' },
            { value: 'weather', label: 'Weather damage' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          key: 'policeReportFiled',
          type: 'checkbox',
          label: 'A police report was filed',
          required: false,
        },
      ],
    },
  ],
};

export default mockSchema;
