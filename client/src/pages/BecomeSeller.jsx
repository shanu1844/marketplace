
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleCheck,
  Leaf,
  LockKeyhole,
  Phone,
  Store,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function BecomeSeller() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
  });

  const handleStartSelling = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (message) {
      setMessage("");
      setIsError(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await api.post("/seller/apply", formData);

      setMessage(
        response.data?.message ||
          "Your application has been submitted successfully."
      );

      setFormData({
        storeName: "",
        description: "",
        phone: "",
      });
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Unable to submit your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      number: "01",
      title: "Your own store",
      description:
        "Build your brand and present your products in your own space.",
    },
    {
      number: "02",
      title: "Reach more people",
      description:
        "Make your products discoverable to customers browsing MarketHub.",
    },
    {
      number: "03",
      title: "Grow at your pace",
      description:
        "Start small, build your catalogue, and develop your business over time.",
    },
  ];

  return (
    <main className="become-seller-page">
      <section className="seller-hero">
        <div className="seller-hero-inner container">
          <motion.div
            className="seller-hero-content"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span className="seller-eyebrow">
              <Leaf size={15} />
              YOUR BUSINESS, YOUR WAY
            </span>

            <h1>
              Good products deserve
              <span> a bigger stage.</span>
            </h1>

            <p className="seller-hero-description">
              Turn your ideas into a growing business. Create your store,
              showcase what you love, and take the first step with MarketHub.
            </p>

            <div className="seller-hero-actions">
              {!showForm ? (
                <button
                  type="button"
                  className="seller-primary-button"
                  onClick={handleStartSelling}
                >
                  Start your seller journey
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="seller-secondary-button"
                  onClick={() =>
                    document
                      .getElementById("seller-application")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  Continue your application
                  <ArrowRight size={17} />
                </button>
              )}

              <span className="seller-secure-note">
                <LockKeyhole size={14} />
                Simple application process
              </span>
            </div>

            <div className="seller-trust-points">
              <span>
                <CircleCheck size={16} />
                Your own storefront
              </span>
              <span>
                <CircleCheck size={16} />
                Easy to get started
              </span>
            </div>
          </motion.div>

          <motion.div
            className="seller-hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            <div className="seller-image-frame">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
                alt="Beautifully arranged retail store"
              />

              <div className="seller-image-shade" />

              <div className="seller-image-caption">
                <span className="seller-caption-icon">
                  <Store size={19} />
                </span>
                <div>
                  <span>YOUR NEXT CHAPTER</span>
                  <strong>Made for your ambition.</strong>
                </div>
                <ArrowUpRight size={19} />
              </div>
            </div>

            <div className="seller-floating-card">
              <span className="seller-floating-icon">
                <Leaf size={20} />
              </span>
              <div>
                <strong>Start with an idea.</strong>
                <p>Build something of your own.</p>
              </div>
            </div>

            <div className="seller-visual-decoration" />
          </motion.div>
        </div>
      </section>

      <section className="seller-benefits-section">
        <div className="container">
          <motion.div
            className="seller-section-heading"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <span className="seller-section-eyebrow">WHY MARKETHUB</span>
            <h2>A little space for a big idea.</h2>
            <p>
              Everything starts with taking the first step. Here's what your
              seller journey can look like.
            </p>
          </motion.div>

          <div className="seller-benefits-grid">
            {benefits.map((benefit, index) => (
              <motion.article
                className="seller-benefit-card"
                key={benefit.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <span className="seller-benefit-number">
                  {benefit.number}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.section
            id="seller-application"
            className="seller-application-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
          >
            <div className="container seller-application-layout">
              <div className="seller-application-copy">
                <span className="seller-section-eyebrow">
                  LET'S GET STARTED
                </span>
                <h2>Tell us about your store.</h2>
                <p>
                  Share a few details about your business. Once submitted,
                  your application can be reviewed by the MarketHub team.
                </p>

                <div className="seller-form-assurance">
                  <span>
                    <LockKeyhole size={17} />
                  </span>
                  <div>
                    <strong>Your details matter.</strong>
                    <p>
                      We use your information to process your seller
                      application.
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="seller-form"
                onSubmit={handleSubmit}
              >
                <div className="seller-form-heading">
                  <span className="seller-form-icon">
                    <Store size={22} />
                  </span>
                  <div>
                    <h3>Seller application</h3>
                    <p>All fields are required.</p>
                  </div>
                  <button
                    type="button"
                    className="seller-close-button"
                    onClick={() => setShowForm(false)}
                    aria-label="Close application form"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {message && (
                  <motion.div
                    className={
                      isError
                        ? "seller-form-message seller-message-error"
                        : "seller-form-message seller-message-success"
                    }
                    role={isError ? "alert" : "status"}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isError ? (
                      <XCircle size={19} />
                    ) : (
                      <CheckCircle2 size={19} />
                    )}
                    <span>{message}</span>
                  </motion.div>
                )}

                <div className="seller-form-group">
                  <label htmlFor="storeName">Store name</label>
                  <div className="seller-input-wrap">
                    <Store size={18} />
                    <input
                      id="storeName"
                      name="storeName"
                      type="text"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="e.g. Shanu Fashion Hub"
                      minLength={2}
                      maxLength={80}
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>

                <div className="seller-form-group">
                  <label htmlFor="description">About your store</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What products do you plan to sell?"
                    maxLength={500}
                    rows={4}
                    required
                  />
                  <span className="seller-character-count">
                    {formData.description.length}/500 characters
                  </span>
                </div>

                <div className="seller-form-group">
                  <label htmlFor="phone">Contact number</label>
                  <div className="seller-input-wrap">
                    <Phone size={18} />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      title="Enter a 10-digit phone number."
                      required
                    />
                  </div>
                </div>

                <button
                  className="seller-submit-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Submitting application..." : "Submit application"}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <p className="seller-form-footnote">
                  <LockKeyhole size={13} />
                  Your application details are submitted securely.
                </p>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export default BecomeSeller;
