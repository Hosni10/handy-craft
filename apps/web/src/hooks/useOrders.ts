import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  CreateOrderInput,
  CreateOrderResult,
  OrderDetail,
  PaginatedResult,
  ShippingQuote,
  Review,
  ConfirmCodOtpInput,
  CreateReviewInput,
} from '@craftsouq/shared';

type OrderListItem = OrderDetail;

export function useShippingQuote(governorate: string | undefined) {
  return useQuery({
    queryKey: ['shipping-quote', governorate],
    queryFn: () =>
      api.get<ShippingQuote>(`/orders/shipping-quote?governorate=${encodeURIComponent(governorate!)}`),
    enabled: !!governorate && governorate.length > 0,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderInput) => api.post<CreateOrderResult>('/orders', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () =>
      api.get<PaginatedResult<OrderListItem>>(`/orders?page=${page}&pageSize=10`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<OrderDetail>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useResendCodOtp(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ sent: boolean; expiresAt: string; devCode?: string }>(
        `/orders/${orderId}/cod/resend`,
        {}
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', orderId] }),
  });
}

export function useConfirmCodOtp(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ConfirmCodOtpInput) =>
      api.post<OrderDetail>(`/orders/${orderId}/cod/confirm`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateReview(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewInput) =>
      api.post<Review>(`/orders/${orderId}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useStoreReviews(storeId: string) {
  return useQuery({
    queryKey: ['store-reviews', storeId],
    queryFn: () => api.get<Review[]>(`/stores/${storeId}/reviews`),
    enabled: !!storeId,
  });
}
