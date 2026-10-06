import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories?: { id: string; nameAr: string; image?: string | null }[];
  isLoading?: boolean;
}

export function CategoryGrid({ categories, isLoading = false }: CategoryGridProps) {
  const items = categories ?? [];
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-xl font-bold mb-6">تصفح حسب الحرفة</h2>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
          {items.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?categoryId=${cat.id}`}
              className="flex flex-col items-center gap-2 group text-center"
            >
              <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-terracotta-400 transition-all duration-200 shadow-md bg-muted">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.nameAr}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl">🎨</div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-terracotta-500 transition-colors leading-tight">
                {cat.nameAr}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
