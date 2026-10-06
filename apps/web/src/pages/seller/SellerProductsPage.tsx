import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Upload, X } from 'lucide-react';
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
} from '@/hooks/useSeller';
import { useFileUpload } from '@/hooks/useDisputes';
import { useCategories } from '@/hooks/useProducts';
import { formatEGP } from '@handycraft/shared';
import type { Product, ProductStatus } from '@handycraft/shared';
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
  const upload = useFileUpload();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const maxImages = 8;
  const imageCount = form.images.length + pendingFiles.length;

  const updateProduct = useUpdateSellerProduct(editId ?? '');

  function resetModal() {
    setPendingFiles([]);
    setError(null);
  }

  function startCreate() {
    setEditId(null);
    setForm(emptyForm());
    resetModal();
    setOpen(true);
  }

  function startEdit(p: Product) {
    setEditId(p.id);
    resetModal();
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
  }

  function addPendingImages(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = maxImages - imageCount;
    if (room <= 0) return;
    setPendingFiles((prev) => [...prev, ...Array.from(files).slice(0, room)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let images = [...form.images];
    if (pendingFiles.length) {
      try {
        const { urls } = await upload.mutateAsync(pendingFiles);
        if (!urls.length) {
          setError('فشل رفع الصور — حاول مرة أخرى');
          return;
        }
        images = [...images, ...urls].slice(0, maxImages);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'فشل رفع الصور');
        return;
      }
    }

    if (images.length === 0) {
      setError('أضف صورة واحدة على الأقل للمنتج');
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      name: form.name,
      description: form.description,
      materials: form.materials || undefined,
      priceEgp: Number(form.priceEgp),
      stockQty: Number(form.stockQty),
      madeToOrder: form.madeToOrder,
      productionDays: form.madeToOrder && form.productionDays ? Number(form.productionDays) : null,
      images,
    };

    try {
      if (editId) {
        await updateProduct.mutateAsync(payload);
      } else {
        await createProduct.mutateAsync(payload);
      }
      setPendingFiles([]);
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
              {p.status === 'rejected' && p.rejectionReason && (
                <p className="text-xs text-destructive mt-1 line-clamp-2">سبب الرفض: {p.rejectionReason}</p>
              )}
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
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">صور المنتج (صورة واحدة على الأقل)</p>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url) => (
                    <div key={url} className="relative">
                      <img src={mediaUrl(url)} alt="" className="h-16 w-16 rounded-lg object-cover border" />
                      <button
                        type="button"
                        aria-label="حذف الصورة"
                        onClick={() => setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }))}
                        className="absolute -top-1.5 -left-1.5 rounded-full bg-background border p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {pendingFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        aria-label="حذف الصورة"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -left-1.5 rounded-full bg-background border p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imageCount < maxImages && (
                    <label className="h-16 w-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/40 text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span className="text-[10px]">إرفاق</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          addPendingImages(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { resetModal(); setOpen(false); }}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createProduct.isPending || updateProduct.isPending || upload.isPending}
                >
                  {(createProduct.isPending || updateProduct.isPending || upload.isPending)
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : 'حفظ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
