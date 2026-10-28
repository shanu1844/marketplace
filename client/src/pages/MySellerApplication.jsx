import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "motion/react";

import {

  ArrowLeft,

  ArrowRight,

  CalendarDays,

  CheckCircle2,

  Clock3,

  FileText,

  Leaf,

  Mail,

  RefreshCw,

  ShieldCheck,

  Store,

  XCircle,

} from "lucide-react";

import api from "../services/api";

const statusConfig = {

  pending: {

    label: "Pending review",

    title: "Your journey is taking shape.",

    description:

      "Your application has been received and is waiting for review by the MarketHub team.",

    icon: Clock3,

    className: "pending",

    step: 2,

  },

  approved: {

    label: "Approved",

    title: "Welcome to the seller community!",

    description:

      "Your seller application has been approved. You're ready to explore your next steps on MarketHub.",

    icon: CheckCircle2,

    className: "approved",

    step: 3,

  },

  rejected: {

    label: "Not approved",

    title: "Your application wasn't approved.",

    description:

      "Your current application was rejected. Please review any feedback available from the MarketHub team.",

    icon: XCircle,

    className: "rejected",

    step: 3,

  },

};

function formatDate(date) {

  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {

    return "Not available";

  }

  return parsedDate.toLocaleDateString("en-IN", {

    day: "numeric",

    month: "long",

    year: "numeric",

  });

}

