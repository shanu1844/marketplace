
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Check,
  CircleCheck,
} from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: formData.password.length >= 8,
    },
    {
      label: "Contains a number",
      valid: /\d/.test(formData.password),
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(formData.password),
    },
  ];

  const passwordStrength = passwordChecks.filter(
    (check) => check.valid
  ).length;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Your account has been created successfully!");

      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

const inputClasses =
  "m-0 min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 text-sm text-[#252923] shadow-none! outline-none! ring-0! placeholder:text-[#a0a399] focus:border-0! focus:shadow-none! focus:outline-none! focus:ring-0! focus-visible:outline-none! focus-visible:ring-0!";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f5f4ee] px-4 py-7 sm:px-6 lg:px-10 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#e6e4da] bg-white shadow-[0_24px_80px_rgba(23,75,56,0.09)] lg:min-h-170 lg:grid-cols-[0.92fr_1.08fr]"
      >
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-[#123d2e] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -right-32 -top-28 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -right-20 -top-16 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#315b43]/40 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#174b38]">
                <Leaf size={25} strokeWidth={1.8} />
              </span>

              <span className="text-2xl font-bold tracking-tight">
                MarketHub
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-[#e3ede3]">
              <Sparkles size={14} />
              A marketplace made for discovery
            </span>

            <h1 className="mt-7 max-w-md text-4xl font-semibold leading-[1.18] tracking-tight xl:text-5xl">
              Good finds.
              <br />
              Great experiences.
              <br />
              <span className="text-[#c5d8bd]">
                One marketplace.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
              Discover products, explore independent stores and enjoy
              a simpler way to shop with MarketHub.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Explore products from different stores",
                "A convenient shopping experience",
                "Your own account and order history",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-white/85"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[#c5d8bd]">
                    <Check size={14} />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/50">
            <span>Discover something special.</span>
            <span>© MarketHub</span>
          </div>

          {/* Decorative shopping graphic */}
          <div className="absolute bottom-28 right-8 flex size-24 rotate-12 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 text-white/80 backdrop-blur-sm xl:right-12">
            <ShoppingBag size={40} strokeWidth={1.2} />
          </div>
        </section>

        {/* Registration form */}
        <section className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-11 lg:px-12 xl:px-16">
          {/* Mobile brand */}
          <Link
            to="/"
            className="mb-9 inline-flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#174b38] text-white">
              <Leaf size={21} />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#174b38]">
              MarketHub
            </span>
          </Link>

          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#eaf0e7] px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#174b38]">
              <Sparkles size={13} />
              CREATE YOUR ACCOUNT
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
              Join MarketHub.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#777c73]">
              Create your account and get started with a better
              marketplace experience.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span className="mt-0.5 font-bold">!</span>
              <p>{error}</p>
            </motion.div>
          )}

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CircleCheck size={18} className="mt-0.5 shrink-0" />
              <p>{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-[#30382f]"
              >
                Full name
              </label>

              <div className="group flex min-h-14 items-center gap-3 rounded-xl border border-[#e5e5dc] bg-[#fcfcf9] px-4 transition-all focus-within:border-[#174b38] focus-within:bg-white ">
                <UserRound
                  size={19}
                  className="shrink-0 text-[#92978e] transition group-focus-within:text-[#174b38]"
                />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={50}
                  autoComplete="name"
                  required
                  disabled={loading}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#30382f]"
              >
                Email address
              </label>

              <div className="group flex min-h-14 items-center gap-3 rounded-xl border border-[#e5e5dc] bg-[#fcfcf9] px-4 transition-all focus-within:border-[#174b38] focus-within:bg-white ">
                <Mail
                  size={19}
                  className="shrink-0 text-[#92978e] transition group-focus-within:text-[#174b38]"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#30382f]"
              >
                Create password
              </label>

              <div className="group flex min-h-14 items-center gap-3 rounded-xl border border-[#e5e5dc] bg-[#fcfcf9] px-4 transition-all focus-within:border-[#174b38] focus-within:bg-white ">
                <LockKeyhole
                  size={19}
                  className="shrink-0 text-[#92978e] transition group-focus-within:text-[#174b38]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className={inputClasses}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#858b80] transition hover:bg-[#eaf0e7] hover:text-[#174b38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174b38]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Password strength */}
              {formData.password.length > 0 && (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#777c73]">
                      Password strength
                    </span>
                    <span className="text-xs font-semibold text-[#174b38]">
                      {passwordStrength === 3
                        ? "Strong"
                        : passwordStrength === 2
                          ? "Good"
                          : passwordStrength === 1
                            ? "Getting started"
                            : "Weak"}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          passwordStrength >= level
                            ? "bg-[#174b38]"
                            : "bg-[#e8e9e1]"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {passwordChecks.map((check) => (
                      <p
                        key={check.label}
                        className={`flex items-center gap-2 text-xs ${
                          check.valid
                            ? "text-[#174b38]"
                            : "text-[#92978e]"
                        }`}
                      >
                        <Check size={13} />
                        {check.label}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {formData.password.length === 0 && (
                <p className="mt-2 text-xs text-[#92978e]">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#174b38] px-5 py-3 text-sm font-semibold text-white! shadow-[0_7px_18px_rgba(23,75,56,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#103a2b] hover:shadow-[0_10px_24px_rgba(23,75,56,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174b38] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating your account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-[#777c73]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#174b38] underline-offset-4 transition hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Security footer */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#ecebe3] pt-6 text-xs text-[#858b80]">
            <ShieldCheck size={16} className="text-[#174b38]" />
            Your details are handled securely.
          </div>
        </section>
      </motion.div>
    </main>
  );
}

export default Register;
