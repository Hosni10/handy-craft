import { Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Wallet, Store, Paintbrush, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/seller/onboarding', label: 'متجري', icon: Store },
  { to: '/seller/products', label: 'المنتجات', icon: ShoppingBag },
  { to: '/seller/orders', label: 'الطلبات', icon: Package },
  { to: '/seller/custom-orders', label: 'التخصيص', icon: Paintbrush },
  { to: '/seller/disputes', label: 'النزاعات', icon: ShieldAlert },
  { to: '/seller/earnings', label: 'الأرباح', icon: Wallet },
];

export function SellerLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">لوحة الحرفي</p>
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  active ? 'bg-terracotta-100 text-terracotta-800 font-medium' : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
