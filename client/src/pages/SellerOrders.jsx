
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Package, RefreshCw } from "lucide-react";
import api from "../services/api";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/orders/seller/my-orders");

      setOrders(response.data?.orders || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load seller orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let isActive = true;

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/seller/my-orders");

      if (isActive) {
        setOrders(response.data?.orders || []);
        setError("");
      }
    } catch (requestError) {
      if (isActive) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load seller orders."
        );
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  };

  fetchOrders();

  return () => {
    isActive = false;
  };
}, []);

  const updateStatus = async (orderId, itemId, status) => {
    const key = `${orderId}-${itemId}`;

    try {
      setUpdatingItem(key);
      setError("");

      await api.patch(
        `/orders/seller/${orderId}/items/${itemId}/status`,
        { status }
      );

      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingItem("");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <main className="seller-orders-page">
        <div className="container">
          <p>Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-orders-page">
      <div className="container">
        <motion.section
          className="seller-orders-heading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="seller-dashboard-eyebrow">
            SELLER WORKSPACE
          </span>

          <h1>Manage Orders<span>.</span></h1>

          <p>Review incoming orders and update item statuses.</p>
        </motion.section>

        {error && (
          <div className="seller-orders-error" role="alert">
            {error}
          </div>
        )}

        <div className="seller-orders-toolbar">
          <div>
            <h2>All Orders</h2>
            <p>{orders.length} orders found</p>
          </div>

          <button
            type="button"
            className="seller-orders-refresh"
            onClick={() => {
              setLoading(true);
              loadOrders();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <section className="seller-orders-empty">
            <Package size={36} />
            <h2>No orders yet</h2>
            <p>Orders for your store will appear here.</p>
          </section>
        ) : (
          <section className="seller-orders-list">
            {orders.map((order) => (
              <motion.article
                className="seller-order-card"
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="seller-order-header">
                  <div>
                    <span>Order ID</span>
                    <h3>{order._id}</h3>
                  </div>

                  <div className="seller-order-total">
                    <span>Order value</span>
                    <strong>{formatPrice(order.sellerTotal)}</strong>
                  </div>
                </div>

                <div className="seller-order-meta">
                  <span>
                    Placed on{" "}
                    {order.createdAt
                      ? formatDate(order.createdAt)
                      : "Date unavailable"}
                  </span>

                  <span>
                    Payment: {order.paymentStatus || "Unknown"}
                  </span>
                </div>

                <div className="seller-order-items">
                  {order.items.map((item) => {
                    const itemId = item._id;
                    const key = `${order._id}-${itemId}`;
                    const status = String(item.status || "placed")
                      .toLowerCase();

                    const nextStatuses = {
                      placed: [
                        { value: "confirmed", label: "Confirm order" },
                        { value: "cancelled", label: "Cancel item" },
                      ],
                      confirmed: [
                        { value: "processing", label: "Start processing" },
                        { value: "cancelled", label: "Cancel item" },
                      ],
                      processing: [
                        { value: "shipped", label: "Mark shipped" },
                      ],
                      shipped: [
                        { value: "delivered", label: "Mark delivered" },
                      ],
                    };

                    const options = nextStatuses[status] || [];

                    return (
                      <div
                        className="seller-order-item"
                        key={itemId || item.productId}
                      >
                        <div className="seller-order-item-info">
                          <h4>{item.productName || "Product"}</h4>

                          <p>
                            {formatPrice(item.price)} × {item.quantity}
                          </p>

                          <span
                            className={`seller-order-status status-${status}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="seller-order-item-actions">
                          <strong>
                            {formatPrice(
                              Number(item.price) * Number(item.quantity)
                            )}
                          </strong>

                          {options.length > 0 && (
                            <select
                            id={`status-${order._id}-${itemId}`}
  name={`status-${order._id}-${itemId}`}
                              aria-label={`Update status for ${item.productName || "product"}`}
                              value=""
                              disabled={updatingItem === key}
                              onChange={(event) => {
                                const nextStatus = event.target.value;

                                if (nextStatus) {
                                  updateStatus(
                                    order._id,
                                    itemId,
                                    nextStatus
                                  );
                                }
                              }}
                            >
                              <option value="">
                                {updatingItem === key
                                  ? "Updating..."
                                  : "Update status"}
                              </option>

                              {options.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="seller-order-footer">
                  <span>
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </span>

                  {order.shippingAddress && (
                    <span>Shipping address available</span>
                  )}
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default SellerOrders;
