import { EGYPTIAN_GOVERNORATES } from '@handycraft/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatEGP } from '@handycraft/shared';
import type { Category } from '@handycraft/shared';

export interface FilterState {
  categoryId: string;
  governorate: string;
  priceRange: [number, number];
  madeToOrder: '' | 'true' | 'false';
  minRating: string;
  sort: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

interface SearchFiltersProps {
  filters: FilterState;
  categories: Category[];
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

const RATINGS = [
  { label: '4★ فأكثر', value: '4' },
  { label: '3★ فأكثر', value: '3' },
];

export function SearchFilters({ filters, categories, onChange, onReset }: SearchFiltersProps) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">تصفية النتائج</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7 text-xs gap-1 text-muted-foreground">
          <X className="h-3 w-3" /> مسح الكل
        </Button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">التصنيف</label>
        <Select value={filters.categoryId} onValueChange={(v) => set('categoryId', v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Governorate */}
      <div className="space-y-2">
        <label className="text-sm font-medium">المحافظة</label>
        <Select value={filters.governorate} onValueChange={(v) => set('governorate', v)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="كل المحافظات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المحافظات</SelectItem>
            {EGYPTIAN_GOVERNORATES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <label className="text-sm font-medium">نطاق السعر</label>
        <Slider
          min={0}
          max={5000}
          value={filters.priceRange}
          onChange={(v) => set('priceRange', v)}
          step={50}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground num-ar">
          <span>{formatEGP(filters.priceRange[0])}</span>
          <span>{formatEGP(filters.priceRange[1])}</span>
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">نوع المنتج</label>
        <div className="space-y-1.5">
          {[
            { label: 'الكل', value: '' },
            { label: 'جاهز للشحن', value: 'false' },
            { label: 'حسب الطلب', value: 'true' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="madeToOrder"
                value={opt.value}
                checked={filters.madeToOrder === opt.value}
                onChange={() => set('madeToOrder', opt.value as FilterState['madeToOrder'])}
                className="accent-terracotta-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium">التقييم</label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="rating"
              value=""
              checked={filters.minRating === ''}
              onChange={() => set('minRating', '')}
              className="accent-terracotta-500"
            />
            الكل
          </label>
          {RATINGS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="rating"
                value={r.value}
                checked={filters.minRating === r.value}
                onChange={() => set('minRating', r.value)}
                className="accent-terracotta-500"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
