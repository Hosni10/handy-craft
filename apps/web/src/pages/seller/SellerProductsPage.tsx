import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerLayout } from '@/components/seller/SellerLayout';
import {
  useSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
  useSellerUpload,
} from '@/hooks/useSeller';
import { useCategories } from '@/hooks/useProducts';
import { formatEGP } from '@craftsouq/shared';
import type { Product, ProductStatus } from '@craftsouq/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

const STATUS_AR: Record<ProductStatus, string> = {
  draft: 'مسودة',
  pending: 'قيد المراجعة',
  active: 'منشور',
  rejected: 'مرفوض',
};

type FormState = {
  categoryId: string;
  name: string;
  description: string;
  materials: string;
  priceEgp: string;
  stockQty: string;
  madeToOrder: boolean;
  productionDays: string;
  images: string[];
};

const emptyForm = (): FormState => ({
  categoryId: '',
  name: '',
  description: '',
  materials: '',
  priceEgp: '',
  stockQty: '1',
  madeToOrder: false,
  productionDays: '',
  images: [],
});

export function SellerProductsPage() {
  const { data, isLoading, isError } = useSellerProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateSellerProduct();
  const deleteProduct = useDeleteSellerProduct();
  const upload = useSellerUpload();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = useUpdateSellerProduct(editId ?? '');

  function startCreate() {
    setEditId(null);
    setForm(emptyForm());
    setOpen(true);
    setError(null);
  }

  function startEdit(p: Product) {
    setEditId(p.id);
    setForm({
      categoryId: p.categoryId,
      name: p.name,
      description: p.description,
      materials: p.materials ?? '',
      priceEgp: String(p.priceEgp),
      stockQty: String(p.stockQty),
      madeToOrder: p.madeToOrder,
      productionDays: p.productionDays ? String(p.productionDays) : '',
      images: p.images ?? [],
    });
    setOpen(true);
    setError(null);
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const result = await upload.mutateAsync(Array.from(files));
    setForm((f) => ({ ...f, images: [...f.images, ...result.urls].slice(0, 8) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      categoryId: form.categoryId,
      name: form.name,
      description: form.description,
      materials: form.materials || undefined,
      priceEgp: Number(form.priceEgp),
      stockQty: Number(form.stockQty),
      madeToOrder: form.madeToOrder,
      productionDays: form.madeToOrder && form.productionDays ? Number(form.productionDays) : null,
      images: form.images,
    };

    try {
      if (editId) {
        await updateProduct.mutateAsync(payload);
      } else {
        await createProduct.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر حفظ المنتج');
    }
  }

  const flatCategories = categories?.flatMap((c) => [c, ...(c.children ?? [])]) ?? [];

  return (
    <SellerLayout title="منتجاتي">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">المنتجات الجديدة تنتظر موافقة الإدارة قبل الظهور للمشترين.</p>
        <Button size="sm" className="gap-1 shrink-0" onClick={startCreate}>
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          تعذر تحميل المنتجات — تأكد من إكمال إنشاء المتجر
        </div>
      )}

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <div className="text-center py-16 border rounded-xl">
          <p className="font-medium mb-2">لا منتجات بعد</p>
          <Button onClick={startCreate}>أضف أول منتج</Button>
        </div>
      )}

      <ul className="space-y-2">
        {data?.items.map((p) => (
          <li key={p.id} className="flex gap-3 border rounded-xl p-3 items-center">
            <img
              src={mediaUrl(p.images[0] ?? '')}
              alt=""
              className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">{p.name}</p>
              <p className="text-terracotta-600 font-bold text-sm num-ar">{formatEGP(Number(p.priceEgp))}</p>
              <Badge variant="outline" className="text-[10px] mt-1">{STATUS_AR[p.status]}</Badge>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => startEdit(p as Product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => deleteProduct.mutate(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl">
            <h2 className="font-bold text-lg">{editId ? 'تعديل منتج' : 'منتج جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
                <SelectContent>
                  {flatCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <textarea
                placeholder="الوصف"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                minLength={10}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="السعر" value={form.priceEgp} onChange={(e) => setForm((f) => ({ ...f, priceEgp: e.target.value }))} required />
                <Input type="number" placeholder="المخزون" value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.madeToOrder} onChange={(e) => setForm((f) => ({ ...f, madeToOrder: e.target.checked }))} />
                حسب الطلب
              </label>
              {form.madeToOrder && (
                <Input type="number" placeholder="أيام التصنيع" value={form.productionDays} onChange={(e) => setForm((f) => ({ ...f, productionDays: e.target.value }))} />
              )}
              <label className="block text-xs text-muted-foreground">
                صور المنتج
                <input type="file" accept="image/*" multiple className="block mt-1 text-sm" onChange={(e) => handleUpload(e.target.files)} />
              </label>
              {form.images.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {form.images.map((url) => (
                    <img key={url} src={mediaUrl(url)} alt="" className="h-14 w-14 rounded object-cover" />
                  ))}
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>إلغاء</Button>
                <Button type="submit" className="flex-1" disabled={createProduct.isPending || updateProduct.isPending || form.images.length === 0}>
                  {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
