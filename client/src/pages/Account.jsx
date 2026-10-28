import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  ShoppingBag,
  LayoutDashboard,
  ArrowUpRight,
  Leaf,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Account() {
  const { user } = useAuth();

  const role = user?.role || "buyer";
  const displayName = user?.name || "MarketHub Member";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const accountLinks = [
    {
      title: "Explore products",
      description: "Discover your next favourite find.",
      icon: <ShoppingBag size={21} />,
      path: "/products",
      label: "Browse products",
    },
    ...(role === "seller"
      ? [
          {
            title: "Seller dashboard",
            description: "Manage your seller activities.",
            icon: <LayoutDashboard size={21} />,
            path: "/seller/dashboard",
            label: "Open dashboard",
          },
        ]
      : role === "buyer"
        ? [
            {
              title: "Become a seller",
              description: "Start sharing your products on MarketHub.",
              icon: <Store size={21} />,
              path: "/become-seller",
              label: "Learn more",
            },
          ]
        : []),
  ];

  return (
    <main className="account-page">
      <div className="container account-container">
        <motion.div
          className="account-heading"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="account-eyebrow">
            <Leaf size={15} /> YOUR PERSONAL SPACE
          </span>
          <h1>My account<span>.</span></h1>
          <p>Manage your details and find your way around MarketHub.</p>
        </motion.div>

        <motion.section
          className="account-profile-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <div className="account-profile-main">
            <div className="account-avatar" aria-hidden="true">
              {initials || <UserRound size={30} />}
            </div>
            <div className="account-profile-copy">
              <span className="account-profile-label">ACCOUNT OVERVIEW</span>
              <h2>{displayName}</h2>
              <p>{user?.email || "No email available"}</p>
            </div>
          </div>

          <span className="account-role-badge">
            <ShieldCheck size={15} />
            {role.charAt(0).toUpperCase() + role.slice(1)} account
          </span>
        </motion.section>

        <section className="account-details-section">
          <div className="account-section-heading">
            <div>
              <span className="account-section-label">YOUR INFORMATION</span>
              <h2>Account details</h2>
            </div>
          </div>

          <div className="account-details-grid">
            <article className="account-detail-card">
              <span className="account-detail-icon">
                <UserRound size={19} />
              </span>
              <div>
                <span>Full name</span>
                <strong>{displayName}</strong>
              </div>
            </article>

            <article className="account-detail-card">
              <span className="account-detail-icon">
                <Mail size={19} />
              </span>
              <div>
                <span>Email address</span>
                <strong className="account-email-value">
                  {user?.email || "Not available"}
                </strong>
              </div>
            </article>

            <article className="account-detail-card">
              <span className="account-detail-icon">
                <ShieldCheck size={19} />
              </span>
              <div>
                <span>Account type</span>
                <strong>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </strong>
              </div>
            </article>
          </div>
        </section>

        <section className="account-links-section">
          <div className="account-section-heading">
            <div>
              <span className="account-section-label">QUICK ACCESS</span>
              <h2>Where would you like to go?</h2>
            </div>
          </div>

          <div className="account-links-grid">
            {accountLinks.map((item, index) => (
              <motion.article
                className="account-link-card"
                key={item.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <span className="account-link-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={item.path} className="account-link-action">
                  {item.label} <ArrowUpRight size={16} />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Account;