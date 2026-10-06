import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard, ProductCardSkeleton } from '@/pages/home/ProductCard';
import { SearchFilters } from './SearchFilters';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import type { FilterState } from './SearchFilters';
import type { Category } from '@handycraft/shared';

const DEFAULT_FILTERS: FilterState = {
  categoryId: '',
  governorate: '',
  priceRange: [0, 5000],
  madeToOrder: '',
  minRating: '',
  sort: 'newest',
};

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: params.get('categoryId') ?? '',
    sort: (params.get('sort') as FilterState['sort']) ?? 'newest',
    madeToOrder: (params.get('madeToOrder') as FilterState['madeToOrder']) ?? '',
  });

  const q = params.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(q);

  // Build query params for API
  const apiFilters = {
    q: q || undefined,
    categoryId: filters.categoryId && filters.categoryId !== 'all' ? filters.categoryId : undefined,
    governorate: filters.governorate && filters.governorate !== 'all' ? filters.governorate : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
    madeToOrder: filters.madeToOrder !== '' ? filters.madeToOrder === 'true' : undefined,
    minRating: filters.minRating ? Number(filters.minRating) : undefined,
    sort: filters.sort,
    page,
    pageSize: 20,
  };

  const { data, isLoading, isError } = useProducts(apiFilters);
  const { data: categories = [] } = useCategories();

  // Sync category filter from URL on mount
  useEffect(() => {
    const catId = params.get('categoryId');
    if (catId) setFilters((f) => ({ ...f, categoryId: catId }));
  }, []);  // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (searchInput) next.set('q', searchInput);
      else next.delete('q');
      return next;
    });
  }

  function handleFiltersChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSearchInput('');
    setParams({});
  }

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن منتجات، حرف، متاجر..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl-flip" />
        </div>
        <Button type="submit">بحث</Button>
        <Button
          type="button"
          variant="outline"
          className="lg:hidden gap-1.5"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          فلتر
        </Button>
      </form>

      <div className="flex gap-6">
        {/* Desktop filters sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <SearchFilters
              filters={filters}
              categories={categories as Category[]}
              onChange={handleFiltersChange}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Mobile filters drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="relative mr-auto h-full w-72 bg-background p-5 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">الفلاتر</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SearchFilters
                filters={filters}
                categories={categories as Category[]}
                onChange={(f) => { handleFiltersChange(f); }}
                onReset={() => { handleReset(); setShowFilters(false); }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort + count bar */}
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'جاري البحث...' : `${total.toLocaleString('ar-EG')} نتيجة`}
              {q && <span className="font-medium text-foreground"> لـ «{q}»</span>}
            </p>
            <Select value={filters.sort} onValueChange={(v) => handleFiltersChange({ ...filters, sort: v as FilterState['sort'] })}>
              <SelectTrigger className="w-44 text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
                <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
                <SelectItem value="rating">الأعلى تقييمًا</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-lg font-semibold">حدث خطأ أثناء تحميل النتائج</p>
              <p className="text-muted-foreground text-sm">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
              <Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-5xl">🔍</p>
              <div>
                <p className="text-lg font-semibold">لا توجد نتائج</p>
                <p className="text-muted-foreground text-sm mt-1">
                  جرب كلمات بحث مختلفة أو غير الفلاتر المحددة
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>مسح الفلاتر</Button>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && (data?.items.length ?? 0) > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {data!.items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-muted-foreground num-ar">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
