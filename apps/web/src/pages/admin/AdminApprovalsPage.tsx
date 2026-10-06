import { useState } from 'react';
import { BadgeCheck, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RejectWithReason } from '@/components/admin/RejectWithReason';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/common/ListStates';
import { useAdminPendingProducts, useAdminReview, useAdminVerifications } from '@/hooks/useAdmin';
import { BADGE_STATUS_AR, formatDate } from '@/lib/labels';
import { mediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatEGP } from '@handycraft/shared';

type Tab = 'verifications' | 'products';

function isVideo(url: string) {
  return /\.(mp4|mov)$/i.test(url);
}

export function AdminApprovalsPage() {
  const [tab, setTab] = useState<Tab>('verifications');
  const [error, setError] = useState<string | null>(null);
  const verifications = useAdminVerifications();
  const products = useAdminPendingProducts();
  const reviewVerification = useAdminReview('verifications');
  const reviewProduct = useAdminReview('products');

  async function review(kind: Tab, id: string, approve: boolean, reason?: string) {
    setError(null);
    try {
      await (kind === 'verifications' ? reviewVerification : reviewProduct).mutateAsync({ id, approve, reason });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تنفيذ الإجراء');
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'verifications', label: 'توثيق المتاجر', count: verifications.data?.length },
    { key: 'products', label: 'المنتجات', count: products.data?.length },
  ];

  return (
    <AdminLayout title="قوائم الموافقة">
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm border',
              tab === t.key ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
            )}
          >
            {t.label}
            {t.count ? <span className="num-ar"> ({t.count})</span> : null}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      {tab === 'verifications' && (
        <>
          {verifications.isLoading && <ListSkeleton rows={2} className="h-48" />}
          {verifications.isError && <ErrorState onRetry={() => verifications.refetch()} />}
          {verifications.data?.length === 0 && (
            <EmptyState icon={BadgeCheck} title="لا توجد طلبات توثيق معلقة" />
          )}
          <ul className="space-y-4">
            {verifications.data?.map((v) => (
              <li key={v.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-semibold">{v.store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.store.ownerName} · <span dir="ltr">{v.store.ownerPhone}</span> · {v.store.governorate ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">أُرسل {formatDate(v.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="h-fit">{BADGE_STATUS_AR[v.store.badgeStatus]}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {v.mediaUrls.map((url) =>
                    isVideo(url) ? (
                      <video key={url} src={mediaUrl(url)} controls className="h-28 rounded-lg border" />
                    ) : (
                      <a key={url} href={mediaUrl(url)} target="_blank" rel="noopener noreferrer">
                        <img src={mediaUrl(url)} alt="" className="h-28 w-28 rounded-lg object-cover border" />
                      </a>
                    )
                  )}
                </div>
                {v.note && <p className="text-sm text-muted-foreground">ملاحظة الحرفي: {v.note}</p>}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    disabled={reviewVerification.isPending}
                    onClick={() => review('verifications', v.id, true)}
                  >
                    منح شارة «موثق»
                  </Button>
                  <RejectWithReason
                    disabled={reviewVerification.isPending}
                    onReject={(reason) => review('verifications', v.id, false, reason)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'products' && (
        <>
          {products.isLoading && <ListSkeleton rows={3} className="h-32" />}
          {products.isError && <ErrorState onRetry={() => products.refetch()} />}
          {products.data?.length === 0 && <EmptyState icon={PackageCheck} title="لا توجد منتجات بانتظار المراجعة" />}
          <ul className="space-y-3">
            {products.data?.map((p) => (
              <li key={p.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex gap-1 shrink-0">
                    {p.images.slice(0, 3).map((url) => (
                      <img key={url} src={mediaUrl(url)} alt="" className="h-20 w-20 rounded-lg object-cover border" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.store.name} · {p.category.nameAr} · {p.madeToOrder ? 'حسب الطلب' : 'جاهز'}
                    </p>
                    <p className="text-terracotta-600 font-bold text-sm num-ar">{formatEGP(p.priceEgp)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{p.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" disabled={reviewProduct.isPending} onClick={() => review('products', p.id, true)}>
                    موافقة ونشر
                  </Button>
                  <RejectWithReason
                    disabled={reviewProduct.isPending}
                    onReject={(reason) => review('products', p.id, false, reason)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminLayout>
  );
}
