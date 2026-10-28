
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Leaf,
  Menu,
  X,
  UserRound,
  LayoutDashboard,
  LogOut,

} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, authLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore Products", path: "/products" },
  ];

  if (!isAuthenticated || user?.role === "buyer") {
    navLinks.push({ label: "Become a Seller", path: "/become-seller" });
  }

  const renderLink = ({ label, path }) => (
    <Link
      key={path}
      to={path}
      onClick={closeMenu}
      className={`nav-link ${isActive(path) ? "nav-link-active" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-brand-icon">
            <Leaf size={23} strokeWidth={1.8} />
          </span>
          <span className="navbar-brand-text">
            Market<span>Hub</span>
            <small>CURATED FOR YOU</small>
          </span>
        </Link>

        <div className="navbar-links">{navLinks.map(renderLink)}</div>

        <div className="navbar-actions">
          {authLoading ? (
            <span className="navbar-loading">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link to="/account" className="nav-account">
                <UserRound size={17} />
                <span>My Account</span>
              </Link>

              {user?.role === "seller" && (
                <Link to="/seller/dashboard" className="nav-dashboard">
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>
              )}

              {user?.role === "admin" && (
                <Link to="/admin" className="nav-dashboard">
                  <LayoutDashboard size={17} />
                  Admin
                </Link>
              )}

              {(user?.role === "buyer" || user?.role === "seller") && (
                <Link
                  to="/seller/application-status"
                  className="nav-account nav-application"
                  title="My Seller Application"
                >
                  Seller Application
                </Link>
              )}

              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Sign in
              </Link>
              <Link to="/register" className="nav-register">
                Get Started <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {navLinks.map(renderLink)}

              {!authLoading &&
                (isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="nav-link"
                      onClick={closeMenu}
                    >
                      My Account
                    </Link>

                    {(user?.role === "buyer" || user?.role === "seller") && (
                      <Link
                        to="/seller/application-status"
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        My Seller Application
                      </Link>
                    )}

                    {user?.role === "seller" && (
                      <Link
                        to="/seller/dashboard"
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        Seller Dashboard
                      </Link>
                    )}

                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="nav-link"
                        onClick={closeMenu}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      className="mobile-menu-action"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </>
                ) : (
                  <div className="mobile-auth-actions">
                    <Link
                      to="/login"
                      className="nav-login"
                      onClick={closeMenu}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="nav-register"
                      onClick={closeMenu}
                    >
                      Get Started <ArrowUpRight size={16} />
                    </Link>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Navbar;
