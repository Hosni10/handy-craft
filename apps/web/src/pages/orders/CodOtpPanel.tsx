import { useState } from 'react';
import { MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmCodOtp, useResendCodOtp } from '@/hooks/useOrders';
import type { CodOtpInfo } from '@handycraft/shared';
import { ApiError } from '@/lib/api';

interface Props {
  orderId: string;
  codOtp: CodOtpInfo | null | undefined;
  paymentMethod: string;
}

export function CodOtpPanel({ orderId, codOtp, paymentMethod }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);

  const resend = useResendCodOtp(orderId);
  const confirm = useConfirmCodOtp(orderId);

  if (paymentMethod !== 'cod') return null;

  const confirmed = codOtp?.confirmed ?? false;

  async function handleResend() {
    setError(null);
    try {
      const result = await resend.mutateAsync();
      if (result.devCode) setDevHint(result.devCode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال الرمز');
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await confirm.mutateAsync({ code });
      setCode('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'رمز غير صحيح');
    }
  }

  return (
    <section className="rounded-xl border border-olive-200 bg-olive-50/50 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <MessageCircle className="h-5 w-5 text-olive-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">تأكيد الدفع عند الاستلام</h3>
          <p className="text-xs text-muted-foreground mt-1">
            أدخل الرمز المرسل عبر واتساب/SMS (محاكاة) لتأكيد أنك ستلتزم باستلام الطلب.
          </p>
        </div>
      </div>

      {confirmed ? (
        <div className="flex items-center gap-2 text-olive-700 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          تم تأكيد الطلب بنجاح
        </div>
      ) : (
        <>
          <form onSubmit={handleConfirm} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              inputMode="numeric"
              className="text-center tracking-[0.4em] font-mono max-w-[140px]"
              dir="ltr"
              required
              maxLength={4}
            />
            <Button type="submit" disabled={confirm.isPending || code.length !== 4}>
              {confirm.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تأكيد الرمز'}
            </Button>
          </form>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleResend}
            disabled={resend.isPending}
          >
            {resend.isPending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
          </Button>
          {devHint && (
            <p className="text-xs text-muted-foreground">
              رمز التطوير: <span className="font-mono font-bold" dir="ltr">{devHint}</span>
            </p>
          )}
        </>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </section>
  );
}
