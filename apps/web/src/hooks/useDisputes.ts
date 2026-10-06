import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  DisputeDetail,
  DisputeMessageInput,
  DisputeSummary,
  OpenDisputeInput,
  WalletSummary,
} from '@handycraft/shared';

export function useOpenDispute(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OpenDisputeInput) => api.post<DisputeSummary>(`/orders/${orderId}/dispute`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}

export function useMyDisputes() {
  return useQuery({
    queryKey: ['disputes', 'mine'],
    queryFn: () => api.get<DisputeSummary[]>('/disputes'),
  });
}

/** Admins read disputes through /admin, everyone else through /disputes */
export function useDispute(id: string, asAdmin = false) {
  return useQuery({
    queryKey: ['dispute', id],
    queryFn: () => api.get<DisputeDetail>(asAdmin ? `/admin/disputes/${id}` : `/disputes/${id}`),
    enabled: !!id,
  });
}

export function useSendDisputeMessage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DisputeMessageInput) => api.post<DisputeDetail>(`/disputes/${id}/messages`, body),
    onSuccess: (data) => qc.setQueryData(['dispute', id], data),
  });
}

/** Any signed-in user can upload evidence images */
export function useFileUpload() {
  return useMutation({
    mutationFn: (files: File[]) => api.upload<{ urls: string[] }>('/files', files),
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.get<WalletSummary>('/wallet'),
  });
}
