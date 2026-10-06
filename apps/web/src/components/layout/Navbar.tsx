import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, Store, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const cartCount = useCartStore((s) => s.totalItems());
  const logout = useLogout();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-terracotta-500 shrink-0">
          <Store className="h-6 w-6" />
          <span className="hidden sm:inline">هاندي كرافت</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
          <div className="relative w-full">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتجات، متاجر، حرف..."
              className="pl-10 rounded-full text-sm"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              aria-label="بحث"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 mr-auto sm:mr-0">
          {/* Mobile search */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="بحث"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild aria-label="عربة التسوق" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 h-4 min-w-4 px-1 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center num-ar">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Auth section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-semibold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', menuOpen && 'rotate-180')} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 z-50 w-48 rounded-xl border bg-popover shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{user.phone}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        حسابي
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        طلباتي
                      </Link>
                      {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                        <>
                          <Link
                            to="/seller/orders"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            لوحة البائع
                          </Link>
                        </>
                      )}
                      {user.role === 'BUYER' && (
                        <Link
                          to="/seller/onboarding"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Store className="h-4 w-4" />
                          بيع كحرفي
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          لوحة الإدارة
                        </Link>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); logout.mutate(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link to="/auth/login">دخول</Link>
            </Button>
          )}

          {/* Mobile login */}
          {!isAuthenticated && (
            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
              <Link to="/auth/login" aria-label="تسجيل الدخول">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
