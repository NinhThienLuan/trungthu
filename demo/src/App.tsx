import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './Layout'
import { CatalogPage } from './pages/CatalogPage'
import { CartPage } from './pages/CartPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { SellerProductPage } from './pages/SellerProductPage'
import { SellerProductsPage } from './pages/SellerProductsPage'
import { RequireRole, homeFor } from './routes'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const user = useAuthStore((state) => state.user)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route element={<RequireRole role="CUSTOMER" />}>
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage role="CUSTOMER" />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage role="CUSTOMER" />} />
        </Route>
        <Route element={<RequireRole role="PROVIDER" />}>
          <Route path="/seller/dashboard" element={<DashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/products/new" element={<SellerProductPage />} />
          <Route path="/seller/products/:productId" element={<SellerProductPage />} />
          <Route path="/seller/orders" element={<OrdersPage role="PROVIDER" />} />
          <Route path="/seller/orders/:orderId" element={<OrderDetailPage role="PROVIDER" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  )
}
