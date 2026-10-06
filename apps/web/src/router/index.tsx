import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/home/HomePage';
import { NotFound } from '@/pages/NotFound';
import { StaticPage } from '@/pages/StaticPage';
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
import { SellerCustomOrdersPage } from '@/pages/seller/SellerCustomOrdersPage';
import { SellerDisputesPage } from '@/pages/seller/SellerDisputesPage';
import { StoresListPage } from '@/pages/store/StoresListPage';
import { AccountPage } from '@/pages/account/AccountPage';
import { WalletPage } from '@/pages/account/WalletPage';
import { CustomOrdersPage } from '@/pages/account/CustomOrdersPage';
import { AccountDisputesPage } from '@/pages/account/AccountDisputesPage';
import { DisputeDetailPage } from '@/pages/disputes/DisputeDetailPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminApprovalsPage } from '@/pages/admin/AdminApprovalsPage';
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage';
import { AdminDisputeDetailPage } from '@/pages/admin/AdminDisputeDetailPage';
import { AdminSettlementsPage } from '@/pages/admin/AdminSettlementsPage';
import { AdminCmsPage } from '@/pages/admin/AdminCmsPage';
import { RequireAuth } from '@/components/guards/RequireAuth';

const admin = (page: React.ReactNode) => <RequireAuth roles={['ADMIN']}>{page}</RequireAuth>;

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
      { path: 'stores', element: <StoresListPage /> },
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
        element: <RequireAuth><AccountPage /></RequireAuth>,
      },
      {
        path: 'account/wallet',
        element: <RequireAuth><WalletPage /></RequireAuth>,
      },
      {
        path: 'account/custom-orders',
        element: <RequireAuth><CustomOrdersPage /></RequireAuth>,
      },
      {
        path: 'account/disputes',
        element: <RequireAuth><AccountDisputesPage /></RequireAuth>,
      },
      {
        path: 'disputes/:id',
        element: <RequireAuth><DisputeDetailPage /></RequireAuth>,
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
      {
        path: 'seller/custom-orders',
        element: <RequireAuth roles={['SELLER', 'ADMIN']}><SellerCustomOrdersPage /></RequireAuth>,
      },
      {
        path: 'seller/disputes',
        element: <RequireAuth roles={['SELLER', 'ADMIN']}><SellerDisputesPage /></RequireAuth>,
      },

      // ── Admin (protected, ADMIN only) ───────────────────────────────────
      { path: 'admin', element: admin(<AdminDashboardPage />) },
      { path: 'admin/approvals', element: admin(<AdminApprovalsPage />) },
      { path: 'admin/disputes', element: admin(<AdminDisputesPage />) },
      { path: 'admin/disputes/:id', element: admin(<AdminDisputeDetailPage />) },
      { path: 'admin/settlements', element: admin(<AdminSettlementsPage />) },
      { path: 'admin/cms', element: admin(<AdminCmsPage />) },

      // ── Static pages ────────────────────────────────────────────────────
      { path: 'help', element: <StaticPage page="help" /> },
      { path: 'shipping-policy', element: <StaticPage page="shipping-policy" /> },
      { path: 'return-policy', element: <StaticPage page="return-policy" /> },
      { path: 'contact', element: <StaticPage page="contact" /> },
      { path: 'privacy', element: <StaticPage page="privacy" /> },
      { path: 'terms', element: <StaticPage page="terms" /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
