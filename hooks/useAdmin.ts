'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminProductUpdate, Order } from '@/types';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiFetch<{ products: unknown[] }>('/api/admin/products').then((d) => d.products),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: AdminProductUpdate }) =>
      apiFetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiFetch<{ orders: Order[] }>('/api/admin/orders').then((d) => d.orders),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiFetch<{ totalOrders: number; revenue: number; productCount: number }>('/api/admin/stats'),
  });
}

export function useGlobalMarkup() {
  return useQuery({
    queryKey: ['global-markup'],
    queryFn: () => apiFetch<{ markup: number }>('/api/admin/pricing').then((d) => d.markup),
  });
}

export function useSetGlobalMarkup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (markup: number) =>
      apiFetch('/api/admin/pricing', { method: 'POST', body: JSON.stringify({ markup }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-markup'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
