import { Link } from 'react-router-dom';
import { Package, AlertCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/useOrders';
import { formatEGP } from '@craftsouq/shared';
import type { OrderStatus } from '@craftsouq/shared';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  refused: 'مرفوض',
};

export function OrdersListPage() {
  const { data, isLoading, isError } = useOrders(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-3">
        <Skeleton className="h-8 w-32 rounded mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">تعذر تحميل الطلبات</p>
        <Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  const orders = data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <Package className="h-14 w-14 text-muted-foreground/60" />
        <div>
          <h1 className="text-xl font-bold">لا توجد طلبات بعد</h1>
          <p className="text-muted-foreground text-sm mt-1">عند شراء منتجات handmade ستظهر هنا</p>
        </div>
        <Button asChild><Link to="/search">تصفح المنتجات</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">طلباتي</h1>
      <ul className="space-y-3">
        {orders.map((order) => {
          const firstItem = order.items?.[0];
          const thumb = firstItem?.product?.images?.[0];
          return (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex gap-3 rounded-xl border p-4 hover:bg-muted/30 transition-colors"
              >
                {thumb ? (
                  <img src={thumb} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">#{order.orderNumber}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.store?.name}</p>
                  <p className="text-sm font-medium text-terracotta-600 num-ar mt-1">
                    {formatEGP(order.totalEgp)}
                  </p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0 self-center rtl-flip" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
