import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";

function Home() {
  const benefits = [
    {
      icon: <Leaf size={21} />,
      title: "Thoughtfully selected",
      description: "Discover products worth bringing home.",
    },
    {
      icon: <ShieldCheck size={21} />,
      title: "Shopping you can trust",
      description: "A smoother, safer shopping experience.",
    },
    {
      icon: <Truck size={21} />,
      title: "Made for convenience",
      description: "Find your next favourite in a few clicks.",
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero container">
        <motion.div
          className="home-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="home-eyebrow">
            <Sparkles size={15} />
            A marketplace with a personal touch
          </span>

          <h1>
            Find things
            <br />
            that feel <span>like you.</span>
          </h1>

          <p className="home-hero-description">
            Explore thoughtful finds from independent sellers.
            Discover everyday essentials and special little things
            you'll love to make your own.
          </p>

          <div className="home-hero-actions">
            <Link to="/products" className="home-primary-cta">
              Explore products <ArrowRight size={18} />
            </Link>
            <Link to="/become-seller" className="home-secondary-cta">
              Meet your next customers <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="home-social-proof">
            <div className="home-proof-icon">
              <Leaf size={18} />
            </div>
            <p>
              <strong>Discover something different.</strong>
              <span>Shop thoughtfully. Support independent sellers.</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          className="home-hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <div className="home-image-frame">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85"
              alt="Beautifully arranged modern shopping boutique"
            />
            <div className="home-image-overlay">
              <span>THE EVERYDAY EDIT</span>
              <p>Little finds. Lasting favourites.</p>
            </div>
          </div>

          <div className="home-floating-note">
            <span className="home-floating-icon">
              <Leaf size={19} />
            </span>
            <div>
              <strong>A more personal way to shop</strong>
              <span>Discover. Connect. Enjoy.</span>
            </div>
          </div>

          <div className="home-decorative-circle" />
        </motion.div>
      </section>

      <section className="home-benefits container">
        {benefits.map((benefit, index) => (
          <motion.article
            className="home-benefit"
            key={benefit.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.1 }}
          >
            <span className="home-benefit-icon">{benefit.icon}</span>
            <div>
              <h2>{benefit.title}</h2>
              <p>{benefit.description}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="home-discover">
        <div className="container home-discover-inner">
          <div>
            <span className="home-section-eyebrow">YOUR NEXT FIND AWAITS</span>
            <h2>Good things are just around the corner.</h2>
            <p>
              Take a look around and find something that belongs in your
              everyday life.
            </p>
          </div>
          <Link to="/products" className="home-discover-link">
            Browse all products <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;