import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DisputesList } from '@/pages/disputes/DisputesList';
import { useAdminDisputes } from '@/hooks/useAdmin';
import { DISPUTE_STATUS_AR } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { DisputeStatus } from '@handycraft/shared';

const FILTERS: (DisputeStatus | 'all')[] = ['all', 'open', 'under_review', 'resolved_buyer', 'resolved_seller'];

export function AdminDisputesPage() {
  const [status, setStatus] = useState<DisputeStatus | 'all'>('open');
  const { data, isLoading, isError, refetch } = useAdminDisputes(status === 'all' ? undefined : status);

  return (
    <AdminLayout title="صندوق النزاعات">
      <div className="flex gap-1 overflow-x-auto pb-3 mb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border',
              status === f ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
            )}
          >
            {f === 'all' ? 'الكل' : DISPUTE_STATUS_AR[f]}
          </button>
        ))}
      </div>
      <DisputesList
        disputes={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        linkTo={(id) => `/admin/disputes/${id}`}
      />
    </AdminLayout>
  );
}
