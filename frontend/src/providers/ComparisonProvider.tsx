'use client';

import type { MarketplaceListing } from '@/types/buyer';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const MAX_COMPARE = 3;

interface ComparisonContextValue {
  items: MarketplaceListing[];
  addItem: (listing: MarketplaceListing) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  isInComparison: (id: string) => boolean;
  isFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MarketplaceListing[]>([]);

  const addItem = useCallback((listing: MarketplaceListing) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === listing.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, listing];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearItems,
      isInComparison: (id: string) => items.some((i) => i.id === id),
      isFull: items.length >= MAX_COMPARE,
    }),
    [items, addItem, removeItem, clearItems],
  );

  return (
    <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return ctx;
}
