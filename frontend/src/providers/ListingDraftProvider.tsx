'use client';

import type { ExtractionReviewFormValues } from '@/features/listing-creation/schemas/extraction-review.schema';
import type { ListingFormValues } from '@/features/listing-creation/schemas/listing.schema';
import type { ExtractionResult } from '@/types/listing';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ListingInputMode = 'voice' | 'text' | 'form';

export type ListingCreationStep =
  | 'choose'
  | 'input'
  | 'extracting'
  | 'review'
  | 'confirm';

export interface ListingDraftState {
  inputMode: ListingInputMode | null;
  step: ListingCreationStep;
  rawText: string;
  transcript: string;
  audioBlobUrl: string | null;
  extractionResult: ExtractionResult | null;
  reviewValues: Partial<ExtractionReviewFormValues>;
  formValues: Partial<ListingFormValues>;
  localDraftId: string | null;
  backendListingId: string | null;
  isDirty: boolean;
}

const initialState: ListingDraftState = {
  inputMode: null,
  step: 'choose',
  rawText: '',
  transcript: '',
  audioBlobUrl: null,
  extractionResult: null,
  reviewValues: {},
  formValues: {},
  localDraftId: null,
  backendListingId: null,
  isDirty: false,
};

interface ListingDraftContextValue extends ListingDraftState {
  setInputMode: (mode: ListingInputMode) => void;
  setStep: (step: ListingCreationStep) => void;
  setRawText: (text: string) => void;
  setTranscript: (text: string) => void;
  setAudioBlobUrl: (url: string | null) => void;
  setExtractionResult: (result: ExtractionResult | null) => void;
  updateReviewValues: (values: Partial<ExtractionReviewFormValues>) => void;
  updateFormValues: (values: Partial<ListingFormValues>) => void;
  setLocalDraftId: (id: string | null) => void;
  setBackendListingId: (id: string | null) => void;
  resetDraft: () => void;
  markClean: () => void;
}

const ListingDraftContext = createContext<ListingDraftContextValue | null>(
  null,
);

interface ListingDraftProviderProps {
  children: ReactNode;
}

export function ListingDraftProvider({ children }: ListingDraftProviderProps) {
  const [state, setState] = useState<ListingDraftState>(initialState);

  const setInputMode = useCallback((mode: ListingInputMode) => {
    setState((prev) => ({
      ...prev,
      inputMode: mode,
      step: 'input',
      isDirty: true,
    }));
  }, []);

  const setStep = useCallback((step: ListingCreationStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setRawText = useCallback((rawText: string) => {
    setState((prev) => ({ ...prev, rawText, isDirty: true }));
  }, []);

  const setTranscript = useCallback((transcript: string) => {
    setState((prev) => ({ ...prev, transcript, isDirty: true }));
  }, []);

  const setAudioBlobUrl = useCallback((audioBlobUrl: string | null) => {
    setState((prev) => ({ ...prev, audioBlobUrl, isDirty: true }));
  }, []);

  const setExtractionResult = useCallback(
    (extractionResult: ExtractionResult | null) => {
      setState((prev) => ({ ...prev, extractionResult, isDirty: true }));
    },
    [],
  );

  const updateReviewValues = useCallback(
    (values: Partial<ExtractionReviewFormValues>) => {
      setState((prev) => ({
        ...prev,
        reviewValues: { ...prev.reviewValues, ...values },
        isDirty: true,
      }));
    },
    [],
  );

  const updateFormValues = useCallback((values: Partial<ListingFormValues>) => {
    setState((prev) => ({
      ...prev,
      formValues: { ...prev.formValues, ...values },
      isDirty: true,
    }));
  }, []);

  const setLocalDraftId = useCallback((localDraftId: string | null) => {
    setState((prev) => ({ ...prev, localDraftId }));
  }, []);

  const setBackendListingId = useCallback((backendListingId: string | null) => {
    setState((prev) => ({ ...prev, backendListingId }));
  }, []);

  const resetDraft = useCallback(() => {
    if (state.audioBlobUrl) {
      URL.revokeObjectURL(state.audioBlobUrl);
    }
    setState(initialState);
  }, [state.audioBlobUrl]);

  const markClean = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setInputMode,
      setStep,
      setRawText,
      setTranscript,
      setAudioBlobUrl,
      setExtractionResult,
      updateReviewValues,
      updateFormValues,
      setLocalDraftId,
      setBackendListingId,
      resetDraft,
      markClean,
    }),
    [
      state,
      setInputMode,
      setStep,
      setRawText,
      setTranscript,
      setAudioBlobUrl,
      setExtractionResult,
      updateReviewValues,
      updateFormValues,
      setLocalDraftId,
      setBackendListingId,
      resetDraft,
      markClean,
    ],
  );

  return (
    <ListingDraftContext.Provider value={value}>
      {children}
    </ListingDraftContext.Provider>
  );
}

export function useListingDraftContext() {
  const context = useContext(ListingDraftContext);
  if (!context) {
    throw new Error(
      'useListingDraftContext must be used within ListingDraftProvider',
    );
  }
  return context;
}

export { ListingDraftContext };
