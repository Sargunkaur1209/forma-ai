// Flattens all sections of a form schema into one list of fields.
export function flattenFields(form) {
  return (form?.sections ?? []).flatMap((section) => section.fields ?? []);
}
