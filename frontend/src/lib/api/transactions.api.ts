import { apiGet } from './client';
import type { Transaction } from '@/types/transaction';

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiGet<Transaction[]>('/transactions');
  return response.data;
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await apiGet<Transaction>(`/transactions/${id}`);
  return response.data;
}
