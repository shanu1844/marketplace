import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Account from "./pages/Account";
import BecomeSeller from "./pages/BecomeSeller";
import MySellerApplication from "./pages/MySellerApplication";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOrders from "./pages/SellerOrders";
import SellerProducts from "./pages/SellerProducts";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import SellerReturnRequests from "./pages/SellerReturnRequests";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSellerApplications from "./pages/AdminSellerApplications";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminReturns from "./pages/AdminReturns";
import ProductDetails from "./pages/ProductDetails";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />

          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route
  path="/products/:id"
  element={<ProductDetails />}
/>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<Account />} />
                <Route
                  path="/seller/application-status"
                  element={<MySellerApplication />}
                />
                <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
                  <Route
                    path="/seller/dashboard"
                    element={<SellerDashboard />}
                  />
                  <Route
                    path="/seller/return-requests"
                    element={<SellerReturnRequests />}
                  />
                </Route>
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/seller/products" element={<SellerProducts />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["buyer"]} />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/my-orders/:orderId" element={<OrderDetails />} />
              </Route>

              <Route path="/become-seller" element={<BecomeSeller />} />
              {/* Admin Routes */}
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route
    path="/admin"
    element={<AdminDashboard />}
  />
  <Route
  path="/admin/seller-applications"
  element={<AdminSellerApplications />}
/>
<Route
  path="/admin/users"
  element={<AdminUsers />}
/>
<Route
  path="/admin/products"
  element={<AdminProducts />}
/>
<Route path="/admin/orders" element={<AdminOrders />} />
<Route path="/admin/returns" element={<AdminReturns />} />
</Route>
            </Routes>
          </div>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
