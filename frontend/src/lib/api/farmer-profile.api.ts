import { apiGet, apiPost, apiPut } from './client';
import type { FarmerProfile, FarmerProfileUpdate, OnboardingData } from '@/types/farmer';

export async function getFarmerProfile(): Promise<FarmerProfile> {
  const response = await apiGet<FarmerProfile>('/farmers/profile');
  return response.data;
}

export async function updateFarmerProfile(update: FarmerProfileUpdate): Promise<FarmerProfile> {
  const response = await apiPut<FarmerProfile>('/farmers/profile', update);
  return response.data;
}

export async function completeOnboarding(data: OnboardingData): Promise<FarmerProfile> {
  const response = await apiPost<FarmerProfile>('/farmers/onboarding', data);
  return response.data;
}
