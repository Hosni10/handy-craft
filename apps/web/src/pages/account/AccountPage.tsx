import { Link } from 'react-router-dom';
import { Package, Paintbrush, ShieldAlert, Store, Wallet, LayoutDashboard } from 'lucide-react';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { useAuthStore } from '@/store/auth.store';
import { useWallet } from '@/hooks/useDisputes';
import { formatEGP } from '@handycraft/shared';

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const { data: wallet } = useWallet();

  const cards = [
    { to: '/orders', label: 'طلباتي', desc: 'تتبع طلباتك وقيّمها', icon: Package },
    { to: '/account/custom-orders', label: 'طلبات التخصيص', desc: 'عروض الأسعار من الحرفيين', icon: Paintbrush },
    { to: '/account/disputes', label: 'النزاعات', desc: 'مشاكل الطلبات ومتابعتها', icon: ShieldAlert },
    {
      to: '/account/wallet',
      label: 'المحفظة',
      desc: wallet ? `الرصيد: ${formatEGP(wallet.balanceEgp)}` : 'الرصيد والمعاملات',
      icon: Wallet,
    },
    user?.role === 'BUYER'
      ? { to: '/seller/onboarding', label: 'بيع كحرفي', desc: 'افتح متجرك على هاندي كرافت', icon: Store }
      : { to: '/seller/orders', label: 'لوحة الحرفي', desc: 'إدارة متجرك وطلباتك', icon: Store },
    ...(user?.role === 'ADMIN'
      ? [{ to: '/admin', label: 'لوحة الإدارة', desc: 'الموافقات والتقارير', icon: LayoutDashboard }]
      : []),
  ];

  return (
    <AccountLayout title="حسابي">
      {user && (
        <div className="rounded-xl border p-4 mb-6 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">{user.phone}</p>
            {user.governorate && <p className="text-xs text-muted-foreground">{user.governorate}</p>}
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted/40 transition-colors">
            <Icon className="h-6 w-6 text-terracotta-500 shrink-0" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground num-ar">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AccountLayout>
  );
}
