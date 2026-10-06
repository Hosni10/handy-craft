import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t border-border bg-sand-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-terracotta-500">
              <Store className="h-5 w-5" />
              <span>هاندي كرافت</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              سوق المنتجات اليدوية المصرية الأصيلة. نربط بين الحرفيين المبدعين والمشترين من جميع أنحاء مصر.
            </p>
          </div>

          {/* Buyer links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">للمشترين</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-primary transition-colors">تصفح المنتجات</Link></li>
              <li><Link to="/stores" className="hover:text-primary transition-colors">متاجر الحرفيين</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">طلباتي</Link></li>
              <li><Link to="/account/wallet" className="hover:text-primary transition-colors">محفظتي</Link></li>
            </ul>
          </div>

          {/* Seller links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">للحرفيين</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/seller/onboarding" className="hover:text-primary transition-colors">افتح متجرك</Link></li>
              <li><Link to="/seller/products" className="hover:text-primary transition-colors">إدارة المنتجات</Link></li>
              <li><Link to="/seller/orders" className="hover:text-primary transition-colors">الطلبات</Link></li>
              <li><Link to="/seller/earnings" className="hover:text-primary transition-colors">الأرباح</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">المساعدة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">مركز المساعدة</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">سياسة الشحن</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary transition-colors">سياسة الإرجاع</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} هاندي كرافت. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
