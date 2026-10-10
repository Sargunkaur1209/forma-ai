export default {
  formId: 'home_claim_v1',
  title: 'Home insurance claim',
  version: 1,
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
            { value: 'fire', label: 'Fire' },
            { value: 'water_damage', label: 'Water damage' },
            { value: 'theft', label: 'Theft or burglary' },
            { value: 'storm_damage', label: 'Storm damage' },
          ],
        },
        {
          key: 'waterSource',
          type: 'select',
          label: 'Source of the water damage',
          options: [
            { value: 'burst_pipe', label: 'Burst pipe' },
            { value: 'roof_leak', label: 'Roof leak' },
            { value: 'appliance', label: 'Appliance failure' },
            { value: 'other', label: 'Other' },
          ],
          showIf: {
            all: [{ field: 'incidentType', op: 'eq', value: 'water_damage' }],
          },
        },
        {
          key: 'waterShutOff',
          type: 'checkbox',
          label: 'Was the water supply shut off immediately?',
          showIf: {
            all: [{ field: 'waterSource', op: 'eq', value: 'burst_pipe' }],
          },
        },
        {
          key: 'policeReportFiled',
          type: 'checkbox',
          label: 'Was a police report filed?',
          showIf: {
            all: [{ field: 'incidentType', op: 'eq', value: 'theft' }],
          },
        },
        {
          key: 'policeReportNumber',
          type: 'text',
          label: 'Police report number',
          showIf: {
            all: [{ field: 'policeReportFiled', op: 'eq', value: true }],
          },
        },
        {
          key: 'incidentDate',
          type: 'date',
          label: 'Date of incident',
          required: true,
        },
        {
          key: 'propertyAddress',
          type: 'text',
          label: 'Property address',
          required: true,
        },
        {
          key: 'description',
          type: 'textarea',
          label: 'Describe what happened',
        },
      ],
    },
    {
      id: 'damage',
      title: 'Damage details',
      fields: [
        {
          key: 'roomsAffected',
          type: 'number',
          label: 'Number of rooms affected',
          validation: { min: 0, max: 50 },
        },
        {
          key: 'habitable',
          type: 'radio',
          label: 'Is the home currently habitable?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'partially', label: 'Partially' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          key: 'temporaryHousingNeeded',
          type: 'checkbox',
          label: 'Do you need temporary housing?',
          showIf: {
            all: [{ field: 'habitable', op: 'eq', value: 'no' }],
          },
        },
        {
          key: 'estimatedDamageCost',
          type: 'number',
          label: 'Estimated damage cost (USD)',
          validation: { min: 0, max: 1000000 },
        },
      ],
    },
  ],
};
