import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorState } from '@/components/common/ListStates';
import { DisputeThread } from '@/components/disputes/DisputeThread';
import { useDispute } from '@/hooks/useDisputes';
import { useAdminDisputeAction } from '@/hooks/useAdmin';
import { ApiError } from '@/lib/api';
import { formatEGP } from '@handycraft/shared';

export function AdminDisputeDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDispute(id, true);
  const action = useAdminDisputeAction(id);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const open = data && (data.status === 'open' || data.status === 'under_review');

  async function run(args: Parameters<typeof action.mutateAsync>[0]) {
    setError(null);
    try {
      await action.mutateAsync(args);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تنفيذ الإجراء');
    }
  }

  return (
    <AdminLayout title="تفاصيل النزاع">
      <Link to="/admin/disputes" className="flex items-center gap-1 text-xs text-muted-foreground mb-4 hover:text-foreground">
        <ChevronRight className="h-3 w-3 rtl-flip" />
        كل النزاعات
      </Link>

      {isLoading && <Skeleton className="h-80 rounded-xl" />}
      {isError && <ErrorState message="النزاع غير موجود" onRetry={() => refetch()} />}

      {data && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">
          <DisputeThread dispute={data} />

          {open && (
            <section className="rounded-xl border p-4 space-y-3 lg:sticky lg:top-20">
              <h3 className="font-semibold text-sm">قرار الإدارة</h3>
              {data.status === 'open' && (
                <Button size="sm" variant="outline" className="w-full" disabled={action.isPending} onClick={() => run({ action: 'review' })}>
                  بدء المراجعة
                </Button>
              )}
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="سبب القرار (يظهر للطرفين)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground num-ar">
                الحسم لصالح المشتري يعيد {formatEGP(data.orderTotalEgp)} إلى محفظته ويخصم أرباح الحرفي من هذا الطلب.
              </p>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  disabled={action.isPending || note.trim().length < 3}
                  onClick={() => run({ action: 'resolve', outcome: 'buyer', note })}
                >
                  {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'لصالح المشتري (استرداد)'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={action.isPending || note.trim().length < 3}
                  onClick={() => run({ action: 'resolve', outcome: 'seller', note })}
                >
                  لصالح الحرفي
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
