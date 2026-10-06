import type { BadgeStatus, CustomOrderStatus, DisputeStatus, WithdrawalMethod, WithdrawalStatus } from '@handycraft/shared';

export const CUSTOM_ORDER_STATUS_AR: Record<CustomOrderStatus, string> = {
  pending: 'بانتظار التسعير',
  quoted: 'تم التسعير',
  accepted: 'مقبول — قيد التنفيذ',
  rejected: 'مرفوض',
  completed: 'مكتمل',
};

export const DISPUTE_STATUS_AR: Record<DisputeStatus, string> = {
  open: 'مفتوح',
  under_review: 'قيد المراجعة',
  resolved_buyer: 'حُسم لصالح المشتري',
  resolved_seller: 'حُسم لصالح الحرفي',
};

export const BADGE_STATUS_AR: Record<BadgeStatus, string> = {
  unverified: 'غير موثق',
  pending: 'قيد المراجعة',
  verified: 'موثق',
  rejected: 'مرفوض',
};

export const WITHDRAWAL_STATUS_AR: Record<WithdrawalStatus, string> = {
  pending: 'قيد المراجعة',
  paid: 'مدفوع',
  rejected: 'مرفوض',
};

export const WITHDRAWAL_METHOD_AR: Record<WithdrawalMethod, string> = {
  instapay: 'InstaPay',
  vodafone_cash: 'فودافون كاش',
  bank: 'حساب بنكي',
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { dateStyle: 'medium' });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}
