export interface TransportSuggestion {
  id: string;
  transactionId?: string;
  transporterName: string;
  transporterPhone: string;
  vehicleType: string;
  estimatedCost: number;
  currency: string;
  estimatedDurationHours?: number;
  distanceKm: number;
  rating?: number;
  notes?: string;
}
