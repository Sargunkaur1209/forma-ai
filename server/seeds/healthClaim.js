export default {
  formId: 'health_claim_v1',
  title: 'Health insurance claim',
  version: 1,
  sections: [
    {
      id: 'visit',
      title: 'About the visit',
      fields: [
        {
          key: 'visitType',
          type: 'select',
          label: 'Type of visit',
          required: true,
          options: [
            { value: 'emergency', label: 'Emergency room' },
            { value: 'specialist', label: 'Specialist visit' },
            { value: 'routine', label: 'Routine checkup' },
            { value: 'prescription', label: 'Prescription only' },
          ],
        },
        {
          key: 'emergencyAdmitted',
          type: 'checkbox',
          label: 'Were you admitted to the hospital?',
          showIf: {
            all: [{ field: 'visitType', op: 'eq', value: 'emergency' }],
          },
        },
        {
          key: 'nightsAdmitted',
          type: 'number',
          label: 'Number of nights admitted',
          validation: { min: 0, max: 365 },
          showIf: {
            all: [{ field: 'emergencyAdmitted', op: 'eq', value: true }],
          },
        },
        {
          key: 'specialistType',
          type: 'text',
          label: 'Specialist type (e.g. cardiologist)',
          showIf: {
            all: [{ field: 'visitType', op: 'eq', value: 'specialist' }],
          },
        },
        {
          key: 'visitDate',
          type: 'date',
          label: 'Date of visit',
          required: true,
        },
        {
          key: 'providerName',
          type: 'text',
          label: 'Hospital or clinic name',
          required: true,
        },
        {
          key: 'reasonForVisit',
          type: 'textarea',
          label: 'Reason for the visit',
        },
      ],
    },
    {
      id: 'billing',
      title: 'Billing and coverage',
      fields: [
        {
          key: 'totalBillAmount',
          type: 'number',
          label: 'Total bill amount (USD)',
          required: true,
          validation: { min: 0, max: 500000 },
        },
        {
          key: 'hasOtherInsurance',
          type: 'radio',
          label: 'Do you have other insurance coverage?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unsure', label: 'Not sure' },
          ],
        },
        {
          key: 'otherInsurerName',
          type: 'text',
          label: 'Name of the other insurer',
          showIf: {
            all: [{ field: 'hasOtherInsurance', op: 'eq', value: 'yes' }],
          },
        },
        {
          key: 'receiptsAvailable',
          type: 'checkbox',
          label: 'Do you have itemized receipts available?',
        },
      ],
    },
  ],
};
