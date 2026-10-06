import { Link, useLocation } from 'react-router-dom';
import { BarChart3, CheckSquare, ShieldAlert, Banknote, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { to: '/admin', label: 'الرئيسية', icon: BarChart3, exact: true },
  { to: '/admin/approvals', label: 'الموافقات', icon: CheckSquare },
  { to: '/admin/disputes', label: 'النزاعات', icon: ShieldAlert },
  { to: '/admin/settlements', label: 'التسويات', icon: Banknote },
  { to: '/admin/cms', label: 'المحتوى', icon: LayoutTemplate },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-48 shrink-0">
          <p className="text-xs text-muted-foreground mb-2 hidden md:block">لوحة الإدارة</p>
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1">
            {LINKS.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                    active ? 'bg-terracotta-100 text-terracotta-800 font-medium' : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-5">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
