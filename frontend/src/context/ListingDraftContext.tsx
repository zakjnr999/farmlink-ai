import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ExtractionResult, ProduceListing } from '../api/types';

export interface ListingDraft {
  extraction: ExtractionResult | null;
  title: string;
  description: string;
  categoryId: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  availableFrom: string;
  region: string;
  district: string;
  town: string;
  latitude: number;
  longitude: number;
  pricePerUnit: number | null;
  minimumOrderQuantity: number | null;
  publishedListing: ProduceListing | null;
}

const defaultDraft: ListingDraft = {
  extraction: null,
  title: '',
  description: '',
  categoryId: '',
  quantity: 0,
  unit: 'crate',
  harvestDate: '',
  availableFrom: '',
  region: '',
  district: '',
  town: '',
  latitude: 6.6885,
  longitude: -1.6244,
  pricePerUnit: null,
  minimumOrderQuantity: null,
  publishedListing: null,
};

interface ListingDraftContextValue {
  draft: ListingDraft;
  setDraft: (patch: Partial<ListingDraft>) => void;
  resetDraft: () => void;
  applyExtraction: (extraction: ExtractionResult) => void;
}

const ListingDraftContext = createContext<ListingDraftContextValue | null>(null);

export function ListingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<ListingDraft>(defaultDraft);

  const value = useMemo(
    () => ({
      draft,
      setDraft: (patch: Partial<ListingDraft>) =>
        setDraftState((prev) => ({ ...prev, ...patch })),
      resetDraft: () => setDraftState(defaultDraft),
      applyExtraction: (extraction: ExtractionResult) => {
        setDraftState((prev) => ({
          ...prev,
          extraction,
          title: extraction.produceName
            ? `Fresh ${extraction.produceName}${extraction.location.town ? ` — ${extraction.location.town}` : ''}`
            : prev.title,
          description: prev.description || extraction.produceName || '',
          categoryId: extraction.suggestedCategoryId ?? prev.categoryId,
          quantity: extraction.quantity ?? prev.quantity,
          unit: extraction.unit ?? prev.unit,
          harvestDate: extraction.harvestDate ?? prev.harvestDate,
          availableFrom: extraction.availableFrom ?? prev.availableFrom,
          region: extraction.location.region ?? prev.region,
          district: extraction.location.district ?? prev.district,
          town: extraction.location.town ?? prev.town,
          pricePerUnit: extraction.pricePerUnit,
          minimumOrderQuantity: extraction.minimumOrderQuantity,
        }));
      },
    }),
    [draft],
  );

  return (
    <ListingDraftContext.Provider value={value}>{children}</ListingDraftContext.Provider>
  );
}

export function useListingDraft() {
  const ctx = useContext(ListingDraftContext);
  if (!ctx) throw new Error('useListingDraft must be used within ListingDraftProvider');
  return ctx;
}
