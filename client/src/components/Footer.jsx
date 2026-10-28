
import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, Heart } from "lucide-react";
import { motion } from "motion/react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-main container">
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">
              <Leaf size={22} />
            </span>
            <span>
              Market<span>Hub</span>
            </span>
          </Link>

          <p className="footer-description">
            Discover thoughtful finds from independent sellers.
            Good products, great people, all in one place.
          </p>

          <Link to="/products" className="footer-explore">
            Explore the collection <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        <div className="footer-section">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/become-seller">Become a Seller</Link>
        </div>

        <div className="footer-section">
          <h3>We're here to help</h3>
          <Link to="/help">Help Center</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/returns">Returns Policy</Link>
        </div>

        <div className="footer-note">
          <span className="footer-note-icon">
            <Heart size={18} />
          </span>
          <h3>Shop a little differently.</h3>
          <p>
            Every independent seller has a story. Find something that feels
            uniquely yours.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {currentYear} MarketHub. All rights reserved.</p>
          <span>Made for better discoveries.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
