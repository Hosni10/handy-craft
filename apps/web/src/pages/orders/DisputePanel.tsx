import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ImagePicker } from '@/components/common/ImagePicker';
import { useOpenDispute } from '@/hooks/useDisputes';
import { DISPUTE_STATUS_AR } from '@/lib/labels';
import { ApiError } from '@/lib/api';
import type { OrderDetail } from '@handycraft/shared';

export function DisputePanel({ order }: { order: OrderDetail }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const openDispute = useOpenDispute(order.id);

  if (order.dispute) {
    return (
      <section className="rounded-xl border p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-terracotta-500" />
          <span>نزاع على هذا الطلب</span>
          <Badge variant="outline">{DISPUTE_STATUS_AR[order.dispute.status]}</Badge>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/disputes/${order.dispute.id}`}>عرض النزاع</Link>
        </Button>
      </section>
    );
  }

  if (!order.canDispute) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await openDispute.mutateAsync({ reason, evidence });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر فتح النزاع');
    }
  }

  if (!open) {
    return (
      <section className="rounded-xl border p-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">هل هناك مشكلة في الطلب؟ يمكنك فتح نزاع خلال 48 ساعة من الاستلام.</p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>فتح نزاع</Button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-4 space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-terracotta-500" />
        فتح نزاع
      </h3>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="اشرح المشكلة: المنتج مكسور، لا يطابق الوصف، ناقص..."
        rows={4}
        maxLength={2000}
        required
      />
      <div>
        <p className="text-xs text-muted-foreground mb-2">صور الدليل (1–5 صور)</p>
        <ImagePicker value={evidence} onChange={setEvidence} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={openDispute.isPending || evidence.length === 0}>
          {openDispute.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال النزاع'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
      </div>
    </form>
  );
}
