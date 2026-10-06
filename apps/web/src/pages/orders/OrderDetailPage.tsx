import { Link, useSearchParams, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useOrder } from '@/hooks/useOrders';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { CodOtpPanel } from './CodOtpPanel';
import { ReviewForm } from './ReviewForm';
import { DisputePanel } from './DisputePanel';
import { formatEGP } from '@handycraft/shared';
import type { OrderStatus } from '@handycraft/shared';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  refused: 'مرفوض',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const placed = searchParams.get('placed') === '1';
  const devOtp = searchParams.get('devOtp');
  const payUrl = searchParams.get('payUrl');

  const { data: order, isLoading, isError } = useOrder(id ?? '');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">الطلب غير موجود</p>
        <Button variant="outline" asChild><Link to="/orders">طلباتي</Link></Button>
      </div>
    );
  }

  function dismissBanner() {
    searchParams.delete('placed');
    searchParams.delete('devOtp');
    searchParams.delete('payUrl');
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Link to="/orders" className="hover:text-foreground">طلباتي</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="text-foreground">طلب #{order.orderNumber}</span>
      </nav>

      {placed && (
        <div className="mb-6 rounded-xl border border-olive-200 bg-olive-50 p-4 space-y-2">
          <p className="font-semibold text-olive-800">تم إنشاء طلبك بنجاح!</p>
          <p className="text-sm text-muted-foreground">
            رقم الطلب: <span className="font-mono font-bold num-ar">{order.orderNumber}</span>
          </p>
          {devOtp && (
            <p className="text-xs text-muted-foreground">
              رمز تأكيد COD (بيئة التطوير):{' '}
              <span className="font-mono font-bold" dir="ltr">{devOtp}</span>
            </p>
          )}
          {payUrl && order.paymentMethod === 'electronic' && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={payUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                إكمال الدفع الإلكتروني (تجريبي)
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={dismissBanner}>إغلاق</Button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">طلب #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {order.store?.name} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('ar-EG', {
              dateStyle: 'medium',
            })}
          </p>
        </div>
        <Badge variant="outline">{STATUS_LABELS[order.status]}</Badge>
      </div>

      <div className="space-y-6">
        <CodOtpPanel
          orderId={order.id}
          codOtp={order.codOtp}
          paymentMethod={order.paymentMethod}
        />

        <section className="rounded-xl border p-4">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            تتبع الطلب
          </h2>
          <OrderTrackingTimeline
            status={order.status}
            trackingNumber={order.shipment?.trackingNumber}
          />
        </section>

        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">المنتجات</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`} className="text-sm font-medium hover:underline line-clamp-2">
                    {item.product?.name ?? 'منتج'}
                  </Link>
                  <p className="text-xs text-muted-foreground num-ar">الكمية: {item.qty}</p>
                </div>
                <span className="text-sm font-medium num-ar">{formatEGP(item.unitPrice * item.qty)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>المجموع</span>
              <span className="num-ar">{formatEGP(order.subtotalEgp)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>الشحن</span>
              <span className="num-ar">{formatEGP(order.shippingFeeEgp)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>الإجمالي</span>
              <span className="text-terracotta-600 num-ar">{formatEGP(order.totalEgp)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-4 text-sm space-y-1">
          <h2 className="font-semibold mb-2">عنوان التوصيل</h2>
          <p>{order.addressSnapshot.name}</p>
          <p dir="ltr" className="text-muted-foreground">{order.addressSnapshot.phone}</p>
          <p className="text-muted-foreground">
            {order.addressSnapshot.governorate} — {order.addressSnapshot.street}
            {order.addressSnapshot.apartment ? `، ${order.addressSnapshot.apartment}` : ''}
          </p>
        </section>

        <ReviewForm
          orderId={order.id}
          existingReview={order.review}
          canReview={order.canReview}
        />

        <DisputePanel order={order} />
      </div>
    </div>
  );
}