function MySellerApplication() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  // Used by the Retry and Refresh buttons.
  const fetchApplication = async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const response = await api.get("/seller/my-application");
      const data = response.data?.application;
      setApplication(data || null);

      if (!data) {
        setError("The application details could not be found in the response.");
      }
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setApplication(null);
        setNotFound(true);
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your application. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load: this effect avoids synchronously setting loading to true.
  useEffect(() => {
    let isActive = true;

    const loadInitialApplication = async () => {
      try {
        const response = await api.get("/seller/my-application");
        if (!isActive) return;

        const data = response.data?.application;
        setApplication(data || null);

        if (!data) {
          setError("The application details could not be found in the response.");
        }
      } catch (requestError) {
        if (!isActive) return;

        if (requestError.response?.status === 404) {
          setApplication(null);
          setNotFound(true);
        } else {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your application. Please try again."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadInitialApplication();
    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {

    return (

      <main className="seller-status-page">

        <div className="container seller-status-container">

          <div className="seller-status-loading">

            <span className="seller-status-spinner" />

            <h2>Loading your application</h2>

            <p>Please wait while we retrieve your application details.</p>

          </div>

        </div>

      </main>

    );

  }

  if (notFound) {

    return (

      <main className="seller-status-page">

        <div className="container seller-status-container">

          <motion.section

            className="seller-status-empty"

            initial={{ opacity: 0, y: 16 }}

            animate={{ opacity: 1, y: 0 }}

          >

            <span className="seller-status-large-icon">

              <Store size={28} />

            </span>

            <span className="seller-status-eyebrow">YOUR SELLER JOURNEY</span>

            <h1>Your store story starts here.</h1>

            <p>

              You haven't submitted a seller application yet. Tell us about

              your store to take the first step.

            </p>

            <Link to="/become-seller" className="seller-status-primary-action">

              Apply to become a seller <ArrowRight size={17} />

            </Link>

            <Link to="/" className="seller-status-text-link">

              <ArrowLeft size={15} /> Back to home

            </Link>

          </motion.section>

        </div>

      </main>

    );

  }

  if (error) {

    return (

      <main className="seller-status-page">

        <div className="container seller-status-container">

          <section className="seller-status-empty">

            <span className="seller-status-large-icon seller-status-error-icon">

              <RefreshCw size={26} />

            </span>

            <span className="seller-status-eyebrow">SOMETHING WENT WRONG</span>

            <h1>We couldn't load your application.</h1>

            <p>{error}</p>

            <button

              type="button"

              className="seller-status-primary-action"

              onClick={fetchApplication}

            >

              Try again <RefreshCw size={16} />

            </button>

          </section>

        </div>

      </main>

    );

  }

  const status = String(application?.status || "").toLowerCase();

  const config = statusConfig[status] || {

    label: "Status unavailable",

    title: "Your application is on record.",

    description:

      "We couldn't identify the current status. Please check again later.",

    icon: FileText,

    className: "unknown",

    step: 1,

  };

  const StatusIcon = config.icon;

  return (

    <main className="seller-status-page">

      <div className="container seller-status-container">

        <motion.div

          className="seller-status-heading"

          initial={{ opacity: 0, y: 14 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.4 }}

        >

          <span className="seller-status-eyebrow">

            <Leaf size={15} /> YOUR SELLER SPACE

          </span>

          <h1>Application status<span>.</span></h1>

          <p>

            Keep track of your application and stay up to date with your

            seller journey.

          </p>

        </motion.div>

        <motion.section

          className={`seller-status-hero seller-status-${config.className}`}

          initial={{ opacity: 0, y: 18 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.45, delay: 0.08 }}

        >

          <div className="seller-status-hero-top">

            <span className="seller-status-hero-icon">

              <StatusIcon size={27} />

            </span>

            <span className={`seller-status-badge seller-badge-${config.className}`}>

              <span />

              {config.label}

            </span>

          </div>

          <span className="seller-status-eyebrow">APPLICATION UPDATE</span>

          <h2>{config.title}</h2>

          <p className="seller-status-description">{config.description}</p>

          <div className="seller-status-progress">

            <div className="seller-progress-step seller-progress-complete">

              <span><CheckCircle2 size={17} /></span>

              <p>Application submitted</p>

            </div>

            <div className="seller-progress-line">

              <span />

            </div>

            <div

              className={`seller-progress-step ${

                config.step >= 2 ? "seller-progress-complete" : ""

              }`}

            >

              <span>

                {config.step >= 2 ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}

              </span>

              <p>Under review</p>

            </div>

            <div className="seller-progress-line">

              <span className={config.step >= 3 ? "seller-progress-line-filled" : ""} />

            </div>

            <div

              className={`seller-progress-step ${

                status === "approved" ? "seller-progress-complete" : ""

              }`}

            >

              <span>

                {status === "approved" ? (

                  <CheckCircle2 size={17} />

                ) : status === "rejected" ? (

                  <XCircle size={17} />

                ) : (

                  <Store size={17} />

                )}

              </span>

              <p>{status === "rejected" ? "Decision made" : "Seller approval"}</p>

            </div>

          </div>

        </motion.section>

        <motion.section

          className="seller-status-details-card"

          initial={{ opacity: 0, y: 15 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.4, delay: 0.16 }}

        >

          <div className="seller-status-card-heading">

            <span className="seller-status-detail-icon">

              <FileText size={20} />

            </span>

            <div>

              <h2>Application details</h2>

              <p>Information submitted with your application.</p>

            </div>

          </div>

          <div className="seller-status-details-grid">

            <div className="seller-status-detail">

              <span><Store size={16} /> Store name</span>

              <strong>{application?.storeName || "Not available"}</strong>

            </div>

            <div className="seller-status-detail">

              <span><CalendarDays size={16} /> Submitted on</span>

              <strong>{formatDate(application?.createdAt)}</strong>

            </div>

            <div className="seller-status-detail">

              <span><FileText size={16} /> Store description</span>

              <strong className="seller-status-description-value">

                {application?.description || "No description provided"}

              </strong>

            </div>

            <div className="seller-status-detail">

              <span><Mail size={16} /> Contact number</span>

              <strong>{application?.phone || "Not available"}</strong>

            </div>

          </div>

        </motion.section>

        <section className="seller-status-next-steps">

          <div className="seller-status-next-icon">

            <ShieldCheck size={23} />

          </div>

          <div className="seller-status-next-copy">

            <h3>

              {status === "approved"

                ? "Ready for your next step?"

                : status === "rejected"

                  ? "Need more information?"

                  : "What happens next?"}

            </h3>

            <p>

              {status === "approved"

                ? "Head to your seller dashboard to explore your seller tools."

                : status === "rejected"

                  ? "If you need clarification about the decision, contact the MarketHub team through the available support channels."

                  : "Your application will be reviewed by the MarketHub team. Check this page again for the latest status."}

            </p>

          </div>

          {status === "approved" ? (

            <Link to="/seller/dashboard" className="seller-status-secondary-action">

              Open dashboard <ArrowRight size={16} />

            </Link>

          ) : status === "rejected" ? (

            <Link to="/" className="seller-status-secondary-action">

              Back to home <ArrowRight size={16} />

            </Link>

          ) : (

            <button

              type="button"

              className="seller-status-secondary-action"

              onClick={fetchApplication}

            >

              Refresh status <RefreshCw size={15} />

            </button>

          )}

        </section>

        <div className="seller-status-footer-link">

          <Link to="/"><ArrowLeft size={15} /> Back to home</Link>

        </div>

      </div>

    </main>

  );

}

export default MySellerApplication;
