import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { EmptyState, ErrorState } from '@/components/common/ListStates';
import { useWallet } from '@/hooks/useDisputes';
import { formatDateTime } from '@/lib/labels';
import { formatEGP } from '@handycraft/shared';

export function WalletPage() {
  const { data, isLoading, isError, refetch } = useWallet();

  return (
    <AccountLayout title="محفظتي">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}
      {isError && <ErrorState message="تعذر تحميل المحفظة" onRetry={() => refetch()} />}
      {data && (
        <>
          <div className="rounded-xl border p-5 bg-olive-50/50 mb-6">
            <p className="text-xs text-muted-foreground">الرصيد المتاح</p>
            <p className="text-3xl font-bold text-olive-800 num-ar">{formatEGP(data.balanceEgp)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              يُضاف إلى محفظتك أي مبلغ مسترد من النزاعات المحسومة لصالحك.
            </p>
          </div>

          <h2 className="font-semibold mb-3">سجل المعاملات</h2>
          {data.transactions.length === 0 ? (
            <EmptyState icon={Wallet} title="لا توجد معاملات بعد" action={{ label: 'تسوق الآن', to: '/search' }} />
          ) : (
            <ul className="rounded-xl border divide-y">
              {data.transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="line-clamp-1">{t.note ?? t.refType}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className={t.type === 'credit' ? 'text-olive-700 num-ar font-medium' : 'text-destructive num-ar font-medium'}>
                    {t.type === 'credit' ? '+' : '-'}
                    {formatEGP(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AccountLayout>
  );
}
