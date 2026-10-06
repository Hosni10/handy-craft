import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Paintbrush, Clock, Package, Truck, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ImageGallery } from './ImageGallery';
import { ArtisanCard } from './ArtisanCard';
import { CustomOrderForm } from './CustomOrderForm';
import { useProduct } from '@/hooks/useProducts';
import { formatEGP } from '@handycraft/shared';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-4 w-48 mb-6 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-8 w-1/3 rounded" />
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [addedMsg, setAddedMsg] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const addLine = useCartStore((s) => s.addLine);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: product, isLoading, isError } = useProduct(id ?? '');

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-semibold">المنتج غير موجود</p>
          <p className="text-muted-foreground text-sm mt-1">ربما تم حذف المنتج أو تغيير رابطه</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/search">تصفح المنتجات</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = !product.madeToOrder && product.stockQty === 0;

  function handleAddToCart() {
    const p = product;
    if (!p?.store) return;
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/products/${p.id}` } });
      return;
    }
    addLine({
      productId: p.id,
      storeId: p.storeId,
      storeName: p.store.name,
      name: p.name,
      image: p.images[0] ?? '',
      priceEgp: Number(p.priceEgp),
      madeToOrder: p.madeToOrder,
      maxQty: p.madeToOrder ? 99 : p.stockQty,
      qty: 1,
    });
    setAddedMsg(true);
    window.setTimeout(() => setAddedMsg(false), 2500);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <Link to="/search" className="hover:text-foreground transition-colors">المنتجات</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3 rtl-flip" />
            <Link
              to={`/search?categoryId=${product.category.id}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.nameAr}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <ImageGallery images={product.images} videoUrl={product.videoUrl} name={product.name} />

        {/* Details */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.featured && (
              <Badge className="bg-terracotta-500 text-white border-0 text-xs">مميز</Badge>
            )}
            {product.madeToOrder ? (
              <Badge variant="outline" className="text-xs">حسب الطلب</Badge>
            ) : (
              <Badge variant="outline" className="text-olive-700 border-olive-300 text-xs">جاهز للشحن</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">نفد المخزون</Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-terracotta-600 num-ar">
              {formatEGP(Number(product.priceEgp))}
            </span>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-3 text-sm">
            {product.madeToOrder && product.productionDays && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-terracotta-400" />
                <span>مدة التصنيع: <strong className="text-foreground num-ar">{product.productionDays} يوم</strong></span>
              </div>
            )}
            {!product.madeToOrder && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-4 w-4 text-olive-500" />
                <span>المخزون: <strong className="text-foreground num-ar">{product.stockQty}</strong> قطعة</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-4 w-4 text-sand-500" />
              <span>توصيل لجميع المحافظات</span>
            </div>
          </div>

          {/* Materials */}
          {product.materials && (
            <div>
              <p className="text-sm font-medium mb-1">الخامات</p>
              <p className="text-sm text-muted-foreground">{product.materials}</p>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm font-medium mb-2">وصف المنتج</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full gap-2 h-12 text-base"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? 'نفد المخزون' : 'أضف إلى السلة'}
            </Button>
            {addedMsg && (
              <p className="text-sm text-olive-700 text-center">
                تمت الإضافة للسلة —{' '}
                <Link to="/cart" className="underline font-medium">عرض السلة</Link>
              </p>
            )}

            {product.madeToOrder && !customOpen && (
              <Button
                variant="outline"
                className="w-full gap-2 h-12 text-base"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth/login', { state: { from: `/products/${product.id}` } });
                    return;
                  }
                  setCustomOpen(true);
                }}
              >
                <Paintbrush className="h-5 w-5" />
                طلب تخصيص
              </Button>
            )}
            {customOpen && (
              <CustomOrderForm productId={product.id} onClose={() => setCustomOpen(false)} />
            )}
          </div>

          {/* Return policy note */}
          <p className="text-xs text-muted-foreground">
            يمكنك فتح نزاع خلال 48 ساعة من الاستلام إذا كان المنتج لا يطابق الوصف.
          </p>

          {/* Artisan card */}
          {product.store && (
            <ArtisanCard store={product.store} />
          )}
        </div>
      </div>
    </div>
  );
}
