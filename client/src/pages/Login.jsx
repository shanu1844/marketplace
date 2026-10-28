
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail } from "lucide-react";
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

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="auth-brand">
          <span className="auth-brand-icon">
            <Leaf size={23} strokeWidth={1.8} />
          </span>
          <span>MarketHub</span>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Good to see you again.</h1>
          <p>Sign in to discover products you'll love.</p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-with-icon">
              <Mail size={18} aria-hidden="true" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Signing you in..." : "Sign in to your account"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          New to MarketHub? <Link to="/register">Create an account</Link>
        </p>

        <div className="auth-trust-note">
          <LockKeyhole size={14} />
          <span>Your account details stay secure.</span>
        </div>
      </motion.section>
    </main>
  );
}

export default Login;
