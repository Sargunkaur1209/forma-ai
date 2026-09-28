// Mock only. The real implementation will call POST {VITE_API_URL}/api/extract.
export async function extractFromStory(story, formId) {
  void formId;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock-only failure switch; remove it when the real endpoint is wired on Day 15.
      if (story.toLowerCase().includes('fail')) {
        reject(new Error('Mock extraction failed'));
        return;
      }

      resolve({
        answers: {
          incidentType: 'animal_collision',
          animalType: 'deer',
          animalOther: '',
          vin: '',
        },
        missing: ['vin'],
      });
    }, 1500);
  });
}
