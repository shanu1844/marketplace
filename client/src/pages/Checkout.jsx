
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import api from "../services/api";

// Load Razorpay Checkout SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const addressFields = [
  {
    name: "fullName",
    label: "Full name",
    placeholder: "Enter your full name",
    autoComplete: "name",
  },
  {
    name: "phone",
    label: "Phone number",
    placeholder: "Enter your phone number",
    autoComplete: "tel",
    type: "tel",
  },
  {
    name: "addressLine",
    label: "Street address",
    placeholder: "House no., street, area",
    autoComplete: "street-address",
    full: true,
  },
  {
    name: "city",
    label: "City",
    placeholder: "Enter city",
    autoComplete: "address-level2",
  },
  {
    name: "state",
    label: "State",
    placeholder: "Enter state",
    autoComplete: "address-level1",
  },
  {
    name: "pincode",
    label: "Pincode",
    placeholder: "6-digit pincode",
    autoComplete: "postal-code",
    type: "text",
  },
];

function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load cart
  useEffect(() => {
    let ignore = false;

    const loadCart = async () => {
      try {
        const response = await api.get("/cart");

        if (!ignore) {
          setCart(response.data?.cart?.items || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Unable to load your cart."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const subtotal = cart.reduce((total, item) => {
    return (
      total +
      (Number(item.productId?.price) || 0) * Number(item.quantity || 0)
    );
  }, 0);

  // COD order
  const placeCODOrder = async () => {
    const response = await api.post("/orders", {
      shippingAddress,
      paymentMethod: "COD",
    });

    setOrder(response.data?.order);
    setCart([]);
  };


// Razorpay payment
const placeRazorpayOrder = async () => {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded) {
    throw new Error("Unable to load Razorpay. Please try again.");
  }

  const response = await api.post("/orders/razorpay/create-order", {
    shippingAddress,
  });

  const {
    orderId,
    razorpayOrderId,
    amount,
    currency,
    key,
  } = response.data;

  if (!orderId || !razorpayOrderId || !amount || !key) {
    throw new Error("Invalid payment details received from server.");
  }

  // Prevent cancellation after successful payment verification.
  let paymentVerified = false;

  const options = {
    key,
    amount,
    currency: currency || "INR",
    name: "MarketHub",
    description: "Marketplace Order Payment",
    order_id: razorpayOrderId,

    prefill: {
      name: shippingAddress.fullName,
      contact: shippingAddress.phone,
    },

    theme: {
      color: "#174B38",
    },

    handler: async function (paymentResponse) {
      try {
        setPlacingOrder(true);
        setError("");

        const verifyResponse = await api.post(
          "/orders/razorpay/verify-payment",
          {
            orderId,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          }
        );

        // Mark payment as verified only after backend confirms it.
        paymentVerified = true;

        setOrder(verifyResponse.data?.order);
        setCart([]);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Payment verification failed. Please contact support."
        );
      } finally {
        setPlacingOrder(false);
      }
    },

    modal: {
      ondismiss: async function () {
        setPlacingOrder(false);

        // Do not cancel an already verified payment.
        if (paymentVerified) return;

        try {
          const cancelResponse = await api.post(
            "/orders/razorpay/cancel-order",
            { orderId }
          );

          setError(
            cancelResponse.data?.message ||
              "Payment window closed. Your order was cancelled."
          );
        } catch (cancelError) {
          setError(
            cancelError.response?.data?.message ||
              "Payment window closed, but payment status could not be confirmed. Please check your orders."
          );
        }
      },
    },
  };

  const razorpay = new window.Razorpay(options);

  razorpay.on("payment.failed", function (response) {
    setError(
      response.error?.description ||
        "Payment failed. Please try again."
    );

    setPlacingOrder(false);
  });

  razorpay.open();
};


  // Main checkout handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (placingOrder) return;

    setError("");
    setPlacingOrder(true);

    try {
      if (paymentMethod === "COD") {
        await placeCODOrder();
        setPlacingOrder(false);
        return;
      }

      await placeRazorpayOrder();
      // Keep loading active while the Razorpay popup is open.
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process your order."
      );

      setPlacingOrder(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#DCE5DA] border-t-[#174B38] rounded-full animate-spin mx-auto" />
          <p className="mt-5 text-sm font-medium text-[#73786F]">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  // Order success state
  if (order) {
    return (
      <section className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-[#E9E7DF] rounded-4xl p-7 sm:p-10 text-center shadow-[0_20px_60px_rgba(18,61,46,0.08)]">
          <div className="w-20 h-20 rounded-full bg-[#EAF1E8] flex items-center justify-center mx-auto">
            <CheckCircle size={42} className="text-[#174B38]" />
          </div>

          <p className="mt-7 text-xs font-bold tracking-[0.2em] uppercase text-[#758273]">
            Order confirmed
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#123D2E]">
            Thank you for your order!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777D74]">
            Your order has been placed successfully. You can track its progress
            from your orders page.
          </p>

          <div className="mt-8 rounded-2xl bg-[#F7F8F3] border border-[#E8EBE2] p-5 text-left space-y-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777D74]">Order ID</span>
              <span className="font-semibold text-[#123D2E] break-all text-right">
                {order._id}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777D74]">Total amount</span>
              <span className="font-bold text-[#174B38]">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777D74]">Payment method</span>
              <span className="font-semibold text-[#123D2E]">
                {order.paymentMethod === "RAZORPAY"
                  ? "Online Payment"
                  : "Cash on Delivery"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-[#777D74]">Payment status</span>
              <span className="font-semibold text-[#174B38]">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              to="/my-orders"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3.5 text-sm font-semibold text-white! hover:bg-[#103729] transition"
            >
              <PackageCheck size={17} />
              View my orders
            </Link>

            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-[#DDE4D9] bg-[#F3F5EF] px-5 py-3.5 text-sm font-semibold text-[#174B38] hover:bg-[#E8EDE5] transition"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <section className="min-h-[75vh] bg-[#F7F5EF] flex items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#E9EFE6] flex items-center justify-center mx-auto">
            <ShoppingBag size={34} className="text-[#174B38]" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-[#123D2E]">
            Your cart is waiting
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#777D74]">
            Looks like you haven't added anything to your cart yet. Discover
            something you'll love.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center justify-center mt-6 rounded-xl bg-[#174B38] px-7 py-3.5 text-sm font-semibold text-white! hover:bg-[#103729] transition"
          >
            Explore products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F7F5EF] px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#73786F] hover:text-[#174B38] transition"
          >
            <ArrowLeft size={16} />
            Back to cart
          </Link>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#899183]">
                Almost yours
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#123D2E]">
                Secure checkout
              </h1>
              <p className="mt-2 text-sm text-[#777D74]">
                Complete your delivery details and place your order.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#174B38] bg-[#E9EFE6] rounded-full px-4 py-2 w-fit">
              <LockKeyhole size={14} />
              Secure checkout
            </div>
          </div>
        </div>

        {/* Checkout progress */}
        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Cart", number: "01", complete: true },
            { label: "Checkout", number: "02", active: true },
            { label: "Confirmation", number: "03" },
          ].map((step) => (
            <div
              key={step.number}
              className={`rounded-xl border p-3 sm:p-4 ${
                step.active
                  ? "bg-[#174B38] border-[#174B38] text-white"
                  : step.complete
                    ? "bg-[#E9EFE6] border-[#DCE5D8] text-[#174B38]"
                    : "bg-white border-[#E9E7DF] text-[#A0A398]"
              }`}
            >
              <p className="text-[10px] sm:text-xs font-semibold opacity-70">
                STEP {step.number}
              </p>
              <p className="mt-1 text-xs sm:text-sm font-bold">{step.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Checkout form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery address */}
              <div className="bg-white border border-[#EAE8E0] rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(18,61,46,0.035)]">
                <div className="flex items-start gap-3 mb-7">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#EAF0E7] flex items-center justify-center">
                    <MapPin size={20} className="text-[#174B38]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#123D2E]">
                      Delivery address
                    </h2>
                    <p className="mt-1 text-xs text-[#858A80]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                  {addressFields.map((field) => (
                    <div
                      key={field.name}
                      className={field.full ? "sm:col-span-2" : ""}
                    >
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-semibold text-[#39483D] mb-2"
                      >
                        {field.label}
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <input
                        id={field.name}
                        type={field.type || "text"}
                        name={field.name}
                        value={shippingAddress[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        required
                        maxLength={
                          field.name === "phone"
                            ? 10
                            : field.name === "pincode"
                              ? 6
                              : undefined
                        }
                        pattern={
                          field.name === "phone"
                            ? "[0-9]{10}"
                            : field.name === "pincode"
                              ? "[0-9]{6}"
                              : undefined
                        }
                        className="w-full rounded-xl border border-[#E5E7DE] bg-[#FCFCF9] px-4 py-3.5 text-sm text-[#263A2D] placeholder:text-[#A5A99F] outline-none transition focus:border-[#174B38] focus:ring-3 focus:ring-[#174B38]/10"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border border-[#EAE8E0] rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(18,61,46,0.035)]">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#EAF0E7] flex items-center justify-center">
                    <CreditCard size={20} className="text-[#174B38]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#123D2E]">
                      Payment method
                    </h2>
                    <p className="mt-1 text-xs text-[#858A80]">
                      Choose how you'd like to pay.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-[#174B38] bg-[#F0F4ED] ring-1 ring-[#174B38]/10"
                        : "border-[#E7E8E0] hover:border-[#B8C7B8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 accent-[#174B38]"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#254332]">
                        Cash on Delivery
                      </p>
                      <p className="mt-1 text-xs text-[#858A80]">
                        Pay when your order arrives.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E2EBDD] px-3 py-1 text-[10px] font-bold text-[#174B38]">
                      COD
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                      paymentMethod === "RAZORPAY"
                        ? "border-[#174B38] bg-[#F0F4ED] ring-1 ring-[#174B38]/10"
                        : "border-[#E7E8E0] hover:border-[#B8C7B8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 accent-[#174B38]"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#254332]">
                        Pay Online
                      </p>
                      <p className="mt-1 text-xs text-[#858A80]">
                        Secure online payment through Razorpay.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E2EBDD] px-3 py-1 text-[10px] font-bold text-[#174B38]">
                      ONLINE
                    </span>
                  </label>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-[#858A80]">
                  <ShieldCheck size={15} className="text-[#548064]" />
                  Your payment details are processed securely.
                </div>
              </div>
            </div>

            {/* Right: Order summary */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 bg-white border border-[#EAE8E0] rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(18,61,46,0.045)]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#123D2E]">
                    Order summary
                  </h2>

                  <span className="text-xs font-semibold text-[#7B8277] bg-[#F1F3ED] px-3 py-1.5 rounded-full">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const product = item.productId;

                    if (!product) return null;

                    return (
                      <div
                        key={product._id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#334638] line-clamp-2">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-[#8A8F85]">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-[#174B38]">
                          {formatCurrency(
                            Number(product.price || 0) * item.quantity
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-dashed border-[#E3E5DC] my-5" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#777D74]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#334638]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#777D74]">
                    <span>Delivery</span>
                    <span className="font-semibold text-[#174B38]">
                      Calculated by server
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E6E8DF] mt-5 pt-5 flex items-center justify-between">
                  <span className="font-bold text-[#123D2E]">
                    Estimated total
                  </span>
                  <span className="text-xl font-bold text-[#174B38]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-[#969A91]">
                  Final amount is calculated and validated by the server.
                </p>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-4 text-sm font-bold text-white! shadow-lg shadow-[#174B38]/15 transition hover:bg-[#103729] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={16} />
                      {paymentMethod === "COD" ? "Place order" : "Pay now"}
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#858A80]">
                  <ShieldCheck size={14} />
                  Safe and secure checkout
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
