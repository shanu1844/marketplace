
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {  Package,
  Plus,
  RefreshCw,
  ArrowRight,
  X,
  ImagePlus, } from "lucide-react";
import api from "../services/api";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
});

const [saving, setSaving] = useState(false);
const [formError, setFormError] = useState("");
const [formSuccess, setFormSuccess] = useState("");
  const loadProducts = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/products/my-products");
      const data = response.data;

      setProducts(
        Array.isArray(data)
          ? data
          : data?.products || data?.data || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your products."
      );
    } finally {
      setLoading(false);
    }
  }, []);


const handleAddProduct = async (event) => {
  event.preventDefault();
  setFormError("");
  setFormSuccess("");

  const price = Number(formData.price);
  const stock = Number(formData.stock);

  if (!Number.isFinite(price) || price <= 0) {
    setFormError("Price must be greater than zero.");
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    setFormError("Stock must be a non-negative integer.");
    return;
  }

  try {
    setSaving(true);

    const response = await api.post("/products", {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      stock,
      category: formData.category.trim(),
    });

    setFormSuccess(
      response.data?.message || "Product created successfully."
    );

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    });

    await loadProducts();
  } catch (requestError) {
    setFormError(
      requestError.response?.data?.message ||
        "Unable to create product. Please try again."
    );
  } finally {
    setSaving(false);
  }
};


  useEffect(() => {
    let active = true;

    api.get("/products/my-products")
      .then((response) => {
        if (!active) return;

        const data = response.data;
        setProducts(
          Array.isArray(data)
            ? data
            : data?.products || data?.data || []
        );
        setError("");
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your products."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <main className="seller-products-page">
      <div className="container">
        <motion.section
          className="seller-products-heading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="seller-dashboard-eyebrow">
            SELLER WORKSPACE
          </span>

          <h1>My Products<span>.</span></h1>
          <p>Manage the products listed in your store.</p>
        </motion.section>

        <div className="seller-products-toolbar">
          <div>
            <h2>Your inventory</h2>
            <p>{products.length} products listed</p>
          </div>

          <button
            type="button"
            className="seller-products-refresh"
            onClick={async () => {
              setLoading(true);
              await loadProducts();
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

<div className="seller-products-add-action">
  <button
    type="button"
    className="btn-primary"
    onClick={() => {
      setShowAddForm((previous) => !previous);
      setFormError("");
      setFormSuccess("");
    }}
  >
    {showAddForm ? <X size={17} /> : <Plus size={17} />}
    {showAddForm ? "Close Form" : "Add Product"}
  </button>
</div>

{showAddForm && (
  <section className="seller-add-product-form">
    <h2>Add a New Product</h2>

    {formError && (
      <p className="seller-add-form-error" role="alert">
        {formError}
      </p>
    )}

    {formSuccess && (
      <p className="seller-add-form-success" role="status">
        {formSuccess}
      </p>
    )}

   <form onSubmit={handleAddProduct}>
      <label htmlFor="product-name">Product Name</label>
      <input
        id="product-name"
        name="name"
        value={formData.name}
        onChange={(event) =>
          setFormData({ ...formData, name: event.target.value })
        }
        required
      />

      <label htmlFor="product-description">Description</label>
      <textarea
        id="product-description"
        name="description"
        value={formData.description}
        onChange={(event) =>
          setFormData({ ...formData, description: event.target.value })
        }
        required
      />

      <div className="seller-add-form-row">
        <div>
          <label htmlFor="product-price">Price (₹)</label>
          <input
            id="product-price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.price}
            onChange={(event) =>
              setFormData({ ...formData, price: event.target.value })
            }
            required
          />
        </div>

        <div>
          <label htmlFor="product-stock">Stock</label>
          <input
            id="product-stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={(event) =>
              setFormData({ ...formData, stock: event.target.value })
            }
            required
          />
        </div>
      </div>

      <label htmlFor="product-category">Category</label>
      <input
        id="product-category"
        name="category"
        value={formData.category}
        onChange={(event) =>
          setFormData({ ...formData, category: event.target.value })
        }
        placeholder="e.g. Clothing"
        required
      />

      <label htmlFor="product-image">Image URL</label>
      <input
        id="product-image"
        name="image"
        type="url"
        value={formData.image}
        onChange={(event) =>
          setFormData({ ...formData, image: event.target.value })
        }
        placeholder="https://example.com/image.jpg"
      />

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save Product"}
      </button>
    </form>
  </section>
)}


        {error && (
          <div className="seller-orders-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading your products...</p>
        ) : products.length === 0 && !error ? (
          <section className="seller-products-empty">
            <Package size={36} />
            <h2>No products yet</h2>
            <p>Your store's products will appear here.</p>
          </section>
        ) : (
          <section className="seller-products-grid">
            {products.map((product) => (
              <motion.article
                className="seller-product-card"
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="seller-product-image">
                  {product.image || product.imageUrl ||
                  product.images?.[0]?.url ||
                  typeof product.images?.[0] === "string" ? (
                    <img
                      src={
                        product.image ||
                        product.imageUrl ||
                        product.images?.[0]?.url ||
                        product.images?.[0]
                      }
                      alt={product.name || product.title || "Product"}
                    />
                  ) : (
                    <Package size={32} />
                  )}
                </div>

                <div className="seller-product-info">
                  <span>{product.category || "Uncategorized"}</span>
                  <h3>{product.name || product.title || "Untitled product"}</h3>
                  <strong>{formatPrice(product.price)}</strong>
                  <p>Stock: {product.stock ?? "N/A"}</p>
                  <p>Status: {product.status || "Active"}</p>
                </div>

                <Link
                  className="seller-product-view-link"
                  to={`/products/${product._id}`}
                >
                  View product <ArrowRight size={15} />
                </Link>
              </motion.article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default SellerProducts;
