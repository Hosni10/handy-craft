import { useState } from 'react';
import { Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RejectWithReason } from '@/components/admin/RejectWithReason';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import { useAdminSettlements, useAdminWithdrawalAction } from '@/hooks/useAdmin';
import { WITHDRAWAL_METHOD_AR, WITHDRAWAL_STATUS_AR, formatDate } from '@/lib/labels';
import { ApiError } from '@/lib/api';
import { formatEGP } from '@handycraft/shared';

export function AdminSettlementsPage() {
  const { data, isLoading, isError, refetch } = useAdminSettlements();
  const action = useAdminWithdrawalAction();
  const [error, setError] = useState<string | null>(null);

  async function run(id: string, kind: 'paid' | 'reject', reason?: string) {
    setError(null);
    try {
      await action.mutateAsync({ id, action: kind, reason });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تنفيذ الإجراء');
    }
  }

  return (
    <AdminLayout title="التسويات الأسبوعية">
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      {isLoading && <ListSkeleton rows={3} className="h-40" />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div className="space-y-5">
            {data.weeks.length === 0 && (
              <EmptyState icon={Banknote} title="لا توجد طلبات سحب" description="آخر 8 أسابيع" />
            )}
            {data.weeks.map((week) => (
              <section key={week.weekStart} className="rounded-xl border">
                <header className="flex flex-wrap justify-between gap-2 p-4 border-b bg-muted/30">
                  <p className="font-semibold text-sm">أسبوع {formatDate(week.weekStart)}</p>
                  <p className="text-xs text-muted-foreground num-ar">
                    معلّق {formatEGP(week.pendingEgp)} · مدفوع {formatEGP(week.paidEgp)}
                  </p>
                </header>
                <ul className="divide-y">
                  {week.withdrawals.map((w) => (
                    <li key={w.id} className="p-4 space-y-2">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{w.storeName ?? w.sellerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {WITHDRAWAL_METHOD_AR[w.method]} · <span dir="ltr">{w.destination}</span>
                          </p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-bold num-ar">{formatEGP(w.amount)}</p>
                          <Badge variant="outline">{WITHDRAWAL_STATUS_AR[w.status]}</Badge>
                        </div>
                      </div>
                      {w.adminNote && <p className="text-xs text-muted-foreground">ملاحظة: {w.adminNote}</p>}
                      {w.status === 'pending' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" disabled={action.isPending} onClick={() => run(w.id, 'paid')}>
                            تم التحويل
                          </Button>
                          <RejectWithReason disabled={action.isPending} onReject={(reason) => run(w.id, 'reject', reason)} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="rounded-xl border p-4">
            <h2 className="font-semibold text-sm mb-3">أرصدة الحرفيين</h2>
            {data.sellerBalances.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد حرفيون بعد</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.sellerBalances.map((s) => (
                  <li key={s.sellerId} className="flex justify-between gap-2">
                    <span className="line-clamp-1">{s.storeName ?? s.sellerName}</span>
                    <span className="num-ar font-medium shrink-0">{formatEGP(s.balanceEgp)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
