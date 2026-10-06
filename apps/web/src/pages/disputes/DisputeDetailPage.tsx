import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ListStates';
import { DisputeThread } from '@/components/disputes/DisputeThread';
import { useDispute } from '@/hooks/useDisputes';
import { useAuthStore } from '@/store/auth.store';

/** Dispute thread for the buyer or the seller involved */
export function DisputeDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDispute(id);
  const isBuyer = useAuthStore((s) => s.user?.role) === 'BUYER';
  const backTo = isBuyer ? '/account/disputes' : '/seller/disputes';

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Link to={backTo} className="hover:text-foreground">النزاعات</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="text-foreground">تفاصيل النزاع</span>
      </nav>
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      )}
      {isError && <ErrorState message="النزاع غير موجود" onRetry={() => refetch()} />}
      {data && (
        <DisputeThread dispute={data} orderLink={isBuyer ? `/orders/${data.orderId}` : undefined} />
      )}
    </div>
  );
}
