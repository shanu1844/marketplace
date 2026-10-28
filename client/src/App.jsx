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
                </Route>
                <Route path="/seller/orders" element={<SellerOrders />} />
                 <Route path="/seller/products" element={<SellerProducts />} />
              </Route>

              <Route path="/become-seller" element={<BecomeSeller />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
