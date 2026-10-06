import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AcceptCustomOrderResult,
  CreateCustomOrderInput,
  CustomOrderRow,
  CustomOrderStatus,
  QuoteCustomOrderInput,
} from '@handycraft/shared';

export function useCreateCustomOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomOrderInput) => api.post<CustomOrderRow>('/custom-orders', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-orders'] }),
  });
}

export function useMyCustomOrders() {
  return useQuery({
    queryKey: ['custom-orders', 'mine'],
    queryFn: () => api.get<CustomOrderRow[]>('/custom-orders/mine'),
  });
}

export function useSellerCustomOrders(status?: CustomOrderStatus) {
  return useQuery({
    queryKey: ['custom-orders', 'inbox', status ?? 'all'],
    queryFn: () =>
      api.get<CustomOrderRow[]>(`/custom-orders/inbox${status ? `?status=${status}` : ''}`),
  });
}

/** Buyer actions: accept (pays deposit) / decline a quote */
export function useCustomOrderBuyerAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      api.post<AcceptCustomOrderResult | CustomOrderRow>(`/custom-orders/${id}/${action}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-orders'] }),
  });
}

export function useQuoteCustomOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: QuoteCustomOrderInput & { id: string }) =>
      api.patch<CustomOrderRow>(`/custom-orders/${id}/quote`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-orders'] }),
  });
}

/** Seller actions: reject a new request / mark an accepted one completed */
export function useCustomOrderSellerAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'reject' | 'complete' }) =>
      api.post<CustomOrderRow>(`/custom-orders/${id}/${action}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-orders'] }),
  });
}
