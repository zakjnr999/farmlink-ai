import { apiGet } from './client';
import type { ProduceCategory } from '@/types/category';

export async function getCategories(): Promise<ProduceCategory[]> {
  const response = await apiGet<ProduceCategory[]>('/categories');
  return response.data;
}

export async function getCategory(id: string): Promise<ProduceCategory> {
  const response = await apiGet<ProduceCategory>(`/categories/${id}`);
  return response.data;
}

export async function getActiveCategories(): Promise<ProduceCategory[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.active);
}
