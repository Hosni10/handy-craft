import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  CreateProductInput,
  CreateStoreInput,
  CreateWithdrawalInput,
  PaginatedResult,
  Product,
  SellerDashboard,
  SellerEarningsSummary,
  SellerOrderRow,
  SellerOrderStatusInput,
  StoreVerificationInput,
  UpdateProductInput,
  User,
  WithdrawalRow,
  PrintLabelResult,
} from '@handycraft/shared';

export function useSellerDashboard() {
  return useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => api.get<SellerDashboard>('/seller/dashboard'),
  });
}

export function useBecomeSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ id: string; role: string; name: string; phone: string }>('/seller/become', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller'] }),
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStoreInput) => api.post('/seller/store', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller'] }),
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StoreVerificationInput) => api.post('/seller/verification', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller'] }),
  });
}

export function useSellerUpload() {
  return useMutation({
    mutationFn: (files: File[]) => api.upload<{ urls: string[] }>('/seller/upload', files),
  });
}

export function useSellerProducts(page = 1) {
  return useQuery({
    queryKey: ['seller', 'products', page],
    queryFn: () => api.get<PaginatedResult<Product>>(`/seller/products?page=${page}&pageSize=20`),
  });
}

export function useCreateSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductInput) => api.post<Product>('/seller/products', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'products'] }),
  });
}

export function useUpdateSellerProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductInput) => api.patch<Product>(`/seller/products/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'products'] }),
  });
}

export function useDeleteSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/seller/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'products'] }),
  });
}

export function useSellerOrders(status?: string) {
  const qs = status ? `&status=${status}` : '';
  return useQuery({
    queryKey: ['seller', 'orders', status ?? 'all'],
    queryFn: () =>
      api.get<PaginatedResult<SellerOrderRow>>(`/seller/orders?page=1&pageSize=50${qs}`),
  });
}

export function useUpdateSellerOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: SellerOrderStatusInput & { id: string }) =>
      api.patch<SellerOrderRow>(`/seller/orders/${id}/status`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'orders'] });
      qc.invalidateQueries({ queryKey: ['seller', 'earnings'] });
    },
  });
}

export function useRequestPickup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ trackingNumber: string }>(`/seller/orders/${id}/pickup`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller', 'orders'] }),
  });
}

export function usePrintLabel() {
  return useMutation({
    mutationFn: (id: string) => api.get<PrintLabelResult>(`/seller/orders/${id}/label`),
  });
}

export function useSellerEarnings() {
  return useQuery({
    queryKey: ['seller', 'earnings'],
    queryFn: () => api.get<SellerEarningsSummary>('/seller/earnings'),
  });
}

export function useCreateWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWithdrawalInput) => api.post('/seller/withdrawals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'earnings'] });
      qc.invalidateQueries({ queryKey: ['seller', 'withdrawals'] });
    },
  });
}

export function useSellerWithdrawals() {
  return useQuery({
    queryKey: ['seller', 'withdrawals'],
    queryFn: () => api.get<WithdrawalRow[]>('/seller/withdrawals'),
  });
}
