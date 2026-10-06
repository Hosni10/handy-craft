import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Paintbrush, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import { useCustomOrderBuyerAction, useMyCustomOrders } from '@/hooks/useCustomOrders';
import { CUSTOM_ORDER_STATUS_AR, formatDate } from '@/lib/labels';
import { ApiError } from '@/lib/api';
import { formatEGP } from '@handycraft/shared';
import type { AcceptCustomOrderResult } from '@handycraft/shared';

export function CustomOrdersPage() {
  const { data, isLoading, isError, refetch } = useMyCustomOrders();
  const action = useCustomOrderBuyerAction();
  const [error, setError] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  async function run(id: string, kind: 'accept' | 'decline') {
    setError(null);
    try {
      const result = await action.mutateAsync({ id, action: kind });
      if (kind === 'accept') setPayUrl((result as AcceptCustomOrderResult).paymentIntent.iframeUrl);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تنفيذ الإجراء');
    }
  }

  return (
    <AccountLayout title="طلبات التخصيص">
      {payUrl && (
        <div className="mb-4 rounded-xl border border-olive-200 bg-olive-50 p-4 text-sm space-y-2">
          <p className="font-semibold text-olive-800">تم قبول العرض ودفع العربون — بدأ الحرفي التنفيذ</p>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={payUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              إيصال الدفع (تجريبي)
            </a>
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      {isLoading && <ListSkeleton rows={3} className="h-32" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState
          icon={Paintbrush}
          title="لا توجد طلبات تخصيص"
          description="اطلب تخصيص أي منتج «حسب الطلب» من صفحة المنتج"
          action={{ label: 'تصفح المنتجات', to: '/search?madeToOrder=true' }}
        />
      )}

      <ul className="space-y-3">
        {data?.map((c) => (
          <li key={c.id} className="border rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              {c.product.images[0] && (
                <img src={c.product.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${c.product.id}`} className="font-medium text-sm hover:underline line-clamp-1">
                  {c.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">{c.store.name} · {formatDate(c.createdAt)}</p>
              </div>
              <Badge variant="outline" className="h-fit shrink-0">{CUSTOM_ORDER_STATUS_AR[c.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{c.details}</p>

            {c.quotedPrice != null && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>السعر المقترح</span>
                  <span className="font-bold num-ar">{formatEGP(c.quotedPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>مدة التنفيذ</span>
                  <span className="num-ar">{c.quotedDays} يوم</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="num-ar">العربون ({c.depositPct}%)</span>
                  <span className="num-ar">{formatEGP(c.depositEgp ?? 0)}{c.depositPaid ? ' — مدفوع' : ''}</span>
                </div>
                {c.sellerNote && <p className="text-xs pt-1">ملاحظة الحرفي: {c.sellerNote}</p>}
              </div>
            )}

            {c.status === 'quoted' && (
              <div className="flex gap-2">
                <Button size="sm" disabled={action.isPending} onClick={() => run(c.id, 'accept')}>
                  {action.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `قبول ودفع العربون`}
                </Button>
                <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => run(c.id, 'decline')}>
                  رفض العرض
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </AccountLayout>
  );
}
