import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSendOtp } from '@/hooks/useAuth';

/** Step 1 — enter phone number to receive OTP */
export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const sendOtp = useSendOtp();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Basic Egyptian mobile validation
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      setError('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
      return;
    }

    sendOtp.mutate(phone, {
      onSuccess: () => {
        // Navigate to OTP page with phone in state
        window.location.href = `/auth/otp?phone=${encodeURIComponent(phone)}`;
      },
      onError: (err: Error) => {
        setError(err.message ?? 'حدث خطأ، يرجى المحاولة مرة أخرى');
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-terracotta-500">
            <Store className="h-7 w-7" />
            كرافت سوق
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">سوق المنتجات اليدوية المصرية</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold">تسجيل الدخول</h1>
            <p className="text-sm text-muted-foreground mt-1">
              أدخل رقم هاتفك وسنرسل لك رمز التحقق
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.trim())}
                  className="pl-10"
                  dir="ltr"
                  autoComplete="tel"
                  maxLength={11}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={sendOtp.isPending}
            >
              {sendOtp.isPending ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            بتسجيل الدخول، أنت توافق على{' '}
            <Link to="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>
            {' '}و{' '}
            <Link to="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
