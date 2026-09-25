import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateReview } from '@/hooks/useOrders';
import type { Review } from '@craftsouq/shared';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Props {
  orderId: string;
  existingReview?: Review | null;
  canReview: boolean;
}

export function ReviewForm({ orderId, existingReview, canReview }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(existingReview ?? null);

  const createReview = useCreateReview(orderId);

  if (submitted) {
    return (
      <section className="rounded-xl border p-4 space-y-2">
        <h3 className="font-semibold text-sm">تقييمك</h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn('h-4 w-4', i < submitted.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
            />
          ))}
        </div>
        {submitted.comment && <p className="text-sm text-muted-foreground">{submitted.comment}</p>}
      </section>
    );
  }

  if (!canReview) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const review = await createReview.mutateAsync({ rating, comment: comment || undefined });
      setSubmitted(review);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر حفظ التقييم');
    }
  }

  return (
    <section className="rounded-xl border p-4 space-y-3">
      <h3 className="font-semibold">قيّم تجربتك</h3>
      <p className="text-xs text-muted-foreground">شارك رأيك بعد استلام الطلب لمساعدة المشترين الآخرين</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} نجوم`}
            onClick={() => setRating(value)}
            className="p-1"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                value <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'
              )}
            />
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقاً (اختياري)"
          rows={3}
          maxLength={1000}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={createReview.isPending}>
          {createReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال التقييم'}
        </Button>
      </form>
    </section>
  );
}
