import { useState } from 'react';
import { Image as ImageIcon, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImagePicker } from '@/components/common/ImagePicker';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import {
  useAdminBannerMutations,
  useAdminBanners,
  useAdminCategoryMutations,
  useAdminSetBadge,
  useAdminStores,
} from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useProducts';
import { BADGE_STATUS_AR } from '@/lib/labels';
import { mediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { BadgeStatus, Category } from '@handycraft/shared';

type Tab = 'banners' | 'categories' | 'stores';

function errorMessage(e: unknown) {
  return e instanceof ApiError ? e.message : 'تعذر تنفيذ الإجراء';
}

// ─── Banners ──────────────────────────────────────────────────────────────────

function BannersTab() {
  const { data, isLoading, isError, refetch } = useAdminBanners();
  const { create, update, remove } = useAdminBannerMutations();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        title,
        image: images[0]!,
        link: link || null,
        position: (data?.length ?? 0) + 1,
        active: true,
      });
      setTitle('');
      setLink('');
      setImages([]);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold text-sm">بانر جديد</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <Input placeholder="العنوان" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="الرابط (مثال: /search?categoryId=...)" value={link} onChange={(e) => setLink(e.target.value)} dir="ltr" />
        </div>
        <ImagePicker value={images} onChange={setImages} max={1} label="الصورة" />
        <Button type="submit" size="sm" disabled={create.isPending || images.length === 0}>إضافة</Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && <ListSkeleton rows={3} className="h-20" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data?.length === 0 && <EmptyState icon={ImageIcon} title="لا توجد بانرات" description="أضف بانر ليظهر في الصفحة الرئيسية" />}

      <ul className="space-y-2">
        {data?.map((b, i) => (
          <li key={b.id} className={cn('flex items-center gap-3 border rounded-xl p-3', !b.active && 'opacity-60')}>
            <img src={mediaUrl(b.image)} alt="" className="h-14 w-28 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{b.title}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{b.link ?? '—'}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                disabled={i === 0}
                aria-label="تحريك لأعلى"
                onClick={() => {
                  const prev = data[i - 1]!;
                  act(async () => {
                    await update.mutateAsync({ id: b.id, position: prev.position });
                    await update.mutateAsync({ id: prev.id, position: b.position });
                  });
                }}
              >
                ↑
              </Button>
              <Button size="sm" variant="outline" onClick={() => act(() => update.mutateAsync({ id: b.id, active: !b.active }))}>
                {b.active ? 'إخفاء' : 'إظهار'}
              </Button>
              <Button size="icon" variant="ghost" aria-label="حذف" onClick={() => act(() => remove.mutateAsync(b.id))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function CategoryRow({ cat, onError, isChild }: { cat: Category; onError: (m: string | null) => void; isChild?: boolean }) {
  const { update, remove } = useAdminCategoryMutations();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.nameAr);

  async function run(fn: () => Promise<unknown>) {
    onError(null);
    try {
      await fn();
      setEditing(false);
    } catch (err) {
      onError(errorMessage(err));
    }
  }

  return (
    <div className={cn('flex items-center gap-2 py-1.5', isChild && 'pr-6')}>
      {editing ? (
        <>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
          <Button size="icon" variant="ghost" aria-label="حفظ" onClick={() => run(() => update.mutateAsync({ id: cat.id, nameAr: name }))}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="إلغاء" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className={cn('flex-1 text-sm', !isChild && 'font-medium')}>{cat.nameAr}</span>
          <Button size="icon" variant="ghost" aria-label="تعديل" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="حذف" onClick={() => run(() => remove.mutateAsync(cat.id))}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { data, isLoading, isError, refetch } = useCategories();
  const { create } = useAdminCategoryMutations();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('root');
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ nameAr: name, parentId: parentId === 'root' ? null : parentId });
      setName('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="rounded-xl border p-4 flex flex-col sm:flex-row gap-2">
        <Input placeholder="اسم التصنيف" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="root">تصنيف رئيسي</SelectItem>
            {data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>فرعي من: {c.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" className="gap-1 h-10" disabled={create.isPending}>
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && <ListSkeleton rows={5} className="h-10" />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      <ul className="rounded-xl border divide-y">
        {data?.map((c) => (
          <li key={c.id} className="px-4 py-2">
            <CategoryRow cat={c} onError={setError} />
            {c.children?.map((child) => (
              <CategoryRow key={child.id} cat={child} onError={setError} isChild />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Stores & badges ──────────────────────────────────────────────────────────

function StoresTab() {
  const { data, isLoading, isError, refetch } = useAdminStores();
  const setBadge = useAdminSetBadge();
  const [error, setError] = useState<string | null>(null);

  async function change(id: string, badgeStatus: BadgeStatus) {
    setError(null);
    try {
      await setBadge.mutateAsync({ id, badgeStatus });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {isLoading && <ListSkeleton rows={4} className="h-16" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data?.length === 0 && <EmptyState title="لا توجد متاجر بعد" />}
      <ul className="space-y-2">
        {data?.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 border rounded-xl p-3">
            <div className="flex-1 min-w-[180px]">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground num-ar">
                {s.ownerName} · {s.governorate ?? '—'} · {s.productsCount} منتج · ★ {s.ratingAvg.toFixed(1)}
              </p>
            </div>
            <Select value={s.badgeStatus} onValueChange={(v) => change(s.id, v as BadgeStatus)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(BADGE_STATUS_AR) as BadgeStatus[]).map((b) => (
                  <SelectItem key={b} value={b}>{BADGE_STATUS_AR[b]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'banners', label: 'البانرات' },
  { key: 'categories', label: 'التصنيفات' },
  { key: 'stores', label: 'المتاجر والشارات' },
];

export function AdminCmsPage() {
  const [tab, setTab] = useState<Tab>('banners');
  return (
    <AdminLayout title="إدارة المحتوى">
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border whitespace-nowrap',
              tab === t.key ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'banners' && <BannersTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'stores' && <StoresTab />}
    </AdminLayout>
  );
}
