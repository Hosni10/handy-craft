import { useState } from 'react';
import { Paintbrush, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import {
  useCustomOrderSellerAction,
  useQuoteCustomOrder,
  useSellerCustomOrders,
} from '@/hooks/useCustomOrders';
import { CUSTOM_ORDER_STATUS_AR, formatDate } from '@/lib/labels';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatEGP } from '@handycraft/shared';
import type { CustomOrderRow, CustomOrderStatus } from '@handycraft/shared';

const TABS: { key: CustomOrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'جديد' },
  { key: 'quoted', label: 'بانتظار المشتري' },
  { key: 'accepted', label: 'قيد التنفيذ' },
  { key: 'completed', label: 'مكتمل' },
];

function QuoteForm({ row, onError }: { row: CustomOrderRow; onError: (m: string | null) => void }) {
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('');
  const [note, setNote] = useState('');
  const quote = useQuoteCustomOrder();
  const sellerAction = useCustomOrderSellerAction();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    try {
      await quote.mutateAsync({
        id: row.id,
        quotedPrice: Number(price),
        quotedDays: Number(days),
        sellerNote: note || undefined,
      });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'تعذر إرسال العرض');
    }
  }

  async function reject() {
    onError(null);
    try {
      await sellerAction.mutateAsync({ id: row.id, action: 'reject' });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'تعذر رفض الطلب');
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-2">
      <Input type="number" min={1} placeholder="السعر (جنيه)" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <Input type="number" min={1} placeholder="مدة التنفيذ (أيام)" value={days} onChange={(e) => setDays(e.target.value)} required />
      <Input className="col-span-2" placeholder="ملاحظة للمشتري (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="col-span-2 flex gap-2">
        <Button type="submit" size="sm" disabled={quote.isPending}>
          {quote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال العرض'}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={sellerAction.isPending} onClick={reject}>
          اعتذار عن الطلب
        </Button>
      </div>
    </form>
  );
}

export function SellerCustomOrdersPage() {
  const [tab, setTab] = useState<CustomOrderStatus | 'all'>('all');
  const { data, isLoading, isError, refetch } = useSellerCustomOrders(tab === 'all' ? undefined : tab);
  const sellerAction = useCustomOrderSellerAction();
  const [error, setError] = useState<string | null>(null);

  async function complete(id: string) {
    setError(null);
    try {
      await sellerAction.mutateAsync({ id, action: 'complete' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تحديث الطلب');
    }
  }

  return (
    <SellerLayout title="طلبات التخصيص">
      <div className="flex gap-1 overflow-x-auto pb-3 mb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border',
              tab === t.key ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      {isLoading && <ListSkeleton rows={3} className="h-36" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState
          icon={Paintbrush}
          title="لا توجد طلبات تخصيص هنا"
          description="تظهر طلبات المشترين على منتجاتك «حسب الطلب» في هذه الصفحة"
        />
      )}

      <ul className="space-y-3">
        {data?.map((c) => (
          <li key={c.id} className="border rounded-xl p-4 space-y-3">
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1">{c.product.name}</p>
                <p className="text-xs text-muted-foreground">{c.buyer.name} · {formatDate(c.createdAt)}</p>
              </div>
              <Badge variant="outline" className="h-fit shrink-0">{CUSTOM_ORDER_STATUS_AR[c.status]}</Badge>
            </div>
            <p className="text-sm whitespace-pre-line bg-muted/40 rounded-lg p-3">{c.details}</p>

            {c.status === 'pending' && <QuoteForm row={c} onError={setError} />}

            {c.quotedPrice != null && (
              <p className="text-sm text-muted-foreground num-ar">
                العرض: {formatEGP(c.quotedPrice)} · {c.quotedDays} يوم
                {c.depositPaid && ` · عربون مدفوع ${formatEGP(c.depositEgp ?? 0)}`}
              </p>
            )}

            {c.status === 'accepted' && (
              <Button size="sm" disabled={sellerAction.isPending} onClick={() => complete(c.id)}>
                تم التنفيذ والتسليم
              </Button>
            )}
          </li>
        ))}
      </ul>
    </SellerLayout>
  );
}
