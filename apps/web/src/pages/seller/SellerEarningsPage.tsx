import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useSellerEarnings, useCreateWithdrawal, useSellerWithdrawals } from '@/hooks/useSeller';
import { formatEGP } from '@handycraft/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api';

export function SellerEarningsPage() {
  const { data: earnings, isLoading, isError } = useSellerEarnings();
  const { data: withdrawals } = useSellerWithdrawals();
  const createWithdrawal = useCreateWithdrawal();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'instapay' | 'vodafone_cash' | 'bank'>('instapay');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await createWithdrawal.mutateAsync({
        amount: Number(amount),
        method,
        destination,
      });
      setSuccess('تم إرسال طلب السحب — سيتم مراجعته من الإدارة');
      setAmount('');
      setDestination('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال الطلب');
    }
  }

  if (isLoading) {
    return (
      <SellerLayout title="الأرباح">
        <Skeleton className="h-32 rounded-xl mb-4" />
        <Skeleton className="h-48 rounded-xl" />
      </SellerLayout>
    );
  }

  if (isError || !earnings) {
    return (
      <SellerLayout title="الأرباح">
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-2" />
          تعذر تحميل بيانات الأرباح
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="الأرباح">
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border p-4 bg-olive-50/50">
          <p className="text-xs text-muted-foreground">الرصيد المتاح</p>
          <p className="text-2xl font-bold text-olive-800 num-ar">{formatEGP(earnings.walletBalanceEgp)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
          <p className="text-xl font-bold num-ar">{formatEGP(earnings.pendingNetEgp)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">إجمالي المُسلّم</p>
          <p className="text-xl font-bold num-ar">{formatEGP(earnings.totalEarnedEgp)}</p>
        </div>
      </div>

      <section className="rounded-xl border p-4 mb-6">
        <h2 className="font-semibold mb-3">طلب سحب</h2>
        <form onSubmit={handleWithdraw} className="grid sm:grid-cols-2 gap-3">
          <Input type="number" placeholder="المبلغ (جنيه)" value={amount} onChange={(e) => setAmount(e.target.value)} required min={50} />
          <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="instapay">InstaPay</SelectItem>
              <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
              <SelectItem value="bank">حساب بنكي</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="sm:col-span-2"
            placeholder="رقم المحفظة / IBAN / بيانات التحويل"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
          {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}
          {success && <p className="text-xs text-olive-700 sm:col-span-2">{success}</p>}
          <Button type="submit" disabled={createWithdrawal.isPending} className="sm:col-span-2 sm:w-auto">
            {createWithdrawal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال طلب السحب'}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border p-4 mb-6">
        <h2 className="font-semibold mb-3">تفصيل الطلبات المُسلّمة</h2>
        {earnings.orderBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا أرباح مُسوّاة بعد</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {earnings.orderBreakdown.map((o) => (
              <li key={o.id} className="flex justify-between border-b pb-2 last:border-0">
                <span>#{o.orderNumber}</span>
                <span className="num-ar font-medium text-olive-700">{formatEGP(o.netEgp)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold mb-3">سجل السحوبات</h2>
        {(withdrawals?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">لا طلبات سحب</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {withdrawals?.map((w) => (
              <li key={w.id} className="flex justify-between gap-2">
                <span>{w.status === 'pending' ? 'قيد المراجعة' : w.status === 'paid' ? 'مدفوع' : 'مرفوض'}</span>
                <span className="num-ar">{formatEGP(w.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {earnings.recentTransactions.length > 0 && (
        <section className="rounded-xl border p-4 mt-6">
          <h2 className="font-semibold mb-3">حركات المحفظة</h2>
          <ul className="space-y-2 text-sm">
            {earnings.recentTransactions.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span className="text-muted-foreground line-clamp-1">{t.note ?? t.refType}</span>
                <span className={t.type === 'credit' ? 'text-olive-700 num-ar' : 'text-destructive num-ar'}>
                  {t.type === 'credit' ? '+' : '-'}{formatEGP(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </SellerLayout>
  );
}
