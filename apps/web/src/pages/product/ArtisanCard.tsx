import { Link } from 'react-router-dom';
import { Star, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArtisanCardProps {
  store: {
    id: string;
    name: string;
    logo?: string | null;
    governorate?: string | null;
    badgeStatus: string;
    ratingAvg: number;
    ratingCount: number;
    bio?: string | null;
  };
}

export function ArtisanCard({ store }: ArtisanCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-14 w-14 shrink-0">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              className="h-full w-full rounded-full object-cover ring-2 ring-terracotta-100"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-sand-200 flex items-center justify-center text-xl font-bold text-sand-600">
              {store.name.charAt(0)}
            </div>
          )}
          {store.badgeStatus === 'verified' && (
            <CheckCircle className="absolute -bottom-0.5 -left-0.5 h-5 w-5 text-olive-500 fill-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{store.name}</h3>
            {store.badgeStatus === 'verified' && (
              <Badge variant="verified" className="text-2xs">موثق</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            {store.governorate && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {store.governorate}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-sand-400 text-sand-400" />
              <span className="num-ar">{store.ratingAvg.toFixed(1)}</span>
              <span>({store.ratingCount.toLocaleString('ar-EG')})</span>
            </span>
          </div>
        </div>
      </div>

      {store.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{store.bio}</p>
      )}

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to={`/stores/${store.id}`}>زيارة المتجر</Link>
      </Button>
    </div>
  );
}
