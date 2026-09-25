import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard, ProductCardSkeleton } from '@/pages/home/ProductCard';
import { useStore, useStoreProducts } from '@/hooks/useProducts';
import { useStoreReviews } from '@/hooks/useOrders';
import type { Product, Review } from '@craftsouq/shared';

interface StoreShape {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  governorate?: string | null;
  badgeStatus: string;
  ratingAvg: number;
  ratingCount: number;
}

export function StorePublicPage() {
  const { id } = useParams<{ id: string }>();
  const { data: store, isLoading: storeLoading, isError: storeError } = useStore(id ?? '');
  const { data: productsData, isLoading: productsLoading } = useStoreProducts(id ?? '');
  const { data: reviews } = useStoreReviews(id ?? '');

  const s = store as StoreShape | undefined;

  if (storeLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (storeError || !s) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">المتجر غير موجود</p>
        <Button variant="outline" asChild><Link to="/stores">كل المتاجر</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store header */}
      <div className="flex items-start gap-5 mb-8 pb-8 border-b">
        {s.logo ? (
          <img src={s.logo} alt={s.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-terracotta-100 shrink-0" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-sand-200 flex items-center justify-center text-3xl font-bold text-sand-600 shrink-0">
            {s.name.charAt(0)}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{s.name}</h1>
            {s.badgeStatus === 'verified' && (
              <>
                <CheckCircle className="h-5 w-5 text-olive-500" />
                <Badge variant="verified">موثق</Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {s.governorate && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {s.governorate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-sand-400 text-sand-400" />
              <span className="num-ar">{s.ratingAvg.toFixed(1)}</span>
              <span>({s.ratingCount.toLocaleString('ar-EG')} تقييم)</span>
            </span>
          </div>
          {s.bio && <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{s.bio}</p>}
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-bold mb-4">منتجات {s.name}</h2>

      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (productsData?.items.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">لا توجد منتجات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {productsData?.items.map((p) => <ProductCard key={p.id} product={p as unknown as Product} />)}
        </div>
      )}

      {(reviews?.length ?? 0) > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-lg font-bold mb-4">آراء العملاء</h2>
          <ul className="space-y-4">
            {(reviews as Review[]).map((r) => (
              <li key={r.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? 'fill-sand-400 text-sand-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{r.buyer?.name ?? 'مشتري'}</span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
