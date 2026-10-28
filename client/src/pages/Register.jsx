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
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.section
        className="auth-card register-card"
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
          <span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Create your account.</h1>
          <p>Join our community and discover something special.</p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success" role="status">
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <div className="input-with-icon">
              <UserRound size={18} aria-hidden="true" />
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
              />
            </div>
          </div>

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
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="register-password-hint">
              Use at least 8 characters for your password.
            </p>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            <span>{loading ? "Creating your account..." : "Create account"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-trust-note">
          <ShieldCheck size={15} />
          <span>Your details are handled securely.</span>
        </div>
      </motion.section>
    </main>
  );
}

export default Register;