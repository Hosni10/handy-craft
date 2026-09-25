import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResult, Product, Category } from '@craftsouq/shared';

interface ProductFilter {
  q?: string;
  categoryId?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  madeToOrder?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  pageSize?: number;
}

function toQueryString(params: object): string {
  const record = params as Record<string, unknown>;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(record)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  return qs.toString() ? `?${qs.toString()}` : '';
}

export function useProducts(filters: ProductFilter = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get<PaginatedResult<Product>>(`/products${toQueryString(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => api.get<Product[]>('/products/new-arrivals'),
  });
}

export function useReadyToShip() {
  return useQuery({
    queryKey: ['products', 'ready-to-ship'],
    queryFn: () => api.get<Product[]>('/products/ready-to-ship'),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<Product[]>('/products/featured'),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

export function useVerifiedStores() {
  return useQuery({
    queryKey: ['stores', 'verified'],
    queryFn: () => api.get<unknown[]>('/stores/verified'),
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => api.get<unknown>(`/stores/${id}`),
    enabled: !!id,
  });
}

export function useStoreProducts(storeId: string, page = 1) {
  return useQuery({
    queryKey: ['store-products', storeId, page],
    queryFn: () =>
      api.get<PaginatedResult<Product>>(`/stores/${storeId}/products?page=${page}&pageSize=20`),
    enabled: !!storeId,
  });
}
