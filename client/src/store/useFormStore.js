import { create } from 'zustand';

export const EXTRACTION_STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

export const useFormStore = create((set) => ({
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
      values: { ...state.values, ...answers },
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
  setValue: (key, value) => set((state) => ({ values: { ...state.values, [key]: value } })),
  setValues: (values) => set((state) => ({ values: { ...state.values, ...values } })),
}));
