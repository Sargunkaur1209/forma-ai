export default {
  formId: 'auto_claim_v1',
  title: 'Auto insurance claim',
  version: 3,
  sections: [
    {
      id: 'incident',
      title: 'What happened',
      fields: [
        {
          key: 'incidentType',
          type: 'select',
          label: 'Type of incident',
          required: true,
          options: [
            { value: 'animal_collision', label: 'Hit an animal' },
            { value: 'collision', label: 'Collision with a vehicle' },
            { value: 'theft', label: 'Theft' },
          ],
        },
        {
          key: 'animalType',
          type: 'select',
          label: 'Which animal?',
          options: [
            { value: 'deer', label: 'Deer' },
            { value: 'other', label: 'Other' },
          ],
          showIf: {
            all: [{ field: 'incidentType', op: 'eq', value: 'animal_collision' }],
          },
        },
        {
          key: 'deerAlertActive',
          type: 'checkbox',
          label: 'Was a deer-crossing warning sign posted nearby?',
          showIf: {
            all: [{ field: 'animalType', op: 'eq', value: 'deer' }],
          },
        },
        {
          key: 'otherPartyAtFault',
          type: 'checkbox',
          label: 'Was the other driver at fault?',
          showIf: {
            all: [{ field: 'incidentType', op: 'eq', value: 'collision' }],
          },
        },
        {
          key: 'otherPartyInsured',
          type: 'checkbox',
          label: 'Did the other driver have insurance?',
          showIf: {
            all: [{ field: 'otherPartyAtFault', op: 'eq', value: true }],
          },
        },
        {
          key: 'incidentDate',
          type: 'text',
          label: 'Date of incident (YYYY-MM-DD)',
          required: true,
          validation: {
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            message: 'Use the format YYYY-MM-DD',
          },
        },
        {
          key: 'incidentLocation',
          type: 'text',
          label: 'Where did it happen?',
          required: true,
        },
        {
          key: 'description',
          type: 'text',
          label: 'Short description',
        },
      ],
    },
    {
      id: 'vehicle',
      title: 'Your vehicle',
      fields: [
        {
          key: 'vehicleMake',
          type: 'select',
          label: 'Vehicle make',
          required: true,
          options: [
            { value: 'honda', label: 'Honda' },
            { value: 'toyota', label: 'Toyota' },
            { value: 'ford', label: 'Ford' },
            { value: 'hyundai', label: 'Hyundai' },
            { value: 'other', label: 'Other' },
          ],
        },
        { key: 'vehicleModel', type: 'text', label: 'Vehicle model' },
        {
          key: 'vin',
          type: 'text',
          label: 'Vehicle VIN',
          validation: {
            pattern: '^[A-HJ-NPR-Z0-9]{17}$',
            message: 'Enter the 17-character VIN',
          },
        },
      ],
    },
    {
      id: 'damage',
      title: 'Damage and injuries',
      fields: [
        {
          key: 'damageArea',
          type: 'select',
          label: 'Main damaged area',
          required: true,
          options: [
            { value: 'windshield', label: 'Windshield' },
            { value: 'front', label: 'Front' },
            { value: 'rear', label: 'Rear' },
            { value: 'side', label: 'Side' },
            { value: 'other', label: 'Other' },
          ],
        },
        { key: 'vehicleDriveable', type: 'checkbox', label: 'The vehicle is still driveable' },
        { key: 'injuriesReported', type: 'checkbox', label: 'Someone was injured' },
      ],
    },
  ],
};
