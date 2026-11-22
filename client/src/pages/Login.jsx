
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
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { token, user } = response.data;

      login(token, user);

      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#F5F4EE] px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E6E5DA] bg-white shadow-[0_24px_80px_rgba(23,75,56,0.10)] lg:min-h-155 lg:grid-cols-[0.95fr_1.05fr]"
      >
        {/* Left branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#173F31] p-9 text-white lg:flex xl:p-12">
          <div className="absolute -right-28 -top-28 size-80 rounded-full border-42 border-white/4.5" />
          <div className="absolute -bottom-36 -left-28 size-96 rounded-full bg-[#315A43]/50 blur-3xl" />
          <div className="absolute bottom-20 right-0 size-48 rounded-full bg-[#78916C]/15 blur-3xl" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex size-11 items-center justify-center rounded-[13px] bg-white text-[#174B38]">
                <Leaf size={23} strokeWidth={1.8} />
              </span>

              <span className="text-xl font-bold tracking-tight">
                MarketHub
              </span>
            </Link>

            <div className="mt-24 max-w-sm">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#D8E5D3]">
                YOUR MARKETPLACE
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.18] tracking-tight xl:text-[46px]">
                Good things
                <br />
                are waiting
                <br />
                <span className="text-[#B9D0AF]">for you.</span>
              </h1>

              <p className="mt-6 text-sm leading-7 text-white/65">
                Discover thoughtful finds, explore independent stores
                and enjoy a marketplace made for everyone.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="mb-6 h-px w-full bg-white/15" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/90">
                  One place. Endless discoveries.
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Welcome to the MarketHub community.
                </p>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07]">
                <ArrowRight size={19} className="text-[#C4D9BA]" />
              </div>
            </div>
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex flex-col justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          {/* Mobile brand */}
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#174B38] text-white">
              <Leaf size={21} />
            </span>

            <span className="text-xl font-bold tracking-tight text-[#174B38]">
              MarketHub
            </span>
          </Link>

          <div>
            <span className="inline-flex rounded-full bg-[#E8EEE5] px-3 py-1.5 text-[10px] font-bold tracking-[0.17em] text-[#174B38]">
              WELCOME BACK
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#252923] sm:text-[36px]">
              Sign in to your
              <br className="hidden sm:block" /> account.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#858A80]">
              Enter your details below to continue your MarketHub journey.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#30372F]"
              >
                Email address
              </label>

              <div className="group flex min-h-13.5 items-center gap-3 rounded-xl border border-[#E5E5DC] bg-[#FBFBF8] px-4 transition-all duration-200 focus-within:border-[#174B38] focus-within:bg-white">
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#92978E] transition-colors group-focus-within:text-[#174B38]"
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
                  className="m-0 min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 text-sm text-[#252923] shadow-none! outline-none! ring-0! placeholder:text-[#A2A69D] focus:border-0! focus:shadow-none! focus:outline-none! focus:ring-0!"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#30372F]"
                >
                  Password
                </label>
              </div>

            <div className="group flex min-h-13.5 items-center gap-3 rounded-xl border border-[#E5E5DC] bg-[#FBFBF8] px-4 transition-all duration-200 focus-within:border-[#174B38] focus-within:bg-white">
                <LockKeyhole
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-[#92978E] transition-colors group-focus-within:text-[#174B38]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="m-0 min-w-0 flex-1 appearance-none border-0! bg-transparent p-0 text-sm text-[#252923] shadow-none! outline-none! ring-0! placeholder:text-[#A2A69D] focus:border-0! focus:shadow-none! focus:outline-none! focus:ring-0!"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#858A80] transition hover:bg-[#E8EEE5] hover:text-[#174B38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174B38]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex min-h-13.5 w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! shadow-[0_5px_14px_rgba(23,75,56,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#103729] hover:shadow-[0_9px_22px_rgba(23,75,56,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174B38] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing you in..." : "Sign in to your account"}

              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-7 text-center text-sm text-[#858A80]">
            New to MarketHub?{" "}
            <Link
              to="/register"
              className="font-bold text-[#174B38] underline-offset-4 transition hover:underline"
            >
              Create an account
            </Link>
          </p>

          {/* Security footer */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-[#ECECE5] pt-6 text-xs text-[#92978E]">
            <LockKeyhole size={14} className="text-[#174B38]" />
            <span>Your account details stay secure.</span>
          </div>
        </section>
      </motion.div>
    </main>
  );
}

export default Login;
