import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
  Package,
  Sparkles,
  LockKeyhole,
  Leaf,
} from "lucide-react";
import api from "../services/api";

// Format price in Indian currency.
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

// Read the product image from supported API fields.
const getProductImage = (product) => {
  if (!product || typeof product !== "object") return "";

  const image =
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images)
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url
      : "");

  return typeof image === "string" ? image.trim() : "";
};

function CartProductImage({ product }) {
  const image = getProductImage(product);
  const [failedImage, setFailedImage] = useState("");
  const imageFailed = failedImage === image;

  return (
    <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F0F1E9] sm:size-32 lg:size-36">
      {image && !imageFailed ? (
        <img
          src={image}
          alt={product?.name || "Product"}
          loading="lazy"
          onError={() => setFailedImage(image)}
          className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#174B38]">
          <ShoppingBag size={30} strokeWidth={1.5} />
          <span className="text-[10px]">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch the latest cart from the server.
  const fetchCart = useCallback(async () => {
    try {
      const response = await api.get("/cart");
      const items =
        response.data?.cart?.items ||
        response.data?.items ||
        response.data?.data?.cart?.items ||
        [];

      setCart(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to refresh your cart."
      );
    }
  }, []);

  // Initial cart loading.
  useEffect(() => {
    let isActive = true;

    const loadCart = async () => {
      try {
        const response = await api.get("/cart");
        const items =
          response.data?.cart?.items ||
          response.data?.items ||
          response.data?.data?.cart?.items ||
          [];

        if (isActive) {
          setCart(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.response?.data?.message || "Unable to load your cart."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadCart();

    return () => {
      isActive = false;
    };
  }, []);

  // Update product quantity.
  const updateQuantity = async (productId, quantity) => {
    if (!productId || quantity < 1 || updatingId) return;

    try {
      setUpdatingId(productId);
      setError("");

      await api.patch("/cart/quantity", { productId, quantity });
      await fetchCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update quantity."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove product from cart.
  const removeItem = async (productId) => {
    if (!productId || updatingId) return;

    try {
      setUpdatingId(productId);
      setError("");

      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove product."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const validItems = cart.filter(
    (item) =>
      item.productId && typeof item.productId === "object"
  );

  const subtotal = validItems.reduce((total, item) => {
    const product = item.productId;
    return (
      total +
      (Number(product.price) || 0) *
        (Number(item.quantity) || 0)
    );
  }, 0);

  const totalItems = validItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F4EE] px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-32 rounded-full bg-[#DDE6DA]" />
          <div className="mt-4 h-9 w-64 rounded-xl bg-[#E5E8DF]" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-3xl bg-white p-5"
                >
                  <div className="size-32 rounded-2xl bg-[#E5E8DF]" />
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-4 w-1/2 rounded bg-[#E5E8DF]" />
                    <div className="h-4 w-1/4 rounded bg-[#E5E8DF]" />
                    <div className="h-9 w-28 rounded-xl bg-[#E5E8DF]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-72 rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F4EE] pb-24 text-[#252923] sm:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[#858A80]">
              <Link to="/" className="transition hover:text-[#174B38]">
                Home
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#174B38]">
                Shopping Cart
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#174B38] text-white shadow-lg shadow-[#174B38]/15">
                <ShoppingBag size={23} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Your Shopping Cart
                  <span className="text-[#174B38]">.</span>
                </h1>
                <p className="mt-1 text-sm text-[#777C72]">
                  Your selected finds, all in one place.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/products"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-[#DCE3D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#174B38] transition hover:border-[#174B38] hover:bg-[#EAF0E7]"
          >
            <ArrowLeft size={15} />
            Continue shopping
          </Link>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty cart */}
        {cart.length === 0 ? (
          <section className="relative overflow-hidden rounded-[28px] border border-[#E5E3D9] bg-white px-5 py-16 text-center shadow-[0_12px_40px_rgba(23,75,56,0.045)] sm:py-20">
            <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-[#EAF0E7] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-[#F5EEDF] blur-3xl" />

            <div className="relative mx-auto flex size-24 items-center justify-center rounded-[28px] bg-[#EAF0E7] text-[#174B38] shadow-inner">
              <ShoppingBag size={42} strokeWidth={1.4} />
            </div>

            <div className="relative mx-auto mt-7 max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F4EE] px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#6D806B]">
                <Sparkles size={12} />
                A LITTLE SPACE FOR SOMETHING SPECIAL
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Your cart is feeling light.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#777C72]">
                Explore the marketplace and discover products
                you'll love. Your next favourite find could be
                just around the corner.
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-6 py-3 text-sm font-semibold text-white! shadow-lg shadow-[#174B38]/15 transition hover:-translate-y-0.5 hover:bg-[#103729]"
              >
                Explore products
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E4E5DA] bg-white/75 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                  <Package size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#252923]">
                    Your selection
                  </p>
                  <p className="text-[10px] text-[#858A80]">
                    {cart.length} {cart.length === 1 ? "product" : "products"} · {totalItems} total items
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E7] px-3 py-1.5 text-[10px] font-semibold text-[#174B38]">
                <CheckCircle2 size={13} />
                Ready for checkout
              </span>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-3">
              {/* Cart products */}
              <section className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold">
                    Cart Items
                    <span className="ml-2 font-normal text-[#858A80]">
                      ({cart.length})
                    </span>
                  </h2>
                  <span className="text-[11px] font-medium text-[#858A80]">
                    Prices in INR
                  </span>
                </div>

                {cart.map((item, index) => {
                  const product = item.productId;

                  if (!product || typeof product !== "object") {
                    return (
                      <div
                        key={item._id || index}
                        className="rounded-2xl border border-[#E5E3D9] bg-white p-5 text-sm text-[#777C72]"
                      >
                        This cart item is unavailable. Please refresh
                        your cart.
                      </div>
                    );
                  }

                  const productId = product._id;
                  const quantity = Number(item.quantity) || 1;
                  const price = Number(product.price) || 0;
                  const stock = Number(product.stock) || 0;
                  const isUpdating = updatingId === productId;
                  const outOfStock = stock <= 0;
                  const quantityLimit = stock > 0 && quantity >= stock;

                  return (
                    <article
                      key={productId || item._id || index}
                      className={`group relative overflow-hidden rounded-3xl border border-[#E5E3D9] bg-white p-4 shadow-[0_5px_22px_rgba(23,75,56,0.025)] transition-all duration-300 hover:border-[#C8D8C8] hover:shadow-[0_12px_32px_rgba(23,75,56,0.07)] sm:p-5 ${
                        isUpdating ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                        <Link
                          to={`/products/${productId}`}
                          className="block w-full shrink-0 sm:w-auto"
                        >
                          <CartProductImage product={product} />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-full bg-[#F2F3EC] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#71806D]">
                                {product.category || "Product"}
                              </span>

                              <Link
                                to={`/products/${productId}`}
                                className="mt-2 block truncate text-base font-bold tracking-tight text-[#252923] transition hover:text-[#174B38] sm:text-lg"
                              >
                                {product.name}
                              </Link>

                              <p className="mt-1.5 text-sm font-bold text-[#174B38]">
                                {formatPrice(price)}
                              </p>

                              {product.storeId?.storeName && (
                                <p className="mt-1.5 text-xs text-[#858A80]">
                                  Sold by{" "}
                                  <span className="font-semibold text-[#596A59]">
                                    {product.storeId.storeName}
                                  </span>
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(productId)}
                              disabled={isUpdating || !productId}
                              aria-label={`Remove ${product.name}`}
                              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-[#9A9D93] transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                            <div>
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#858A80]">
                                Quantity
                              </p>

                              <div className="inline-flex h-10 items-center overflow-hidden rounded-xl border border-[#E2E5DB] bg-[#FAFAF6]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(productId, quantity - 1)
                                  }
                                  disabled={quantity <= 1 || isUpdating}
                                  aria-label="Decrease quantity"
                                  className="flex h-full w-10 items-center justify-center text-[#174B38] transition hover:bg-[#EAF0E7] disabled:opacity-30"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="min-w-9 text-center text-xs font-bold">
                                  {quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(productId, quantity + 1)
                                  }
                                  disabled={
                                    isUpdating || quantityLimit || outOfStock
                                  }
                                  aria-label="Increase quantity"
                                  className="flex h-full w-10 items-center justify-center text-[#174B38] transition hover:bg-[#EAF0E7] disabled:opacity-30"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              {outOfStock ? (
                                <p className="mt-2 text-[10px] font-semibold text-red-600">
                                  Out of stock
                                </p>
                              ) : quantityLimit ? (
                                <p className="mt-2 text-[10px] text-[#858A80]">
                                  Maximum available quantity
                                </p>
                              ) : (
                                <p className="mt-2 text-[10px] text-[#858A80]">
                                  {stock} available
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] font-medium text-[#858A80]">
                                Item total
                              </p>
                              <p className="mt-1 text-lg font-bold tracking-tight text-[#174B38]">
                                {formatPrice(price * quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-1 pt-2 text-xs font-bold text-[#174B38] transition hover:gap-3"
                >
                  <ArrowLeft size={14} />
                  Continue exploring products
                </Link>
              </section>

              {/* Order summary */}
              <aside className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl border border-[#E5E3D9] bg-white shadow-[0_12px_35px_rgba(23,75,56,0.055)]">
                  <div className="bg-[#174B38] px-5 py-5 text-white sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.16em] text-white/65">
                          YOUR ORDER
                        </p>
                        <h2 className="mt-1 text-lg font-bold">
                          Order Summary
                        </h2>
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                        <ShoppingBag size={21} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-[#777C72]">
                          Products ({cart.length})
                        </span>
                        <span className="font-semibold text-[#252923]">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-[#777C72]">
                          Total quantity
                        </span>
                        <span className="font-semibold text-[#252923]">
                          {totalItems}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-[#777C72]">Delivery</span>
                        <span className="text-right text-[11px] font-semibold text-[#174B38]">
                          Calculated at checkout
                        </span>
                      </div>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#DADDD2]" />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">
                        Subtotal
                      </span>
                      <span className="text-2xl font-bold tracking-tight text-[#174B38]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-[#858A80]">
                      Final delivery charges and applicable details
                      will be shown during checkout.
                    </p>

                    <Link
                      to="/checkout"
                      className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-bold text-white! shadow-lg shadow-[#174B38]/15 transition hover:-translate-y-0.5 hover:bg-[#103729] hover:shadow-xl"
                    >
                      Proceed to Checkout
                      <ArrowRight size={17} />
                    </Link>

                    <div className="mt-6 space-y-3 border-t border-[#EEECE5] pt-5">
                      <div className="flex items-center gap-2.5 text-xs text-[#777C72]">
                        <ShieldCheck
                          size={16}
                          className="shrink-0 text-[#174B38]"
                        />
                        Secure checkout experience
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#777C72]">
                        <Truck
                          size={16}
                          className="shrink-0 text-[#174B38]"
                        />
                        Delivery details at checkout
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#777C72]">
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-[#174B38]"
                        />
                        Independent sellers, one marketplace
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#777C72]">
                        <LockKeyhole
                          size={16}
                          className="shrink-0 text-[#174B38]"
                        />
                        Your checkout is protected
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-[#DCE5D9] bg-[#EAF0E7] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#174B38]">
                    <Leaf size={17} />
                    Shop thoughtfully
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#617363]">
                    Every order supports independent sellers on
                    MarketHub.
                  </p>
                </div>
              </aside>
            </div>

            {/* Mobile checkout bar */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E3D9] bg-white/95 p-3 shadow-[0_-8px_28px_rgba(23,75,56,0.09)] backdrop-blur-xl sm:hidden">
              <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[#858A80]">
                    Subtotal
                  </p>
                  <p className="text-lg font-bold text-[#174B38]">
                    {formatPrice(subtotal)}
                  </p>
                </div>

                <Link
                  to="/checkout"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-4 py-2 text-xs font-bold text-white! shadow-md shadow-[#174B38]/15 transition hover:bg-[#103729]"
                >
                  Checkout
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </>
        )}

        <footer className="mt-10 hidden items-center justify-center gap-2 text-[10px] font-medium tracking-wide text-[#9A9D93] sm:flex">
          <Leaf size={13} />
          MARKETPLACE MADE FOR BETTER SHOPPING EXPERIENCES
        </footer>
      </div>
    </main>
  );
}

export default Cart;
