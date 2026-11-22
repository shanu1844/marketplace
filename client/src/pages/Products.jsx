import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  X,
  RefreshCw,
  SlidersHorizontal,
  PackageCheck,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { user, isAuthenticated } = useAuth();

  const isBuyer = isAuthenticated && user?.role === "buyer";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [addingProductId, setAddingProductId] = useState(null);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [shuffleSeed] = useState(
  () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

  // Fetch public products
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
             seed: shuffleSeed,
          },
        });

        if (!isActive) return;

        const data = response.data;

        const productList = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        setProducts(productList);

        const pagination = data?.pagination || data;

        setTotalPages(
          Math.max(
            1,
            Number(
              pagination?.totalPages ||
                pagination?.pages ||
                1
            )
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
  }, [page, search, category, retryCount  ,shuffleSeed]);

  // Fetch all active product categories from the database
  useEffect(() => {
    let isActive = true;

    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories");

        if (!isActive) return;

        const categoryList = response.data?.categories || [];

        setCategories([
          "All",
          ...categoryList.filter(
            (item) => typeof item === "string" && item.trim()
          ),
        ]);
      } catch (fetchError) {
        console.error(
          "Fetch categories error:",
          fetchError.response?.data?.message || fetchError.message
        );
      }
    };

    fetchCategories();

    return () => {
      isActive = false;
    };
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  // Product image helper
  const getProductImage = (product) => {
    if (typeof product.image === "string") return product.image;

    if (typeof product.imageUrl === "string") {
      return product.imageUrl;
    }

    if (typeof product.images?.[0] === "string") {
      return product.images[0];
    }

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

  const handleRetry = () => {
    setRetryCount((current) => current + 1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPage(1);
  };

  // Add product to cart
  const handleAddToCart = async (productId) => {
    try {
      setAddingProductId(productId);
      setCartFeedback(null);

      const response = await api.post("/cart", {
        productId,
        quantity: 1,
      });

      setCartFeedback({
        productId,
        type: "success",
        message:
          response.data?.message ||
          "Added to cart successfully!",
      });
    } catch (cartError) {
      setCartFeedback({
        productId,
        type: "error",
        message:
          cartError.response?.data?.message ||
          "Unable to add this product to cart.",
      });
    } finally {
      setAddingProductId(null);
    }
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F4EE] text-[#252923]">

      {/* ================= HERO SECTION ================= */}

      <section className="relative overflow-hidden bg-[#123D2E] text-white">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 -top-40 size-125 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-24 size-87.5 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 size-112.5 rounded-full border border-white/10" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-[#DDEBDD]">
              <Sparkles size={14} />
              THE MARKETPLACE, REIMAGINED
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Discover things
              <span className="block text-[#C8DDBE]">
                worth finding.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Explore thoughtfully selected products from independent
              sellers. Find your next favourite, discover new brands
              and shop with confidence.
            </p>

            {/* Hero search */}
            <div className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white p-2 shadow-2xl shadow-black/10">

              <Search
                size={19}
                className="ml-3 shrink-0 text-[#73786F]"
              />

              <input
  type="text"
  value={search}
  onChange={handleSearch}
  placeholder="What are you looking for?"
  autoComplete="off"
  style={{
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    boxShadow: "none",
    WebkitAppearance: "none",
    appearance: "none",
  }}
  className="
    h-11 min-w-0 flex-1
    border-0! bg-transparent!
    p-0! text-sm text-[#252923]
    outline-none! ring-0! shadow-none!
    placeholder:text-[#999D95]
    focus:border-0!
    focus:bg-transparent!
    focus:outline-none!
    focus:ring-0!
    focus:shadow-none!
    focus-visible:bg-transparent!
    focus-visible:outline-none!
    active:bg-transparent!
  "
/>

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="rounded-lg p-2 text-[#73786F] hover:bg-[#F0F1EA]"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("product-collection")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#174B38] px-4 text-xs font-semibold text-white! transition hover:bg-[#103729] sm:px-6"
              >
                Explore
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Hero trust points */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#C8DDBE]" />
                Unique finds
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#C8DDBE]" />
                Independent sellers
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#C8DDBE]" />
                Easy shopping
              </span>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-[#E9EBDD] p-3 shadow-2xl shadow-black/20">

              <div className="relative flex min-h-82.5 flex-col justify-between overflow-hidden rounded-3xl bg-[#DCE5D5] p-6 text-[#174B38] sm:min-h-97.5">

                <div className="absolute -right-20 -top-20 size-64 rounded-full border border-[#174B38]/10" />
                <div className="absolute -right-10 -top-10 size-44 rounded-full border border-[#174B38]/10" />

                <div className="relative flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.2em]">
                    MARKETPLACE COLLECTION
                  </span>

                  <span className="rounded-full bg-white/70 p-2">
                    <Leaf size={17} />
                  </span>
                </div>

                <div className="relative py-8">
                  <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                    <ShoppingBag size={32} />
                  </div>

                  <h2 className="max-w-xs text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    Little finds.
                    <br />
                    Big favourites.
                  </h2>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-[#174B38]/70">
                    A world of products waiting to be discovered.
                  </p>
                </div>

                <div className="relative flex items-center justify-between border-t border-[#174B38]/15 pt-4">
                  <span className="text-xs font-semibold">
                    Find your next favourite
                  </span>

                  <span className="flex size-9 items-center justify-center rounded-full bg-[#174B38] text-white">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </div>
            </div>

            {/* Floating info card */}
            <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-[#E7E4DB] bg-white p-3 shadow-xl sm:-left-8 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E4EBE3] text-[#174B38]">
                <Store size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#252923]">
                  Discover independent stores
                </p>
                <p className="mt-1 text-[10px] text-[#73786F]">
                  Shop from different sellers
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= BENEFITS STRIP ================= */}

      <section className="border-b border-[#E7E4DB] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">

          {[
            {
              icon: ShieldCheck,
              title: "Shop confidently",
              text: "A convenient shopping experience",
            },
            {
              icon: Store,
              title: "Independent sellers",
              text: "Discover different stores",
            },
            {
              icon: Truck,
              title: "Order convenience",
              text: "A simple way to shop",
            },
            {
              icon: PackageCheck,
              title: "Easy discovery",
              text: "Find products you love",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                  <Icon size={19} />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#252923]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[10px] leading-4 text-[#858980]">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CATEGORY DISCOVERY ================= */}

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#174B38]">
              FIND YOUR INTEREST
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#252923] sm:text-3xl">
              Explore categories
            </h2>

            <p className="mt-2 text-sm text-[#73786F]">
              Start with something you love.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              handleCategoryChange("All");

              document
                .getElementById("product-collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hidden items-center gap-2 text-xs font-semibold text-[#174B38] transition hover:gap-3 sm:inline-flex"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">

          {categories.map((item, index) => {
            const isSelected = category === item;

            return (
              <motion.button
                key={item}
                type="button"
                onClick={() => handleCategoryChange(item)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={`group inline-flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-[#174B38] bg-[#174B38] text-white!"
                    : "border-[#E7E4DB] bg-white text-[#252923] hover:border-[#B9CDBB] hover:bg-[#EDF2E9]"
                }`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-white/15 text-white"
                      : "bg-[#EAF0E7] text-[#174B38]"
                  }`}
                >
                  {index === 0 ? (
                    <ShoppingBag size={16} />
                  ) : (
                    <Leaf size={16} />
                  )}
                </span>

                <span className="text-xs font-semibold">
                  {item === "All" ? "All products" : item}
                </span>

                {isSelected && <CheckCircle2 size={15} />}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ================= PRODUCT COLLECTION ================= */}

      <section
        id="product-collection"
        className="mx-auto max-w-7xl scroll-mt-8 px-4 py-14 sm:px-6 lg:px-8"
      >

        {/* Collection heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#174B38]">
              THE MARKETPLACE COLLECTION
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#252923] sm:text-3xl">
              {category === "All" ? "Explore all products" : category}
            </h2>

            <p className="mt-2 text-sm text-[#73786F]">
              Discover something special from our marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-[#E7E4DB] bg-white px-3 py-2 text-xs text-[#73786F] sm:self-auto">
            <ShoppingBag size={15} className="text-[#174B38]" />

            {loading
              ? "Finding products..."
              : `${products.length} products on this page`}
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#E7E4DB] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
              <SlidersHorizontal size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#252923]">
                Refine your discovery
              </p>
              <p className="mt-1 text-[10px] text-[#858980]">
                Search and filter products
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E7E4DB] bg-[#F8F8F4] px-3 sm:w-64 sm:flex-none">
              <Search size={15} className="shrink-0 text-[#858980]" />

              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search products..."
                className="h-full min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 text-xs text-[#252923] shadow-none! outline-none! ring-0! placeholder:text-[#999D95] focus:border-0! focus:shadow-none! focus:outline-none! focus:ring-0!"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="text-[#73786F] hover:text-[#174B38]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E7E4DB] px-3 text-xs font-semibold text-[#73786F] transition hover:border-[#174B38] hover:text-[#174B38]"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 font-semibold"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#E7E4DB] bg-white"
              >
                <div className="aspect-4/4.5 bg-[#E4EBE3]" />

                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-2.5 w-1/3 rounded-full bg-[#E7E4DB]" />
                  <div className="h-3 w-4/5 rounded-full bg-[#E7E4DB]" />
                  <div className="h-3 w-1/2 rounded-full bg-[#E7E4DB]" />
                  <div className="h-9 rounded-lg bg-[#E7E4DB]" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && products.length === 0 ? (

          /* Empty state */
          <div className="flex flex-col items-center rounded-4xl border border-[#E7E4DB] bg-white px-5 py-16 text-center">

            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#EAF0E7] text-[#174B38]">
              <ShoppingBag size={28} />
            </div>

            <h3 className="text-xl font-semibold text-[#252923]">
              Nothing here just yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#73786F]">
              We couldn't find products matching your search.
              Try another keyword or explore all products.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#174B38] px-5 text-xs font-semibold text-white! transition hover:bg-[#103729]"
            >
              Explore all products
              <ArrowRight size={15} />
            </button>
          </div>

        ) : !error ? (

          /* Product cards */
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {products.map((product, index) => {
              const image = getProductImage(product);

              const productId = product._id || product.id;

              const productName =
                product.name || product.title || "Untitled product";

              const isAdding = addingProductId === productId;

              const isOutOfStock =
                Number(product.stock) <= 0;

              const sellerName =
                product.storeId?.storeName ||
                product.storeId?.name ||
                product.storeName ||
                "Independent seller";

              const feedback =
                cartFeedback?.productId === productId
                  ? cartFeedback
                  : null;

              return (
                <motion.article
                  key={productId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.045, 0.3),
                  }}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-[#E7E4DB] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#C9D7CB] hover:shadow-xl hover:shadow-[#174B38]/8"
                >
                  {/* Product image */}
                  <Link
                    to={`/products/${productId}`}
                    aria-label={`View ${productName}`}
                    className="relative block aspect-4/4.5 overflow-hidden bg-[#EAF0E7]"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={productName}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#174B38]">
                        <ShoppingBag size={32} />
                        <span className="text-xs font-semibold">
                          MarketHub
                        </span>
                      </div>
                    )}

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#102D21]/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                    {/* Category label */}
                    {product.category && (
                      <span className="absolute left-3 top-3 max-w-[calc(100%-24px)] truncate rounded-lg border border-white/70 bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-[#174B38] shadow-sm backdrop-blur-sm">
                        {product.category}
                      </span>
                    )}

                    {/* Out of stock */}
                    {isOutOfStock && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-[#252923]/90 px-3 py-1.5 text-[10px] font-semibold text-white">
                        Out of stock
                      </span>
                    )}

                    {/* Quick view indicator */}
                    <span className="absolute bottom-3 right-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white text-[#174B38] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight size={17} />
                    </span>
                  </Link>

                  {/* Product information */}
                  <div className="space-y-3 p-3 sm:p-4">

                    <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-[#858980]">
                      <Store size={12} className="shrink-0 text-[#174B38]" />

                      <span className="truncate">
                        {sellerName}
                      </span>
                    </div>

                    <Link
                      to={`/products/${productId}`}
                      className="block"
                    >
                      <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#252923] transition-colors group-hover:text-[#174B38]">
                        {productName}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between gap-2 border-t border-[#F0EEE8] pt-3">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#858980]">
                          Price
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-[#174B38] sm:text-base">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <Link
                        to={`/products/${productId}`}
                        aria-label={`View details for ${productName}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38] transition hover:bg-[#174B38] hover:text-white"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    {/* Buyer cart action */}
                    {isBuyer && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          disabled={isAdding || isOutOfStock}
                          onClick={() => handleAddToCart(productId)}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-3 py-2 text-xs font-semibold text-white! transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShoppingCart size={15} />

                          {isAdding
                            ? "Adding..."
                            : isOutOfStock
                              ? "Out of Stock"
                              : "Add to Cart"}
                        </button>

                        {feedback && (
                          <p
                            role="status"
                            className={`text-center text-[10px] font-medium ${
                              feedback.type === "success"
                                ? "text-[#174B38]"
                                : "text-red-600"
                            }`}
                          >
                            {feedback.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Guest shopping action */}
                    {!isAuthenticated && (
                      <Link
                        to="/login"
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE5D5] bg-[#F5F7F1] px-3 py-2 text-xs font-semibold text-[#174B38] transition hover:bg-[#EAF0E7]"
                      >
                        <ShoppingCart size={15} />
                        Sign in to shop
                      </Link>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ) : null}

        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-[#E7E4DB] pt-7">

            <button
              type="button"
              onClick={() => {
                setPage((current) => current - 1);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              disabled={page <= 1}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E7E4DB] bg-white px-4 text-xs font-semibold text-[#73786F] transition hover:border-[#174B38] hover:text-[#174B38] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-xs text-[#73786F]">
              Page{" "}
              <strong className="text-[#252923]">{page}</strong>
              {" "}of{" "}
              <strong className="text-[#252923]">{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() => {
                setPage((current) => current + 1);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              disabled={page >= totalPages}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E7E4DB] bg-white px-4 text-xs font-semibold text-[#73786F] transition hover:border-[#174B38] hover:text-[#174B38] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ================= FEATURED DISCOVERY ================= */}

      {!loading && !error && featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-4xl bg-[#E4EBE0]">
            <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-12">

              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-[#174B38]">
                  <Leaf size={13} />
                  MADE FOR DISCOVERY
                </span>

                <h2 className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-[#174B38] sm:text-4xl">
                  Your next favourite
                  thing is waiting.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-[#52675A]">
                  Take your time, explore different products and
                  discover stores that bring something new to
                  your everyday life.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("product-collection")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#174B38] px-5 text-xs font-semibold text-white! transition hover:bg-[#103729]"
                >
                  Keep exploring
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Product image collage from fetched products */}
              <div className="grid grid-cols-2 gap-3">

                {featuredProducts.slice(0, 4).map((product, index) => {
                  const image = getProductImage(product);
                  const productId = product._id || product.id;

                  return (
                    <Link
                      key={productId}
                      to={`/products/${productId}`}
                      className={`group relative overflow-hidden rounded-2xl bg-white ${
                        index === 0 ? "aspect-4/5" : "aspect-square"
                      }`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name || product.title || "Product"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#174B38]">
                          <ShoppingBag size={28} />
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-3 pt-10">
                        <p className="line-clamp-1 text-xs font-semibold text-white">
                          {product.name || product.title || "Discover product"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= SELLER CTA ================= */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-4xl bg-[#123D2E] p-7 text-white sm:p-10 lg:p-12">

          <div className="absolute -right-20 -top-32 size-80 rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-20 size-60 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="max-w-xl">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#C8DDBE]">
                FOR INDEPENDENT SELLERS
              </span>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Have something to sell?
                <br />
                <span className="text-[#C8DDBE]">
                  Grow with MarketHub.
                </span>
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
                Bring your products to a marketplace where people
                come to discover something different.
              </p>
            </div>

            {user?.role === "seller" ? (
              <Link
                to="/seller/dashboard"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#174B38] transition hover:bg-[#EAF0E7]"
              >
                Open seller dashboard
                <ArrowUpRight size={16} />
              </Link>
            ) : user?.role === "admin" ? (
              <Link
                to="/"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#174B38] transition hover:bg-[#EAF0E7]"
              >
                Back to home
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to={isAuthenticated ? "/become-seller" : "/register"}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#C8DDBE] bg-[#C8DDBE] px-6 text-sm font-bold text-[#123D2E]! shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#123D2E]!"
              >
                Start selling
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER BRAND STRIP ================= */}

      <section className="border-t border-[#E7E4DB] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">

          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#174B38] text-white">
              <Leaf size={16} />
            </span>

            <span className="text-sm font-bold tracking-tight text-[#174B38]">
              MarketHub
            </span>
          </div>

          <p className="text-[11px] text-[#858980]">
            Discover more. Shop better. Support independent sellers.
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs font-semibold text-[#174B38] transition hover:underline"
          >
            Back to top ↑
          </button>
        </div>
      </section>
    </main>
  );
}

export default Products;