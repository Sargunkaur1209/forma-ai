import { create } from 'zustand';

export function getNestedValue(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

export function setNestedValue(object, path, value) {
  const keys = path.split('.');
  const result = { ...object };
  let source = object;
  let target = result;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      target[key] = value;
      return;
    }

    const sourceChild = source?.[key];
    const targetChild = Array.isArray(sourceChild) ? [...sourceChild] : { ...sourceChild };
    target[key] = targetChild;
    source = sourceChild;
    target = targetChild;
  });

  return result;
}

function mergeNestedValues(current, updates) {
  return Object.entries(updates).reduce(
    (result, [key, value]) => {
      if (key.includes('.')) {
        return setNestedValue(result, key, value);
      }

      const currentValue = result[key];
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        currentValue &&
        typeof currentValue === 'object' &&
        !Array.isArray(currentValue)
      ) {
        return { ...result, [key]: mergeNestedValues(currentValue, value) };
      }

      return { ...result, [key]: value };
    },
    { ...current },
  );
}

export const EXTRACTION_STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

export const useFormStore = create((set, get) => ({
  values: {},
  extractionStatus: EXTRACTION_STATUS.IDLE,
  extractionError: null,
  missingFields: [],
  lastStory: '',

  startExtraction: (story) =>
    set({
      extractionStatus: EXTRACTION_STATUS.LOADING,
      extractionError: null,
      lastStory: story,
    }),
  extractionSucceeded: ({ answers, missing }) =>
    set((state) => ({
      extractionStatus: EXTRACTION_STATUS.SUCCESS,
      values: mergeNestedValues(state.values, answers),
      missingFields: missing,
    })),
  extractionFailed: (message) =>
    set({
      extractionStatus: EXTRACTION_STATUS.ERROR,
      extractionError: message,
    }),
  resetExtraction: () =>
    set({
      extractionStatus: EXTRACTION_STATUS.IDLE,
      extractionError: null,
      missingFields: [],
    }),
  setValue: (path, value) =>
    set((state) => ({ values: setNestedValue(state.values, path, value) })),
  setValues: (values) => set((state) => ({ values: mergeNestedValues(state.values, values) })),
  getValue: (path) => getNestedValue(get().values, path),
}));
