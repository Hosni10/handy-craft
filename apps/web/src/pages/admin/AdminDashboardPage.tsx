import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorState } from '@/components/common/ListStates';
import { useAdminKpis, useAdminReports } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';
import { formatEGP } from '@handycraft/shared';

const RANGES = [7, 30, 90];

function Kpi({ label, value, to }: { label: string; value: string; to?: string }) {
  const body = (
    <>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold num-ar mt-1">{value}</p>
    </>
  );
  return to ? (
    <Link to={to} className="rounded-xl border p-4 hover:bg-muted/40 transition-colors">{body}</Link>
  ) : (
    <div className="rounded-xl border p-4">{body}</div>
  );
}

function BarList({ rows }: { rows: { label: string; value: number; sub: string }[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-4">لا توجد مبيعات في هذه الفترة</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="line-clamp-1">{r.label}</span>
            <span className="num-ar text-muted-foreground shrink-0">{formatEGP(r.value)} · {r.sub}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-terracotta-400 rounded-full" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const kpis = useAdminKpis();
  const reports = useAdminReports(days);

  return (
    <AdminLayout title="نظرة عامة">
      {kpis.isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}
      {kpis.isError && <ErrorState onRetry={() => kpis.refetch()} />}
      {kpis.data && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <Kpi label="إجمالي المبيعات اليوم (GMV)" value={formatEGP(kpis.data.gmvTodayEgp)} />
          <Kpi label="طلبات اليوم" value={kpis.data.ordersToday.toLocaleString('ar-EG')} />
          <Kpi label="متاجر نشطة" value={kpis.data.activeStores.toLocaleString('ar-EG')} />
          <Kpi label="بانتظار الموافقة" value={kpis.data.pendingApprovals.toLocaleString('ar-EG')} to="/admin/approvals" />
          <Kpi label="نزاعات مفتوحة" value={kpis.data.openDisputes.toLocaleString('ar-EG')} to="/admin/disputes" />
          <Kpi label="طلبات سحب معلقة" value={kpis.data.pendingWithdrawals.toLocaleString('ar-EG')} to="/admin/settlements" />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">التقارير</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={cn(
                'px-3 py-1 rounded-full text-xs border num-ar',
                days === r ? 'bg-terracotta-500 text-white border-terracotta-500' : 'hover:bg-muted'
              )}
            >
              آخر {r} يوم
            </button>
          ))}
        </div>
      </div>

      {reports.isLoading && (
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      )}
      {reports.isError && <ErrorState message="تعذر تحميل التقارير" onRetry={() => reports.refetch()} />}
      {reports.data && (
        <div className="grid lg:grid-cols-2 gap-4">
          <section className="rounded-xl border p-4">
            <h3 className="font-medium text-sm mb-3">المبيعات حسب التصنيف</h3>
            <BarList
              rows={reports.data.salesByCategory.map((c) => ({
                label: c.nameAr,
                value: c.totalEgp,
                sub: `${c.orders.toLocaleString('ar-EG')} طلب`,
              }))}
            />
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="font-medium text-sm mb-3">المبيعات حسب المحافظة</h3>
            <BarList
              rows={reports.data.salesByGovernorate.slice(0, 10).map((g) => ({
                label: g.governorate,
                value: g.totalEgp,
                sub: `${g.orders.toLocaleString('ar-EG')} طلب`,
              }))}
            />
          </section>

          <section className="rounded-xl border p-4">
            <h3 className="font-medium text-sm mb-3">نسبة رفض الدفع عند الاستلام</h3>
            <p className="text-4xl font-bold num-ar text-terracotta-600">
              {reports.data.cod.refusalRatePct.toLocaleString('ar-EG')}%
            </p>
            <p className="text-sm text-muted-foreground mt-2 num-ar">
              {reports.data.cod.refused.toLocaleString('ar-EG')} مرفوض من {reports.data.cod.total.toLocaleString('ar-EG')} طلب COD
              وصل لمرحلة التسليم
            </p>
          </section>

          <section className="rounded-xl border p-4 overflow-x-auto">
            <h3 className="font-medium text-sm mb-3">أفضل المتاجر</h3>
            {reports.data.topStores.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">لا توجد مبيعات في هذه الفترة</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground text-right">
                    <th className="font-normal pb-2">المتجر</th>
                    <th className="font-normal pb-2">المبيعات</th>
                    <th className="font-normal pb-2">الطلبات</th>
                    <th className="font-normal pb-2">التقييم</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.data.topStores.map((s) => (
                    <tr key={s.storeId} className="border-t">
                      <td className="py-2">
                        <Link to={`/stores/${s.storeId}`} className="hover:underline">{s.name}</Link>
                      </td>
                      <td className="py-2 num-ar">{formatEGP(s.gmvEgp)}</td>
                      <td className="py-2 num-ar">{s.orders.toLocaleString('ar-EG')}</td>
                      <td className="py-2 num-ar">{s.ratingAvg.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
