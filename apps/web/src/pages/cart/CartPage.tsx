import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useCartStore, cartSubtotal } from '@/store/cart.store';
import { formatEGP } from '@handycraft/shared';

export function CartPage() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const linesByStore = useCartStore((s) => s.linesByStore());

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground/60" />
        <div>
          <h1 className="text-xl font-bold">عربة التسوق فارغة</h1>
          <p className="text-muted-foreground text-sm mt-1">تصفح منتجات الحرفيين وأضف ما يعجبك</p>
        </div>
        <Button asChild>
          <Link to="/search">تصفح المنتجات</Link>
        </Button>
      </div>
    );
  }

  const storeGroups = Object.entries(linesByStore);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">عربة التسوق</h1>

      <div className="space-y-8">
        {storeGroups.map(([storeId, storeLines]) => {
          const subtotal = cartSubtotal(storeLines);
          const storeName = storeLines[0]?.storeName ?? 'متجر';

          return (
            <section key={storeId} className="rounded-xl border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{storeName}</p>
                <Link to={`/stores/${storeId}`} className="text-xs text-terracotta-600 hover:underline">
                  زيارة المتجر
                </Link>
              </div>

              <ul className="divide-y">
                {storeLines.map((line) => (
                  <li key={line.productId} className="p-4 flex gap-3">
                    <Link to={`/products/${line.productId}`} className="shrink-0">
                      <img
                        src={line.image}
                        alt={line.name}
                        className="h-20 w-20 rounded-lg object-cover bg-muted"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Link
                        to={`/products/${line.productId}`}
                        className="font-medium text-sm line-clamp-2 hover:text-terracotta-600"
                      >
                        {line.name}
                      </Link>
                      <p className="text-terracotta-600 font-bold num-ar">{formatEGP(line.priceEgp)}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            className="p-2 hover:bg-muted"
                            aria-label="تقليل الكمية"
                            onClick={() => updateQty(line.productId, line.qty - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 text-sm font-medium num-ar min-w-[2rem] text-center">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            className="p-2 hover:bg-muted disabled:opacity-40"
                            aria-label="زيادة الكمية"
                            disabled={!line.madeToOrder && line.qty >= line.maxQty}
                            onClick={() => updateQty(line.productId, line.qty + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-destructive text-xs flex items-center gap-1 hover:underline"
                          onClick={() => removeLine(line.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold num-ar shrink-0">
                      {formatEGP(line.priceEgp * line.qty)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm">
                  المجموع الفرعي:{' '}
                  <span className="font-bold num-ar">{formatEGP(subtotal)}</span>
                </p>
                <Button onClick={() => navigate(`/checkout?storeId=${storeId}`)}>
                  إتمام الطلب من هذا المتجر
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-6 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        كل طلب يُنشأ لمتجر واحد. رسوم الشحن تُحسب حسب محافظة التوصيل عند الدفع.
      </p>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
      <Skeleton className="h-8 w-40 rounded" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
