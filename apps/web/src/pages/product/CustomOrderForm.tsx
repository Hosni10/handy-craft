import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomOrder } from '@/hooks/useCustomOrders';
import { ApiError } from '@/lib/api';

export function CustomOrderForm({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const create = useCreateCustomOrder();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ productId, details });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال الطلب');
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-olive-200 bg-olive-50 p-4 text-sm space-y-1">
        <p className="font-semibold text-olive-800">تم إرسال طلب التخصيص للحرفي</p>
        <p className="text-muted-foreground">
          سيصلك عرض بالسعر ومدة التنفيذ. تابع الطلب من{' '}
          <Link to="/account/custom-orders" className="underline font-medium">طلبات التخصيص</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-4 space-y-3">
      <p className="text-sm font-medium">صف التخصيص الذي تريده</p>
      <Textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="مثال: نفس التصميم بمقاس 30 سم، باللون الأزرق، مع كتابة اسم «سارة»"
        rows={4}
        maxLength={2000}
        required
      />
      <p className="text-xs text-muted-foreground">
        بعد التسعير، تدفع عربوناً لبدء التنفيذ والباقي عند الاستلام.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال الطلب'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
      </div>
    </form>
  );
}
