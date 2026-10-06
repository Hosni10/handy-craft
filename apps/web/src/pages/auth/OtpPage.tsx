import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Store, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSendOtp, useVerifyOtp } from '@/hooks/useAuth';

const OTP_LENGTH = 4;

/** Step 2 — enter 4-digit OTP */
export function OtpPage() {
  const [params] = useSearchParams();
  const phone = params.get('phone') ?? '';
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  // Auto-focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    // Move to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (digit && next.every(Boolean) && next.join('').length === OTP_LENGTH) {
      submitOtp(next.join(''));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  }

  function submitOtp(otp: string) {
    setError('');
    verifyOtp.mutate({ phone, otp }, {
      onError: (err: Error) => {
        setError(err.message ?? 'رمز التحقق غير صحيح');
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      },
    });
  }

  function handleResend() {
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    sendOtp.mutate(phone, {
      onError: (err: Error) => setError(err.message),
    });
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          رقم الهاتف غير محدد.{' '}
          <Link to="/auth/login" className="text-primary underline">سجل الدخول من هنا</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-terracotta-500">
            <Store className="h-7 w-7" />
            هاندي كرافت
          </Link>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold">أدخل رمز التحقق</h1>
            <p className="text-sm text-muted-foreground mt-1">
              أرسلنا رمزًا من 4 أرقام إلى{' '}
              <span className="font-medium text-foreground dir-ltr" dir="ltr">{phone}</span>
            </p>
            {import.meta.env.DEV && (
              <p className="text-xs text-olive-600 mt-1 bg-olive-50 rounded px-2 py-1">
                بيئة التطوير: الرمز دائمًا <strong>1234</strong>
              </p>
            )}
          </div>

          {/* OTP boxes — LTR inside RTL layout */}
          <div className="flex gap-3 justify-center" dir="ltr">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={cn(
                  'h-14 w-14 rounded-xl border-2 text-center text-2xl font-bold transition-colors focus:outline-none focus:border-terracotta-400',
                  d ? 'border-terracotta-300 bg-terracotta-50' : 'border-border',
                  error ? 'border-destructive bg-red-50' : ''
                )}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={() => submitOtp(digits.join(''))}
            disabled={digits.some((d) => !d) || verifyOtp.isPending}
          >
            {verifyOtp.isPending ? 'جاري التحقق...' : 'تأكيد'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={sendOtp.isPending}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {sendOtp.isPending ? 'جاري إعادة الإرسال...' : 'إعادة إرسال الرمز'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
