
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function ProductDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isBuyer = isAuthenticated && user?.role === "buyer";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Fetch product details
  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setQuantity(1);
        setActiveImage(0);
        setImageFailed(false);
        setCartFeedback(null);
        setRelatedProducts([]);

        const response = await api.get(`/products/${id}`);

        if (active) {
          setProduct(response.data.product);
        }
      } catch (fetchError) {
        if (active) {
          setError(
            fetchError.response?.data?.message ||
              "Unable to load product details. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product?.category) return undefined;

    let active = true;

    const fetchRelatedProducts = async () => {
      try {
        setRelatedLoading(true);
        setRelatedProducts([]);

        const categoryResponse = await api.get("/products/public", {
          params: {
            category: product.category,
            page: 1,
            limit: 10,
          },
        });

        let recommendations = (
          categoryResponse.data.products || []
        ).filter((item) => String(item._id) !== String(id));

        if (recommendations.length === 0) {
          const fallbackResponse = await api.get("/products/public", {
            params: { page: 1, limit: 10 },
          });

          recommendations = (
            fallbackResponse.data.products || []
          ).filter((item) => String(item._id) !== String(id));
        }

        if (active) {
          setRelatedProducts(recommendations.slice(0, 4));
        }
      } catch (relatedError) {
        console.error("Related products error:", relatedError);

        if (active) setRelatedProducts([]);
      } finally {
        if (active) setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();

    return () => {
      active = false;
    };
  }, [product?.category, id]);

  // Format price in Indian currency
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  // Get product images
  const getProductImages = (item) => {
    if (Array.isArray(item?.images)) {
      const images = item.images
        .map((image) =>
          typeof image === "string" ? image : image?.url
        )
        .filter(Boolean);

      if (images.length) return images;
    }

    if (typeof item?.image === "string") return [item.image];
    if (typeof item?.imageUrl === "string") return [item.imageUrl];

    return [];
  };

  const productImages = getProductImages(product);
  const productImage = productImages[activeImage] || productImages[0] || "";

  const isOutOfStock = Number(product?.stock) <= 0;
  const storeName =
    product?.storeId?.storeName || "Independent seller";

  // Update quantity
  const changeQuantity = (nextValue) => {
    const stock = Number(product?.stock) || 0;

    setQuantity(Math.max(1, Math.min(stock || 1, nextValue)));
    setCartFeedback(null);
  };

  // Add product to cart
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setCartFeedback(null);

      const response = await api.post("/cart", {
        productId: product._id,
        quantity,
      });

      setCartFeedback({
        type: "success",
        message:
          response.data.message || "Product added to cart successfully.",
      });
    } catch (cartError) {
      setCartFeedback({
        type: "error",
        message:
          cartError.response?.data?.message ||
          "Unable to add this product to cart.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F4EE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-3 w-44 rounded-full bg-[#DDE5D9]" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="aspect-4/4.5 rounded-4xl bg-[#E4E9DF]" />

            <div className="space-y-5 rounded-4xl bg-white p-7">
              <div className="h-4 w-28 rounded-full bg-[#E4E9DF]" />
              <div className="h-10 w-4/5 rounded-lg bg-[#E4E9DF]" />
              <div className="h-8 w-1/3 rounded-lg bg-[#E4E9DF]" />
              <div className="h-24 rounded-2xl bg-[#E4E9DF]" />
              <div className="h-14 rounded-xl bg-[#E4E9DF]" />
              <div className="h-14 rounded-xl bg-[#E4E9DF]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Product error state
  if (error || !product) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F5F4EE] px-4 py-12">
        <div className="w-full max-w-md rounded-4xl border border-[#E5E8DF] bg-white p-8 text-center shadow-[0_20px_60px_rgba(24,54,40,0.07)]">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#174B38]">
            <Package size={30} />
          </span>

          <h2 className="mt-5 text-xl font-bold text-[#1D3025]">
            Product unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#7C867C]">
            {error || "This product could not be found."}
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-6 text-sm font-semibold text-white! shadow-lg shadow-[#174B38]/15 transition hover:-translate-y-0.5 hover:bg-[#10392D]"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F5F4EE] text-[#202B24]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full border border-[#DCE5D9]/60" />
      <div className="pointer-events-none absolute -left-40 top-140 size-96 rounded-full border border-[#DCE5D9]/50" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">

        {/* Breadcrumb */}
        <motion.nav
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          aria-label="Breadcrumb"
          className="relative z-10 mb-7 flex flex-wrap items-center gap-2 text-xs font-medium text-[#879087]"
        >
          <Link to="/" className="transition hover:text-[#174B38]">
            Home
          </Link>

          <ChevronRight size={13} />

          <Link to="/products" className="transition hover:text-[#174B38]">
            Shop
          </Link>

          <ChevronRight size={13} />

          <span className="max-w-56 truncate font-semibold text-[#34443A]">
            {product.name}
          </span>
        </motion.nav>

        {/* Product section */}
        <motion.section
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-7"
        >

          {/* Product gallery */}
          <motion.div
            variants={itemVariants}
            className="min-w-0 rounded-4xl border border-white bg-white/80 p-3 shadow-[0_18px_60px_rgba(27,55,39,0.07)] backdrop-blur-xl sm:p-5"
          >
            <div className="group relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-[1.6rem] bg-linear-to-br from-[#F0F2EA] to-[#E5EBE1] sm:aspect-5/4 lg:aspect-4/4.5">

              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#42634F] shadow-sm backdrop-blur-md sm:left-5 sm:top-5">
                <Sparkles size={12} />
                MarketHub selection
              </div>

              {productImage && !imageFailed ? (
                <motion.img
                  key={productImage}
                  src={productImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.03] sm:p-9"
                  fetchPriority="high"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#52715D]">
                  <ShoppingBag size={58} strokeWidth={1.3} />
                  <span className="text-sm font-semibold">MarketHub</span>
                  <span className="text-xs text-[#89978B]">
                    Product image unavailable
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#345A43] shadow-md backdrop-blur-md">
                <Package size={18} />
              </div>
            </div>

            {/* Image thumbnails */}
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(index);
                      setImageFailed(false);
                    }}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`size-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#F0F2EA] p-1 transition ${
                      activeImage === index
                        ? "border-[#174B38] shadow-md shadow-[#174B38]/10"
                        : "border-transparent hover:border-[#B9CABB]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full rounded-xl object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product information */}
          <motion.div
            variants={itemVariants}
            className="flex min-w-0 flex-col overflow-hidden rounded-4xl border border-white bg-white/90 p-5 shadow-[0_18px_60px_rgba(27,55,39,0.07)] backdrop-blur-xl sm:p-8 lg:p-9"
          >
            {/* Premium product header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#EAF0E7] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#315D40]">
                {product.category || "Collection"}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                  isOutOfStock
                    ? "bg-red-50 text-red-600"
                    : "bg-[#F0F6EF] text-[#34744B]"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isOutOfStock ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                {isOutOfStock ? "Out of stock" : "Ready to ship"}
              </span>
            </div>

            <h1 className="mt-5 wrap-break-word text-[1.9rem] font-bold leading-[1.15] tracking-[-0.045em] text-[#1D3025] sm:text-4xl xl:text-[2.55rem]">
              {product.name}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#818B81]">
              A thoughtful find, selected for your everyday lifestyle.
            </p>

            {/* Price */}
            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight text-[#174B38] sm:text-[2.2rem]">
                {formatPrice(product.price)}
              </span>

              <span className="pb-1 text-xs text-[#899188]">
                Inclusive of listed product price
              </span>
            </div>

            <div className="my-7 h-px bg-linear-to-r from-[#DCE5DB] via-[#E9ECE5] to-transparent" />

            {/* Availability */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F6F8F3] p-4">
                <div className="flex items-center gap-2 text-[#819083]">
                  <Package size={15} />
                  <span className="text-[11px] font-medium">
                    Availability
                  </span>
                </div>

                <p className={`mt-2 text-sm font-bold ${
                  isOutOfStock ? "text-red-600" : "text-[#285D3C]"
                }`}>
                  {isOutOfStock ? "Unavailable" : "In stock"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F8F3] p-4">
                <div className="flex items-center gap-2 text-[#819083]">
                  <ShoppingBag size={15} />
                  <span className="text-[11px] font-medium">
                    Available units
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-[#26382C]">
                  {Number(product.stock) || 0} items
                </p>
              </div>
            </div>

            {/* Buyer purchase controls */}
            {isBuyer && (
              <div className="mt-6 rounded-3xl border border-[#E7ECE4] bg-[#FBFCF9] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#2A3C30]">
                    Choose quantity
                  </p>

                  <span className="text-[11px] text-[#879187]">
                    {isOutOfStock
                      ? "Currently unavailable"
                      : `${product.stock} available`}
                  </span>
                </div>

                {/* Quantity selector */}
                <div className="mt-3 flex h-12 w-fit items-center rounded-xl border border-[#E2E9DF] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity - 1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="flex size-9 items-center justify-center rounded-lg text-[#315D40] transition hover:bg-[#EDF3EB] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={15} />
                  </button>

                  <span className="min-w-10 text-center text-sm font-bold tabular-nums text-[#26382C]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity + 1)}
                    disabled={
                      quantity >= Number(product.stock) || isOutOfStock
                    }
                    aria-label="Increase quantity"
                    className="flex size-9 items-center justify-center rounded-lg text-[#315D40] transition hover:bg-[#EDF3EB] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Add to cart */}
                <motion.button
                  type="button"
                  whileHover={
                    !isOutOfStock && !addingToCart ? { y: -2 } : {}
                  }
                  whileTap={{ scale: 0.985 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || isOutOfStock}
                  className="mt-4 inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-bold text-white! shadow-[0_10px_22px_rgba(23,75,56,0.2)] transition hover:bg-[#10392D] hover:shadow-[0_14px_28px_rgba(23,75,56,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174B38] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart size={17} />

                  {addingToCart
                    ? "Adding to cart..."
                    : isOutOfStock
                    ? "Out of stock"
                    : "Add to cart"}

                  {!addingToCart && !isOutOfStock && (
                    <ArrowRight size={16} />
                  )}
                </motion.button>

                {/* Cart feedback */}
                {cartFeedback && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    aria-live="polite"
                    className={`mt-3 flex items-center justify-center gap-2 text-xs font-semibold ${
                      cartFeedback.type === "success"
                        ? "text-[#287247]"
                        : "text-red-600"
                    }`}
                  >
                    {cartFeedback.type === "success" && <Check size={14} />}
                    {cartFeedback.message}
                  </motion.p>
                )}
              </div>
            )}

            {/* Seller information */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E8ECE5] bg-white p-4 transition hover:border-[#D5E2D3]">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#285D40]">
                <Store size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#929B91]">
                  Sold by
                </p>

                <p className="mt-1 wrap-break-word text-sm font-bold text-[#26382C]">
                  {storeName}
                </p>

                {product.storeId?.description && (
                  <p className="mt-1 text-xs leading-5 text-[#879187]">
                    {product.storeId.description}
                  </p>
                )}
              </div>

              <ShieldCheck
                size={19}
                className="mt-1 shrink-0 text-[#4B805B]"
              />
            </div>

            {/* Shopping benefits */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] font-medium text-[#778579]">
              <div className="flex items-center gap-2">
                <Truck size={16} className="shrink-0 text-[#4C7658]" />
                Delivery at checkout
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-[#4C7658]" />
                Secure shopping
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Product description */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 mt-7 overflow-hidden rounded-4xl border border-white bg-white/85 p-6 shadow-[0_14px_45px_rgba(27,55,39,0.045)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3">
            <span className="h-9 w-1 rounded-full bg-[#477A55]" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#568064]">
                Product information
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#24372B] sm:text-2xl">
                The details
              </h2>
            </div>
          </div>

          <p className="mt-5 max-w-4xl whitespace-pre-line text-sm leading-7 text-[#758176]">
            {product.description || "No description available."}
          </p>
        </motion.section>

        {/* Related products */}
        <section className="relative z-10 pb-12 pt-12 sm:pb-16 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-7 flex items-end justify-between gap-4"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#568064]">
                Curated for you
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#24372B] sm:text-3xl">
                You may also like
              </h2>

              <p className="mt-2 text-xs text-[#879187] sm:text-sm">
                Discover more finds from independent sellers.
              </p>
            </div>

            <Link
              to="/products"
              className="mb-1 inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[#285D40] transition hover:gap-3"
            >
              Explore all
              <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Related product loading */}
          {relatedLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-3xl border border-[#E8ECE5] bg-white p-2"
                >
                  <div className="aspect-4/3 rounded-xl bg-[#E7EAE2]" />

                  <div className="space-y-3 p-3">
                    <div className="h-3 w-1/2 rounded-full bg-[#E7EAE2]" />
                    <div className="h-4 w-4/5 rounded-full bg-[#E7EAE2]" />
                    <div className="h-4 w-1/3 rounded-full bg-[#E7EAE2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((item, index) => {
                const image = getProductImages(item)[0];
                const outOfStock = Number(item.stock) <= 0;

                return (
                  <motion.article
                    key={item._id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.07,
                    }}
                    whileHover={{ y: -5 }}
                    className="group min-w-0 overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-[0_8px_28px_rgba(27,55,39,0.045)] transition-shadow duration-300 hover:shadow-[0_18px_38px_rgba(27,55,39,0.11)]"
                  >
                    <Link
                      to={`/products/${item._id}`}
                      className="relative block aspect-4/3 overflow-hidden rounded-[1.1rem] bg-[#F0F2EA]"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#52715D]">
                          <ShoppingBag size={30} strokeWidth={1.4} />
                        </div>
                      )}

                      <span className="absolute left-3 top-3 max-w-[80%] truncate rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#42634F] backdrop-blur">
                        {item.category || "Find"}
                      </span>
                    </Link>

                    <div className="px-2 pb-2 pt-3">
                      <p className="truncate text-[10px] font-medium text-[#929B91]">
                        {item.storeId?.storeName || "Independent seller"}
                      </p>

                      <Link
                        to={`/products/${item._id}`}
                        className="mt-1.5 block min-h-10 text-xs font-bold leading-5 text-[#293B2F] transition hover:text-[#39734C] sm:text-sm"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#EEF0EA] pt-3">
                        <span className="text-sm font-bold text-[#174B38]">
                          {formatPrice(item.price)}
                        </span>

                        <span className={`text-[9px] font-semibold ${
                          outOfStock ? "text-red-500" : "text-[#63816A]"
                        }`}>
                          {outOfStock ? "Sold out" : "In stock"}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-4xl border border-dashed border-[#D9E1D6] bg-white/70 px-5 py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EAF0E7] text-[#416B4C]">
                <ShoppingBag size={25} />
              </span>

              <h3 className="mt-4 text-sm font-bold text-[#2A3C30]">
                More products coming soon
              </h3>

              <p className="mt-1 text-xs text-[#879187]">
                Explore the collection to discover more products.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#285D40] hover:underline"
              >
                Browse products
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
