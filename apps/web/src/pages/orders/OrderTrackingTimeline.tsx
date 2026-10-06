import type { OrderStatus } from '@handycraft/shared';
import { CheckCircle2, Circle, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS: { key: OrderStatus | 'tracking'; label: string }[] = [
  { key: 'confirmed', label: 'تم التأكيد' },
  { key: 'preparing', label: 'قيد التجهيز' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivered', label: 'تم التسليم' },
];

const STATUS_RANK: Record<string, number> = {
  new: 0,
  confirmed: 1,
  preparing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refused: -1,
};

interface Props {
  status: OrderStatus;
  trackingNumber?: string | null;
}

export function OrderTrackingTimeline({ status, trackingNumber }: Props) {
  if (status === 'cancelled' || status === 'refused') {
    return (
      <p className="text-sm text-destructive">
        {status === 'cancelled' ? 'تم إلغاء هذا الطلب' : 'تم رفض استلام الطلب (COD)'}
      </p>
    );
  }

  const rank = STATUS_RANK[status] ?? 0;
  const effectiveRank = status === 'new' ? 0 : rank;

  return (
    <ol className="space-y-0">
      {STEPS.map((step, index) => {
        const stepRank = STATUS_RANK[step.key] ?? index + 1;
        const done = effectiveRank >= stepRank;
        const current = effectiveRank === stepRank || (status === 'new' && step.key === 'confirmed' && !done);

        return (
          <li key={step.key} className="flex gap-3 pb-6 last:pb-0 relative">
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  'absolute right-[11px] top-6 bottom-0 w-0.5',
                  done ? 'bg-olive-400' : 'bg-border'
                )}
              />
            )}
            <div className="relative z-10 shrink-0">
              {done ? (
                <CheckCircle2 className="h-6 w-6 text-olive-600" />
              ) : (
                <Circle className={cn('h-6 w-6', current ? 'text-terracotta-500' : 'text-muted-foreground/40')} />
              )}
            </div>
            <div className="pt-0.5">
              <p className={cn('font-medium text-sm', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </p>
              {step.key === 'shipped' && trackingNumber && done && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  رقم التتبع:{' '}
                  <span className="font-mono num-ar" dir="ltr">{trackingNumber}</span>
                </p>
              )}
              {step.key === 'preparing' && done && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  الحرفي يجهّز طلبك
                </p>
              )}
              {step.key === 'delivered' && done && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  وصل الطلب إلى عنوانك
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
