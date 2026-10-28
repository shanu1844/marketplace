import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "motion/react";
import { Package, ShoppingBag, IndianRupee, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const dashboardCards = [
  {
    title: "Total Products",
    key: "products",
    description: "Products listed in your store",
    icon: Package,
  },
  {
    title: "Total Orders",
    key: "orders",
    description: "Orders received by your store",
    icon: ShoppingBag,
  },
  {
    title: "Total Sales",
    key: "sales",
    description: "Total value of seller orders",
    icon: IndianRupee,
  },
];

function SellerDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    sales: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [productsResponse, ordersResponse] = await Promise.all([
          api.get("/products/my-products"),
          api.get("/orders/seller/my-orders"),
        ]);

        if (!isActive) return;

        const products = productsResponse.data?.products || [];
        const orders = ordersResponse.data?.orders || [];

        const sales = orders.reduce(
          (total, order) => total + (Number(order.sellerTotal) || 0),
          0,
        );

        setStats({
          products: productsResponse.data?.count ?? products.length,
          orders: ordersResponse.data?.count ?? orders.length,
          sales,
        });
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load dashboard statistics.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="seller-dashboard-page">
        <div className="container">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="seller-dashboard-page">
        <div className="container">
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-dashboard-page">
      <div className="container">
        <motion.section
          className="seller-dashboard-heading"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="seller-dashboard-eyebrow">SELLER WORKSPACE</span>

          <h1>
            Welcome to your dashboard<span>.</span>
          </h1>

          <p>Manage your store, products, and orders from one place.</p>
        </motion.section>

        <section className="seller-dashboard-grid">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            const value = stats[card.key];

            const displayValue =
              card.key === "sales"
                ? `₹${value.toLocaleString("en-IN")}`
                : value;

            return (
              <motion.article
                className="seller-dashboard-card"
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
              >
                <span className="seller-dashboard-card-icon">
                  <Icon size={22} />
                </span>

                <p className="seller-dashboard-card-title">{card.title}</p>

                <h2>{displayValue}</h2>

                <p className="seller-dashboard-card-description">
                  {card.description}
                </p>
              </motion.article>
            );
          })}
        </section>

        <motion.section
          className="seller-dashboard-next"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h2>Ready to grow your store?</h2>
            <p>Your seller workspace is the place to manage your business.</p>
          </div>

          <div className="seller-dashboard-actions">
            <Link to="/seller/products" className="btn-primary">
              Manage products <ArrowRight size={17} />
            </Link>

            <Link to="/seller/orders" className="btn-primary">
              Manage Orders <ArrowRight size={17} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default SellerDashboard;
