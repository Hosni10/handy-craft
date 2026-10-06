import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { Button } from '@/components/ui/button';
import type { Product } from '@handycraft/shared';

interface ProductSectionProps {
  title: string;
  viewAllHref?: string;
  products: Product[];
  isLoading?: boolean;
}

export function ProductSection({
  title,
  viewAllHref = '/search',
  products,
  isLoading = false,
}: ProductSectionProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-sm text-terracotta-500 hover:underline"
        >
          عرض الكل
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 border rounded-xl bg-muted/30">
          <p className="text-3xl">📦</p>
          <div>
            <p className="font-medium text-muted-foreground">لا توجد منتجات بعد</p>
            <p className="text-sm text-muted-foreground/70 mt-1">تحقق مرة أخرى قريبًا</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/search">تصفح كل المنتجات</Link>
          </Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
