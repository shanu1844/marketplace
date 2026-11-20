import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, Heart } from "lucide-react";
import { motion } from "motion/react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const linkClass =
    "text-sm text-[#D8E5DD] transition-colors duration-200 hover:text-white focus:outline-none focus:text-white";

  return (
    <footer className="border-t border-white/10 bg-[#174B38] text-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-16">
        <motion.div
          className="flex flex-col items-start"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg text-xl font-bold tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-[#E4EBE3] focus:ring-offset-2 focus:ring-offset-[#174B38]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#E4EBE3]">
              <Leaf size={22} />
            </span>
            <span>
              Market<span className="text-[#D6E4D9]">Hub</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-6 text-[#D8E5DD]">
            Discover thoughtful finds from independent sellers. Good products,
            great people, all in one place.
          </p>

          <Link
            to="/products"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-0 py-2.5 text-sm font-semibold text-white! transition-colors duration-200 hover:text-[#E4EBE3]! focus:outline-none focus:ring-2 focus:ring-[#E4EBE3] focus:ring-offset-2 focus:ring-offset-[#174B38]"
          >
            Explore the collection <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        <nav aria-label="Explore links" className="flex flex-col items-start gap-3">
          <h3 className="mb-1 text-sm font-bold text-white">Explore</h3>
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/products" className={linkClass}>All Products</Link>
          <Link to="/become-seller" className={linkClass}>Become a Seller</Link>
        </nav>

        <nav aria-label="Help links" className="flex flex-col items-start gap-3">
          <h3 className="mb-1 text-sm font-bold text-white">We're here to help</h3>
          <Link to="/help" className={linkClass}>Help Center</Link>
          <Link to="/contact" className={linkClass}>Contact Us</Link>
          <Link to="/returns" className={linkClass}>Returns Policy</Link>
        </nav>

        <motion.div
          className="rounded-2xl border border-white/15 bg-white/6 p-5"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#E4EBE3]">
            <Heart size={18} />
          </span>
          <h3 className="text-base font-semibold text-white">
            Shop a little differently.
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#D8E5DD]">
            Every independent seller has a story. Find something that feels
            uniquely yours.
          </p>
        </motion.div>
      </div>

      <div className="border-t border-white/15 bg-black/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[#D8E5DD] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {currentYear} MarketHub. All rights reserved.</p>
          <span>Made for better discoveries.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
