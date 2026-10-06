import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ImagePicker } from '@/components/common/ImagePicker';
import { useSendDisputeMessage } from '@/hooks/useDisputes';
import { useAuthStore } from '@/store/auth.store';
import { DISPUTE_STATUS_AR, formatDateTime } from '@/lib/labels';
import { mediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatEGP } from '@handycraft/shared';
import type { DisputeDetail, UserRole } from '@handycraft/shared';

const ROLE_AR: Record<UserRole, string> = { BUYER: 'المشتري', SELLER: 'الحرفي', ADMIN: 'الإدارة' };

function Images({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url) => (
        <a key={url} href={mediaUrl(url)} target="_blank" rel="noopener noreferrer">
          <img src={mediaUrl(url)} alt="" className="h-20 w-20 rounded-lg object-cover border" />
        </a>
      ))}
    </div>
  );
}

export function DisputeThread({ dispute, orderLink }: { dispute: DisputeDetail; orderLink?: string }) {
  const userId = useAuthStore((s) => s.user?.id);
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const send = useSendDisputeMessage(dispute.id);
  const closed = dispute.status === 'resolved_buyer' || dispute.status === 'resolved_seller';

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await send.mutateAsync({ body, images });
      setBody('');
      setImages([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إرسال الرسالة');
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">
              نزاع على طلب{' '}
              {orderLink ? (
                <Link to={orderLink} className="underline">#{dispute.orderNumber}</Link>
              ) : (
                <>#{dispute.orderNumber}</>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {dispute.buyerName} ← {dispute.storeName} · {formatDateTime(dispute.createdAt)}
            </p>
          </div>
          <Badge variant="outline">{DISPUTE_STATUS_AR[dispute.status]}</Badge>
        </div>
        <p className="text-sm whitespace-pre-line">{dispute.reason}</p>
        <Images urls={dispute.evidence} />
        <p className="text-xs text-muted-foreground num-ar">قيمة الطلب: {formatEGP(dispute.orderTotalEgp)}</p>
        {dispute.resolutionNote && (
          <div className="rounded-lg bg-muted p-3 text-sm mt-2">
            <p className="font-medium mb-1">قرار الإدارة</p>
            <p className="text-muted-foreground">{dispute.resolutionNote}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold text-sm">المحادثة</h3>
        {dispute.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد رسائل بعد</p>
        ) : (
          <ul className="space-y-3">
            {dispute.messages.map((m) => {
              const mine = m.author.id === userId;
              return (
                <li key={m.id} className={cn('flex', mine ? 'justify-start' : 'justify-end')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                      mine ? 'bg-terracotta-50 border border-terracotta-100' : 'bg-muted',
                      m.author.role === 'ADMIN' && 'bg-olive-50 border border-olive-200'
                    )}
                  >
                    <p className="text-xs font-medium mb-1">
                      {m.author.name} · {ROLE_AR[m.author.role]}
                    </p>
                    <p className="whitespace-pre-line">{m.body}</p>
                    <Images urls={m.images} />
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(m.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!closed && (
          <form onSubmit={handleSend} className="space-y-2 pt-2 border-t">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب رسالتك..."
              rows={2}
              maxLength={2000}
              required
            />
            <div className="flex items-end justify-between gap-2">
              <ImagePicker value={images} onChange={setImages} label="صورة" />
              <Button type="submit" size="sm" className="gap-1" disabled={send.isPending}>
                {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl-flip" />}
                إرسال
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        )}
      </section>
    </div>
  );
}
