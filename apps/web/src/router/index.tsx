import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/home/HomePage';
import { NotFound } from '@/pages/NotFound';
import { ComingSoon } from '@/pages/ComingSoon';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OtpPage } from '@/pages/auth/OtpPage';
import { SearchPage } from '@/pages/search/SearchPage';
import { ProductDetailPage } from '@/pages/product/ProductDetailPage';
import { StorePublicPage } from '@/pages/store/StorePublicPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { OrdersListPage } from '@/pages/orders/OrdersListPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { SellerOnboardingPage } from '@/pages/seller/SellerOnboardingPage';
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage';
import { SellerOrdersPage } from '@/pages/seller/SellerOrdersPage';
import { SellerEarningsPage } from '@/pages/seller/SellerEarningsPage';
import { RequireAuth } from '@/components/guards/RequireAuth';

const router = createBrowserRouter([
  // ── Auth pages (no navbar) ────────────────────────────────────────────────
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/otp', element: <OtpPage /> },

  // ── Main layout ───────────────────────────────────────────────────────────
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // ── Browse (public) ─────────────────────────────────────────────────
      { path: 'search', element: <SearchPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'stores', element: <ComingSoon title="قائمة المتاجر" /> },
      { path: 'stores/:id', element: <StorePublicPage /> },

      // ── Buyer (protected) ───────────────────────────────────────────────
      {
        path: 'cart',
        element: <RequireAuth><CartPage /></RequireAuth>,
      },
      {
        path: 'checkout',
        element: <RequireAuth><CheckoutPage /></RequireAuth>,
      },
      {
        path: 'orders',
        element: <RequireAuth><OrdersListPage /></RequireAuth>,
      },
      {
        path: 'orders/:id',
        element: <RequireAuth><OrderDetailPage /></RequireAuth>,
      },
      {
        path: 'account',
        element: <RequireAuth><ComingSoon title="حسابي" /></RequireAuth>,
      },
      {
        path: 'account/wallet',
        element: <RequireAuth><ComingSoon title="محفظتي" /></RequireAuth>,
      },

      // ── Seller (protected, SELLER or ADMIN) ────────────────────────────
      {
        path: 'seller/onboarding',
        element: <RequireAuth><SellerOnboardingPage /></RequireAuth>,
      },
      {
        path: 'seller/products',
        element: <RequireAuth roles={['SELLER', 'ADMIN']}><SellerProductsPage /></RequireAuth>,
      },
      {
        path: 'seller/orders',
        element: <RequireAuth roles={['SELLER', 'ADMIN']}><SellerOrdersPage /></RequireAuth>,
      },
      {
        path: 'seller/earnings',
        element: <RequireAuth roles={['SELLER', 'ADMIN']}><SellerEarningsPage /></RequireAuth>,
      },

      // ── Admin (protected, ADMIN only) ───────────────────────────────────
      {
        path: 'admin',
        element: <RequireAuth roles={['ADMIN']}><ComingSoon title="لوحة الإدارة" /></RequireAuth>,
      },
      {
        path: 'admin/*',
        element: <RequireAuth roles={['ADMIN']}><ComingSoon title="لوحة الإدارة" /></RequireAuth>,
      },

      // ── Static pages ────────────────────────────────────────────────────
      { path: 'help', element: <ComingSoon title="مركز المساعدة" /> },
      { path: 'shipping-policy', element: <ComingSoon title="سياسة الشحن" /> },
      { path: 'return-policy', element: <ComingSoon title="سياسة الإرجاع" /> },
      { path: 'contact', element: <ComingSoon title="تواصل معنا" /> },
      { path: 'privacy', element: <ComingSoon title="سياسة الخصوصية" /> },
      { path: 'terms', element: <ComingSoon title="شروط الاستخدام" /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
