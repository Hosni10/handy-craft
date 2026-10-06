import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Store as StoreIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/common/ListStates';
import { useStores } from '@/hooks/useProducts';
import { EGYPTIAN_GOVERNORATES } from '@handycraft/shared';

export function StoresListPage() {
  const [governorate, setGovernorate] = useState('all');
  const { data, isLoading, isError, refetch } = useStores(governorate === 'all' ? undefined : governorate);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">متاجر الحرفيين</h1>
          <p className="text-sm text-muted-foreground">تعرّف على الحرفيين المصريين خلف كل قطعة</p>
        </div>
        <Select value={governorate} onValueChange={setGovernorate}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المحافظات</SelectItem>
            {EGYPTIAN_GOVERNORATES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      )}
      {isError && <ErrorState message="تعذر تحميل المتاجر" onRetry={() => refetch()} />}
      {data?.length === 0 && (
        <EmptyState
          icon={StoreIcon}
          title="لا توجد متاجر في هذه المحافظة بعد"
          action={{ label: 'افتح متجرك', to: '/seller/onboarding' }}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.map((store) => (
          <Link
            key={store.id}
            to={`/stores/${store.id}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:shadow-md hover:border-terracotta-200 transition-all text-center group"
          >
            <div className="relative">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-terracotta-100" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-sand-200 flex items-center justify-center text-2xl font-bold text-sand-600">
                  {store.name.charAt(0)}
                </div>
              )}
              {store.badgeStatus === 'verified' && (
                <CheckCircle className="absolute -bottom-1 -left-1 h-5 w-5 text-olive-500 fill-white" />
              )}
            </div>
            <p className="font-medium text-sm leading-tight group-hover:text-terracotta-500 transition-colors line-clamp-2">
              {store.name}
            </p>
            {store.governorate && <p className="text-xs text-muted-foreground">{store.governorate}</p>}
            <div className="flex items-center gap-1 text-xs text-sand-600">
              <Star className="h-3 w-3 fill-sand-400 text-sand-400" />
              <span className="num-ar">{store.ratingAvg.toFixed(1)}</span>
              <span className="text-muted-foreground num-ar">({store.ratingCount})</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
