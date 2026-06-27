export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  region: string;
  district: string;
  village?: string;
  gpsCoordinates?: { lat: number; lng: number };
  farmSizeAcres?: number;
  primaryCrops: string[];
  bio?: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  farmName: string;
  region: string;
  district: string;
  village?: string;
  gpsCoordinates?: { lat: number; lng: number };
  farmSizeAcres?: number;
  primaryCrops: string[];
  bio?: string;
}

export interface FarmerProfileUpdate {
  farmName?: string;
  region?: string;
  district?: string;
  village?: string;
  gpsCoordinates?: { lat: number; lng: number };
  farmSizeAcres?: number;
  primaryCrops?: string[];
  bio?: string;
}
