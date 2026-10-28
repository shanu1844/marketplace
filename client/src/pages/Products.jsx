import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Leaf,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/products/public", {
          params: {
            page,
            limit: 12,
            search: search.trim() || undefined,
            category: category === "All" ? undefined : category,
          },
        });

        if (!isActive) return;

        const data = response.data;
        const productList = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        setProducts(productList);

        const pagination = data.pagination || data;
        setTotalPages(
          Math.max(
            1,
            Number(pagination.totalPages || pagination.pages || 1)
          )
        );
      } catch (fetchError) {
        if (isActive) {
          setError(
            fetchError.response?.data?.message ||
              "We couldn't load products. Please try again."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [page, search, category]);

  const categories = useMemo(() => {
    const names = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(names)];
  }, [products]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const getProductImage = (product) => {
    if (typeof product.image === "string") return product.image;
    if (typeof product.imageUrl === "string") return product.imageUrl;
    if (typeof product.images?.[0] === "string") return product.images[0];
    if (typeof product.images?.[0]?.url === "string") {
      return product.images[0].url;
    }
    return "";
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <main className="products-page">
      <section className="products-intro">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="products-eyebrow">
              <Leaf size={15} /> THE MARKETPLACE COLLECTION
            </span>
            <h1>Find your next <span>favourite.</span></h1>
            <p>
              Thoughtful finds, everyday essentials, and unique discoveries
              from independent sellers.
            </p>
          </motion.div>

          <div className="products-search-wrap">
            <Search size={20} aria-hidden="true" />
            <input
            id="product-search"
  name="productSearch"
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={search}
              onChange={handleSearch}
            />
            <span className="products-search-label">SEARCH</span>
          </div>
        </div>
      </section>

      <section className="container products-content">
        <div className="products-toolbar">
          <div>
            <span className="products-section-label">CURATED FOR YOU</span>
            <h2>Explore products</h2>
          </div>

          <div className="products-count">
            <ShoppingBag size={17} />
            {loading ? "Loading..." : `${products.length} products on this page`}
          </div>
        </div>

        <div className="products-category-row">
          <div className="products-category-label">
            <SlidersHorizontal size={16} />
            <span>Categories</span>
          </div>

          <div className="products-category-options">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`products-category-chip ${
                  category === item ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="products-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setPage((current) => current)}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="products-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="product-skeleton" key={index}>
                <div className="product-skeleton-image" />
                <div className="product-skeleton-line" />
                <div className="product-skeleton-line short" />
              </div>
            ))}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="products-empty">
            <span className="products-empty-icon">
              <ShoppingBag size={27} />
            </span>
            <h3>No products found</h3>
            <p>Try a different search or choose another category.</p>
            <button
              type="button"
              className="products-reset-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : !error ? (
          <motion.div
            className="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {products.map((product) => {
              const image = getProductImage(product);

              return (
                <article className="product-card" key={product._id || product.id}>
                  <Link
                    to={`/products/${product._id || product.id}`}
                    className="product-image-link"
                    aria-label={`View ${product.name || product.title || "product"}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name || product.title || "Product"}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <ShoppingBag size={32} />
                        <span>MarketHub</span>
                      </div>
                    )}

                    {product.category && (
                      <span className="product-category-badge">
                        {product.category}
                      </span>
                    )}
                  </Link>

                  <div className="product-card-info">
                    <span className="product-store-name">
                      {product.storeId?.storeName ||
                        product.storeId?.name ||
                        product.storeName ||
                        "Independent seller"}
                    </span>

                    <h3>
                      <Link to={`/products/${product._id || product.id}`}>
                        {product.name || product.title || "Untitled product"}
                      </Link>
                    </h3>

                    <div className="product-card-bottom">
                      <span className="product-price">
                        {formatPrice(product.price)}
                      </span>
                      <Link
                        to={`/products/${product._id || product.id}`}
                        className="product-view-link"
                        aria-label={`View details for ${product.name || product.title || "product"}`}
                      >
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </motion.div>
        ) : null}

        {!loading && !error && products.length > 0 && (
          <div className="products-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((current) => current - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Previous
            </button>
            <span>Page <strong>{page}</strong> of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((current) => current + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;