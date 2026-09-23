const mockSchemaPromise = import('../mocks/autoClaimSchema.json');

export async function fetchFormSchema(formId) {
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  try {
    if (!apiUrl) {
      throw new Error('VITE_API_URL is not configured');
    }

    const response = await fetch(`${apiUrl}/api/forms/${encodeURIComponent(formId)}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`Falling back to the local mock schema: ${error.message}`);
    return (await mockSchemaPromise).default;
  }
}
