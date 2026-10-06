import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import { DISPUTE_STATUS_AR, formatDate } from '@/lib/labels';
import { formatEGP } from '@handycraft/shared';
import type { DisputeSummary } from '@handycraft/shared';

interface Props {
  disputes?: DisputeSummary[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** Builds the detail link for a dispute */
  linkTo: (id: string) => string;
}

export function DisputesList({ disputes, isLoading, isError, onRetry, linkTo }: Props) {
  if (isLoading) return <ListSkeleton rows={3} className="h-20" />;
  if (isError) return <ErrorState message="تعذر تحميل النزاعات" onRetry={onRetry} />;
  if (!disputes?.length) {
    return <EmptyState icon={ShieldCheck} title="لا توجد نزاعات" description="كل طلباتك تسير بشكل جيد" />;
  }

  return (
    <ul className="space-y-3">
      {disputes.map((d) => (
        <li key={d.id}>
          <Link to={linkTo(d.id)} className="block border rounded-xl p-4 hover:bg-muted/40 transition-colors">
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">طلب #{d.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {d.buyerName} ← {d.storeName} · {formatDate(d.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">{DISPUTE_STATUS_AR[d.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{d.reason}</p>
            <p className="text-xs mt-1 num-ar">{formatEGP(d.orderTotalEgp)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
