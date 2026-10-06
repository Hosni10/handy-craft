import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCartStore, cartSubtotal } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useCreateOrder, useShippingQuote } from '@/hooks/useOrders';
import { EGYPTIAN_GOVERNORATES, formatEGP } from '@handycraft/shared';
import { ApiError } from '@/lib/api';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('storeId') ?? '';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const lines = useCartStore((s) => s.lines.filter((l) => l.storeId === storeId));
  const clearStore = useCartStore((s) => s.clearStore);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [governorate, setGovernorate] = useState(user?.governorate ?? 'القاهرة');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'electronic'>('cod');
  const [error, setError] = useState<string | null>(null);

  const { data: shippingQuote, isLoading: shippingLoading } = useShippingQuote(governorate);
  const createOrder = useCreateOrder();

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const shippingFee = shippingQuote?.shippingFeeEgp ?? 0;
  const total = subtotal + shippingFee;

  if (!storeId || lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-lg font-semibold">لا توجد منتجات للدفع</p>
        <p className="text-muted-foreground text-sm">أضف منتجات من متجر واحد ثم عد لإتمام الطلب</p>
        <Button asChild variant="outline"><Link to="/cart">العودة للسلة</Link></Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await createOrder.mutateAsync({
        storeId,
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        paymentMethod,
        address: { name, phone, governorate, street, apartment: apartment || undefined },
        notes: notes || undefined,
      });

      clearStore(storeId);
      const params = new URLSearchParams({ placed: '1' });
      if (result.codOtpDevCode) params.set('devOtp', result.codOtpDevCode);
      if (result.paymentIntent?.iframeUrl) params.set('payUrl', result.paymentIntent.iframeUrl);
      navigate(`/orders/${result.order.id}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء الطلب');
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Link to="/cart" className="hover:text-foreground">السلة</Link>
        <ChevronRight className="h-3 w-3 rtl-flip" />
        <span className="text-foreground">إتمام الطلب</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border p-4 space-y-4">
          <h2 className="font-semibold">عنوان التوصيل</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">الاسم الكامل</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">رقم الهاتف</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" className="text-left" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المحافظة</label>
              <Select value={governorate} onValueChange={setGovernorate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EGYPTIAN_GOVERNORATES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">الشارع والعنوان</label>
              <Input value={street} onChange={(e) => setStreet(e.target.value)} required minLength={5} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">شقة / دور (اختياري)</label>
              <Input value={apartment} onChange={(e) => setApartment(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">طريقة الدفع</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center gap-3 rounded-lg border p-3 text-right transition-colors ${
                paymentMethod === 'cod' ? 'border-terracotta-500 bg-terracotta-50' : 'hover:bg-muted/50'
              }`}
            >
              <Banknote className="h-5 w-5 text-olive-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">الدفع عند الاستلام</p>
                <p className="text-xs text-muted-foreground">الطريقة الأكثر استخداماً في مصر</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('electronic')}
              className={`flex items-center gap-3 rounded-lg border p-3 text-right transition-colors ${
                paymentMethod === 'electronic' ? 'border-terracotta-500 bg-terracotta-50' : 'hover:bg-muted/50'
              }`}
            >
              <CreditCard className="h-5 w-5 text-terracotta-600 shrink-0" />
              <div>
                <p className="font-medium text-sm">دفع إلكتروني</p>
                <p className="text-xs text-muted-foreground">بطاقة / فوري / محفظة (تجريبي)</p>
              </div>
            </button>
          </div>
          {paymentMethod === 'cod' && (
            <p className="text-xs text-muted-foreground">
              بعد تأكيد الطلب ستصلك رسالة واتساب/SMS برمز من 4 أرقام لتأكيد استلامك للطلب (محاكاة).
            </p>
          )}
        </section>

        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold mb-2">ملخص الطلب</h2>
          <ul className="text-sm space-y-1">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1">{l.name} × {l.qty}</span>
                <span className="num-ar shrink-0">{formatEGP(l.priceEgp * l.qty)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span>المجموع الفرعي</span>
            <span className="num-ar">{formatEGP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>الشحن</span>
            <span className="num-ar">
              {shippingLoading ? '...' : formatEGP(shippingFee)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>الإجمالي</span>
            <span className="text-terracotta-600 num-ar">{formatEGP(total)}</span>
          </div>
        </section>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">ملاحظات للحرفي (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full h-12" disabled={createOrder.isPending || shippingLoading}>
          {createOrder.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري إنشاء الطلب...
            </>
          ) : (
            'تأكيد الطلب'
          )}
        </Button>
      </form>
    </div>
  );
}
