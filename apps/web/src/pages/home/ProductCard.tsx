import { Link } from 'react-router-dom';
import { Truck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatEGP } from '@craftsouq/shared';
import type { Product } from '@craftsouq/shared';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0] ?? 'https://picsum.photos/seed/placeholder/400/400';
  // priceEgp comes back as a number or Decimal-serialized string from the API
  const price = typeof product.priceEgp === 'string' ? parseFloat(product.priceEgp) : Number(product.priceEgp);

  return (
    <Link to={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.featured && (
            <Badge className="absolute top-2 right-2 text-2xs bg-terracotta-500 text-white border-0">
              مميز
            </Badge>
          )}
          {product.madeToOrder && (
            <Badge variant="outline" className="absolute bottom-2 right-2 bg-white/90 text-xs">
              حسب الطلب
            </Badge>
          )}
        </div>

        <CardContent className="p-3 space-y-1.5">
          {/* Name */}
          <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-terracotta-500 transition-colors">
            {product.name}
          </h3>

          {/* Store */}
          {product.store && (
            <p className="text-xs text-muted-foreground truncate">{product.store.name}</p>
          )}

          {/* Price */}
          <p className="font-bold text-terracotta-600 num-ar text-sm">
            {formatEGP(price)}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {product.madeToOrder && product.productionDays && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {product.productionDays} يوم
              </span>
            )}
            {!product.madeToOrder && product.stockQty > 0 && (
              <span className="flex items-center gap-0.5 text-olive-600">
                <Truck className="h-3 w-3" />
                جاهز للشحن
              </span>
            )}
            {product.stockQty === 0 && !product.madeToOrder && (
              <span className="text-destructive">نفد المخزون</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
