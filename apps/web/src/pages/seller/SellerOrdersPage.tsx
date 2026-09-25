import { useState } from 'react';
import { Truck, Printer, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerLayout } from '@/components/seller/SellerLayout';
import {
  useSellerOrders,
  useUpdateSellerOrderStatus,
  useRequestPickup,
  usePrintLabel,
} from '@/hooks/useSeller';
import { formatEGP } from '@craftsouq/shared';
import type { OrderStatus, SellerOrderRow, SellerOrderStatusInput } from '@craftsouq/shared';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api';

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'new', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'preparing', label: 'تجهيز' },
  { key: 'shipped', label: 'شحن' },
  { key: 'delivered', label: 'مُسلّم' },
];

const STATUS_AR: Record<OrderStatus, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  refused: 'مرفوض',
};

function printLabelWindow(label: Awaited<ReturnType<ReturnType<typeof usePrintLabel>['mutateAsync']>>) {
  const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>ملصق ${label.orderNumber}</title>
  <style>body{font-family:sans-serif;padding:24px} .box{border:2px dashed #333;padding:16px;max-width:360px}</style></head>
  <body onload="window.print()"><div class="box">
  <h2>Bosta — CraftSouq</h2>
  <p><strong>من:</strong> ${label.storeName}</p>
  <p><strong>إلى:</strong> ${label.buyerName}</p>
  <p>${label.addressLine}</p>
  <p><strong>COD:</strong> ${label.codAmount} EGP</p>
  <p><strong>تتبع:</strong> ${label.trackingNumber ?? '—'}</p>
  <p><strong>طلب:</strong> #${label.orderNumber}</p>
  </div></body></html>`;
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export function SellerOrdersPage() {
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const statusFilter = tab === 'all' ? undefined : tab;
  const { data, isLoading, isError } = useSellerOrders(statusFilter);
  const updateStatus = useUpdateSellerOrderStatus();
  const requestPickup = useRequestPickup();
  const printLabel = usePrintLabel();
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, status: SellerOrderStatusInput['status']) {
    setError(null);
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تحديث الحالة');
    }
  }

  async function pickup(id: string) {
    setError(null);
    try {
      await requestPickup.mutateAsync(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر طلب الشحن');
    }
  }

  async function label(id: string) {
    try {
      const result = await printLabel.mutateAsync(id);
      printLabelWindow(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر طباعة الملصق');
    }
  }

  function actions(order: SellerOrderRow) {
    const btns: React.ReactNode[] = [];
    if (order.status === 'new') {
      btns.push(<Button key="c" size="sm" onClick={() => act(order.id, 'confirmed')}>تأكيد</Button>);
      btns.push(<Button key="x" size="sm" variant="outline" onClick={() => act(order.id, 'cancelled')}>إلغاء</Button>);
    }
    if (order.status === 'confirmed') {
      btns.push(<Button key="p" size="sm" onClick={() => act(order.id, 'preparing')}>بدء التجهيز</Button>);
      btns.push(<Button key="pk" size="sm" variant="secondary" className="gap-1" onClick={() => pickup(order.id)}><Truck className="h-3.5 w-3.5" />Bosta</Button>);
    }
    if (order.status === 'preparing') {
      btns.push(<Button key="pk2" size="sm" variant="secondary" className="gap-1" onClick={() => pickup(order.id)}><Truck className="h-3.5 w-3.5" />طلب استلام</Button>);
    }
    if (order.status === 'shipped') {
      btns.push(<Button key="d" size="sm" onClick={() => act(order.id, 'delivered')}>تم التسليم</Button>);
    }
    if (order.shipment?.trackingNumber) {
      btns.push(
        <Button key="l" size="sm" variant="outline" className="gap-1" onClick={() => label(order.id)}>
          <Printer className="h-3.5 w-3.5" />
          ملصق
        </Button>
      );
    }
    return btns;
  }

  return (
    <SellerLayout title="طلبات المتجر">
      <div className="flex gap-1 overflow-x-auto pb-3 mb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border',
              tab === t.key ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          تعذر تحميل الطلبات
        </div>
      )}

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <p className="text-center py-16 text-muted-foreground border rounded-xl">لا طلبات في هذا القسم</p>
      )}

      <ul className="space-y-3">
        {data?.items.map((order) => (
          <li key={order.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{order.buyerName} · {order.itemsCount} منتج</p>
              </div>
              <Badge variant="outline">{STATUS_AR[order.status]}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">صافي الحرفي</span>
              <span className="font-bold text-olive-700 num-ar">{formatEGP(order.netEgp)}</span>
            </div>
            {order.shipment?.trackingNumber && (
              <p className="text-xs text-muted-foreground" dir="ltr">Tracking: {order.shipment.trackingNumber}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {actions(order)}
              {(updateStatus.isPending || requestPickup.isPending) && <Loader2 className="h-4 w-4 animate-spin self-center" />}
            </div>
          </li>
        ))}
      </ul>
    </SellerLayout>
  );
}
