import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AdminKpis,
  AdminProductRow,
  AdminReports,
  AdminSettlements,
  AdminStoreRow,
  AdminVerificationRow,
  Banner,
  BannerInput,
  BadgeStatus,
  Category,
  CategoryInput,
  DisputeDetail,
  DisputeStatus,
  DisputeSummary,
  ResolveDisputeInput,
  UpdateBannerInput,
} from '@handycraft/shared';

export function useAdminKpis() {
  return useQuery({ queryKey: ['admin', 'kpis'], queryFn: () => api.get<AdminKpis>('/admin/kpis') });
}

export function useAdminReports(days: number) {
  return useQuery({
    queryKey: ['admin', 'reports', days],
    queryFn: () => api.get<AdminReports>(`/admin/reports?days=${days}`),
  });
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export function useAdminVerifications() {
  return useQuery({
    queryKey: ['admin', 'verifications'],
    queryFn: () => api.get<AdminVerificationRow[]>('/admin/verifications?status=pending'),
  });
}

export function useAdminPendingProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.get<AdminProductRow[]>('/admin/products?status=pending'),
  });
}

/** Approve or reject a verification / product. `reason` is required for reject. */
export function useAdminReview(kind: 'verifications' | 'products') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve, reason }: { id: string; approve: boolean; reason?: string }) =>
      api.post(`/admin/${kind}/${id}/${approve ? 'approve' : 'reject'}`, approve ? {} : { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', kind] });
      qc.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });
}

// ─── Disputes ────────────────────────────────────────────────────────────────

export function useAdminDisputes(status?: DisputeStatus) {
  return useQuery({
    queryKey: ['admin', 'disputes', status ?? 'all'],
    queryFn: () => api.get<DisputeSummary[]>(`/admin/disputes${status ? `?status=${status}` : ''}`),
  });
}

export function useAdminDisputeAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { action: 'review' } | ({ action: 'resolve' } & ResolveDisputeInput)) => {
      const { action, ...body } = args;
      return api.post<DisputeDetail>(`/admin/disputes/${id}/${action}`, body);
    },
    onSuccess: (data) => {
      qc.setQueryData(['dispute', id], data);
      qc.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      qc.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });
}

// ─── Settlements ─────────────────────────────────────────────────────────────

export function useAdminSettlements() {
  return useQuery({
    queryKey: ['admin', 'settlements'],
    queryFn: () => api.get<AdminSettlements>('/admin/settlements'),
  });
}

export function useAdminWithdrawalAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'paid' | 'reject'; reason?: string }) =>
      api.post(`/admin/withdrawals/${id}/${action}`, action === 'reject' ? { reason } : {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settlements'] });
      qc.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

export function useAdminBanners() {
  return useQuery({ queryKey: ['admin', 'banners'], queryFn: () => api.get<Banner[]>('/admin/banners') });
}

export function useAdminBannerMutations() {
  const qc = useQueryClient();
  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
    qc.invalidateQueries({ queryKey: ['banners'] });
  };
  return {
    create: useMutation({ mutationFn: (body: BannerInput) => api.post<Banner>('/admin/banners', body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, ...body }: UpdateBannerInput & { id: string }) => api.patch<Banner>(`/admin/banners/${id}`, body),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: string) => api.del(`/admin/banners/${id}`), onSuccess }),
  };
}

export function useAdminCategoryMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: ['categories'] });
  return {
    create: useMutation({ mutationFn: (body: CategoryInput) => api.post<Category>('/admin/categories', body), onSuccess }),
    update: useMutation({
      mutationFn: ({ id, ...body }: Partial<CategoryInput> & { id: string }) =>
        api.patch<Category>(`/admin/categories/${id}`, body),
      onSuccess,
    }),
    remove: useMutation({ mutationFn: (id: string) => api.del(`/admin/categories/${id}`), onSuccess }),
  };
}

export function useAdminStores() {
  return useQuery({ queryKey: ['admin', 'stores'], queryFn: () => api.get<AdminStoreRow[]>('/admin/stores') });
}

export function useAdminSetBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, badgeStatus }: { id: string; badgeStatus: BadgeStatus }) =>
      api.patch(`/admin/stores/${id}/badge`, { badgeStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'stores'] });
      qc.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
