import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SellerLayout } from '@/components/seller/SellerLayout';
import {
  useSellerDashboard,
  useBecomeSeller,
  useCreateStore,
  useSubmitVerification,
  useSellerUpload,
} from '@/hooks/useSeller';
import { useAuthStore } from '@/store/auth.store';
import { EGYPTIAN_GOVERNORATES } from '@craftsouq/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api';
import { mediaUrl } from '@/lib/media';

export function SellerOnboardingPage() {
  const navigate = useNavigate();
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data, isLoading, isError, refetch } = useSellerDashboard();
  const become = useBecomeSeller();
  const createStore = useCreateStore();
  const submitVerification = useSubmitVerification();
  const upload = useSellerUpload();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [zones, setZones] = useState<string[]>(['القاهرة']);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const store = data?.store;
  const badge = store?.badgeStatus;

  const done = useMemo(() => {
    if (!store) return false;
    if (badge === 'verified') return true;
    return store.latestVerification?.status === 'pending' || badge === 'pending';
  }, [store, badge]);

  if (isLoading) {
    return (
      <SellerLayout title="تسجيل كحرفي">
        <Skeleton className="h-40 w-full rounded-xl" />
      </SellerLayout>
    );
  }

  if (isError) {
    return (
      <SellerLayout title="تسجيل كحرفي">
        <div className="text-center py-12 space-y-3">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
          <p>تعذر تحميل البيانات</p>
          <Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button>
        </div>
      </SellerLayout>
    );
  }

  if (store && (badge === 'verified' || done)) {
    return (
      <SellerLayout title="متجرك">
        <div className="rounded-xl border p-6 space-y-4 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-olive-600" />
          <h2 className="text-lg font-bold">{store.name}</h2>
          {badge === 'verified' ? (
            <Badge variant="verified">موثق</Badge>
          ) : (
            <p className="text-sm text-muted-foreground">طلب التوثيق قيد المراجعة من الإدارة</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button asChild><Link to="/seller/products">إدارة المنتجات</Link></Button>
            <Button variant="outline" asChild><Link to={`/stores/${store.id}`}>عرض المتجر</Link></Button>
          </div>
        </div>
      </SellerLayout>
    );
  }

  async function handleBecome() {
    setError(null);
    try {
      const user = await become.mutateAsync();
      updateUser({ role: user.role as 'SELLER' });
      setStep(2);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'حدث خطأ');
    }
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createStore.mutateAsync({
        name,
        bio: bio || undefined,
        governorate,
        shippingZones: zones.length ? zones : [governorate],
      });
      await refetch();
      setStep(3);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'حدث خطأ');
    }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    try {
      const result = await upload.mutateAsync(Array.from(fileList));
      setMediaUrls((prev) => [...prev, ...result.urls].slice(0, 5));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'فشل رفع الصور');
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mediaUrls.length < 3) {
      setError('ارفع 3–5 صور من الورشة');
      return;
    }
    try {
      await submitVerification.mutateAsync({ mediaUrls, note: note || undefined });
      await refetch();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'حدث خطأ');
    }
  }

  const currentStep = store ? 3 : data?.user.role === 'SELLER' || data?.user.role === 'ADMIN' ? 2 : step;

  return (
    <SellerLayout title="تسجيل كحرفي">
      <ol className="flex gap-2 text-xs mb-6">
        {['نوع الحساب', 'بيانات المتجر', 'توثيق الورشة'].map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-lg border px-2 py-2 text-center ${
              currentStep === i + 1 ? 'border-terracotta-400 bg-terracotta-50' : 'text-muted-foreground'
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {currentStep === 1 && (
        <section className="rounded-xl border p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            انضم كحرفي مصري واعرض منتجاتك اليدوية. بعد التسجيل يمكنك إضافة المنتجات — تُراجع من الإدارة قبل النشر.
          </p>
          <Button onClick={handleBecome} disabled={become.isPending} className="w-full sm:w-auto">
            {become.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ابدأ كبائع حرفي'}
          </Button>
        </section>
      )}

      {currentStep === 2 && !store && (
        <form onSubmit={handleCreateStore} className="rounded-xl border p-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">اسم المتجر / الورشة</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">نبذة (اختياري)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">المحافظة</label>
            <Select value={governorate} onValueChange={(g) => { setGovernorate(g); setZones([g]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EGYPTIAN_GOVERNORATES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={createStore.isPending}>
            {createStore.isPending ? 'جاري الحفظ...' : 'إنشاء المتجر'}
          </Button>
        </form>
      )}

      {currentStep === 3 && store && (
        <form onSubmit={handleVerification} className="rounded-xl border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            ارفع 3–5 صور (أو فيديو) من الورشة لمراجعتها والحصول على شارة «موثق».
          </p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:bg-muted/40">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm">اختر ملفات</span>
            <input
              type="file"
              accept="image/*,video/mp4"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {upload.isPending && <p className="text-xs text-muted-foreground">جاري الرفع...</p>}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {mediaUrls.map((url) => (
                <img key={url} src={mediaUrl(url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
          <Input
            placeholder="ملاحظة للمراجع (اختياري)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="submit" disabled={submitVerification.isPending}>
            إرسال للمراجعة
          </Button>
        </form>
      )}

      {store && badge !== 'verified' && (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          يمكنك إضافة منتجات أثناء انتظار التوثيق — ستظهر بعد موافقة الإدارة.
          {' '}
          <button type="button" className="underline" onClick={() => navigate('/seller/products')}>
            الانتقال للمنتجات
          </button>
        </p>
      )}
    </SellerLayout>
  );
}
