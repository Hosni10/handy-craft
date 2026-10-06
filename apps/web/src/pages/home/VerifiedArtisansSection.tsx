import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Store {
  id: string;
  name: string;
  logo?: string | null;
  governorate?: string | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface VerifiedArtisansSectionProps {
  stores?: Store[];
  isLoading?: boolean;
}

export function VerifiedArtisansSection({ stores, isLoading = false }: VerifiedArtisansSectionProps) {
  const items = stores ?? [];
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="bg-sand-50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold">حرفيون موثوقون</h2>
          <Link to="/stores" className="flex items-center gap-1 text-sm text-terracotta-500 hover:underline">
            كل المتاجر
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))
            : items.slice(0, 4).map((store) => (
                <Link
                  key={store.id}
                  to={`/stores/${store.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border hover:shadow-md hover:border-terracotta-200 transition-all text-center group"
                >
                  <div className="relative">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-terracotta-100 group-hover:ring-terracotta-400 transition-all"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-sand-200 flex items-center justify-center text-2xl font-bold text-sand-600">
                        {store.name.charAt(0)}
                      </div>
                    )}
                    <CheckCircle className="absolute -bottom-1 -left-1 h-5 w-5 text-olive-500 fill-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-tight group-hover:text-terracotta-500 transition-colors">
                      {store.name}
                    </p>
                    {store.governorate && (
                      <p className="text-xs text-muted-foreground mt-0.5">{store.governorate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-sand-600">
                    <Star className="h-3 w-3 fill-sand-400 text-sand-400" />
                    <span className="num-ar">{store.ratingAvg.toFixed(1)}</span>
                    <span className="text-muted-foreground">({store.ratingCount})</span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
