
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import {
  ArrowUpRight,
  Leaf,
  Menu,
  X,
  UserRound,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  PackageCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore Products", path: "/products" },
  ];

  if (!isAuthenticated || user?.role === "buyer") {
    navLinks.push({
      label: "Become a Seller",
      path: "/become-seller",
    });
  }

  const renderLink = ({ label, path }) => (
    <Link
      key={path}
      to={path}
      onClick={closeMenu}
      aria-current={isActive(path) ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
        isActive(path)
          ? "bg-[#E4EBE3] text-[#174B38]"
          : "text-[#73786F] hover:bg-[#F1F0E9] hover:text-[#174B38]"
      }`}
    >
      {label}
    </Link>
  );

  const secondaryAction =
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#E7E4DB] bg-white px-3 py-2 text-[13px] font-medium text-[#174B38] transition-all duration-200 hover:border-[#174B38] hover:bg-[#E4EBE3]";

  const primaryAction =
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#174B38] px-4 py-2 text-[13px] font-semibold text-white! shadow-sm transition-all duration-200 hover:bg-[#103729]";

  const mobileLink =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#73786F] transition hover:bg-[#E4EBE3] hover:text-[#174B38]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7E4DB] bg-[#F7F5EF]/95 text-[#252923] backdrop-blur-xl">
      <nav
        className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4EBE3] text-[#174B38]">
            <Leaf size={20} strokeWidth={1.9} />
          </span>

          <span className="flex flex-col">
            <span className="text-[17px] font-bold leading-tight tracking-tight text-[#174B38]">
              Market<span className="text-[#73786F]">Hub</span>
            </span>
            <span className="mt-0.5 text-[8px] font-semibold tracking-[0.16em] text-[#73786F]">
              CURATED FOR YOU
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map(renderLink)}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center justify-end gap-2 lg:flex">
          {authLoading ? (
            <span className="px-3 py-2 text-xs text-[#73786F]">
              Loading...
            </span>
          ) : isAuthenticated ? (
            <>
              <Link to="/account" className={secondaryAction}>
                <UserRound size={15} />
                My Account
              </Link>

              {user?.role === "buyer" && (
                <>
                  <Link to="/cart" className={secondaryAction}>
                    <ShoppingCart size={15} />
                    Cart
                  </Link>

                  <Link to="/my-orders" className={secondaryAction}>
                    <PackageCheck size={15} />
                    My Orders
                  </Link>
                </>
              )}

              {user?.role === "seller" && (
                <>
                  <Link to="/seller/dashboard" className={secondaryAction}>
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>

                  <Link
                    to="/seller/return-requests"
                    className={secondaryAction}
                  >
                    Return Requests
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <Link to="/admin" className={secondaryAction}>
                  <LayoutDashboard size={15} />
                  Admin
                </Link>
              )}

              {(user?.role === "buyer" || user?.role === "seller") && (
                <Link
                  to="/seller/application-status"
                  className={secondaryAction}
                  title="My Seller Application"
                >
                  Seller Application
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className={secondaryAction}
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={secondaryAction}>
                Sign in
              </Link>

              <Link to="/register" className={primaryAction}>
                Get Started
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7E4DB] bg-white text-[#174B38] transition hover:bg-[#E4EBE3] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute left-0 right-0 top-full flex max-h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto border-b border-[#E7E4DB] bg-[#F7F5EF] p-4 shadow-lg lg:hidden"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {navLinks.map(renderLink)}

              {!authLoading && (
                isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className={mobileLink}
                      onClick={closeMenu}
                    >
                      <UserRound size={16} />
                      My Account
                    </Link>

                    {user?.role === "buyer" && (
                      <>
                        <Link to="/cart" className={mobileLink} onClick={closeMenu}>
                          <ShoppingCart size={16} />
                          Cart
                        </Link>

                        <Link to="/my-orders" className={mobileLink} onClick={closeMenu}>
                          <PackageCheck size={16} />
                          My Orders
                        </Link>
                      </>
                    )}

                    {(user?.role === "buyer" || user?.role === "seller") && (
                      <Link
                        to="/seller/application-status"
                        className={mobileLink}
                        onClick={closeMenu}
                      >
                        Seller Application
                      </Link>
                    )}

                    {user?.role === "seller" && (
                      <>
                        <Link to="/seller/dashboard" className={mobileLink} onClick={closeMenu}>
                          <LayoutDashboard size={16} />
                          Seller Dashboard
                        </Link>

                        <Link to="/seller/return-requests" className={mobileLink} onClick={closeMenu}>
                          Return Requests
                        </Link>
                      </>
                    )}

                    {user?.role === "admin" && (
                      <Link to="/admin" className={mobileLink} onClick={closeMenu}>
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${primaryAction} mt-1 w-full`}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/login"
                      className={`${secondaryAction} flex-1`}
                      onClick={closeMenu}
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      className={`${primaryAction} flex-1`}
                      onClick={closeMenu}
                    >
                      Get Started
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Navbar;
