import { Link, useLocation } from 'react-router-dom';
import { Package, Paintbrush, ShieldAlert, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/orders', label: 'طلباتي', icon: Package },
  { to: '/account/custom-orders', label: 'طلبات التخصيص', icon: Paintbrush },
  { to: '/account/disputes', label: 'النزاعات', icon: ShieldAlert },
  { to: '/account/wallet', label: 'المحفظة', icon: Wallet },
];

export function AccountLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex flex-col gap-3 mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                location.pathname.startsWith(to) ? 'bg-terracotta-100 text-terracotta-800 font-medium' : 'hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
