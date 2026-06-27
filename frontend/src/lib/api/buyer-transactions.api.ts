import { apiGet } from './client';
import type { Transaction } from '@/types/transaction';

export async function getBuyerTransactions(): Promise<Transaction[]> {
  const response = await apiGet<Transaction[]>('/buyers/transactions');
  return response.data;
}

export async function getBuyerTransaction(id: string): Promise<Transaction> {
  const response = await apiGet<Transaction>(`/buyers/transactions/${id}`);
  return response.data;
}
