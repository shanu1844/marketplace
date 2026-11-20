
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  Store,
  CheckCircle2,
  MoveUpRight,
} from "lucide-react";

const benefits = [
  {
    icon: Leaf,
    title: "Thoughtfully selected",
    description:
      "Discover unique products and everyday essentials worth bringing home.",
  },
  {
    icon: ShieldCheck,
    title: "Shopping you can trust",
    description:
      "Enjoy a smooth shopping experience with secure and reliable checkout.",
  },
  {
    icon: Truck,
    title: "Convenience at every step",
    description:
      "Find what you love, place your order, and shop with ease.",
  },
];

const categories = [
  {
    name: "Fashion",
    description: "Style that speaks for you",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
    className: "md:col-span-2",
  },
  {
    name: "Lifestyle",
    description: "Make everyday beautiful",
    image:
      "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=700&q=85",
    className: "",
  },
  {
    name: "Everyday finds",
    description: "Little things, big joy",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=85",
    className: "",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Home() {
  return (
    <main className="overflow-hidden bg-[#F7F5EF] text-[#252923]">

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -left-40 top-10 size-125 rounded-full bg-[#E4EBE3]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 size-112.5 rounded-full bg-[#E8E5D9]/70 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-10">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative z-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDE5D9] bg-white/90 px-4 py-2 text-xs font-bold tracking-wide text-[#174B38] shadow-sm sm:text-sm">
              <Sparkles size={15} />
              A marketplace with a personal touch
            </span>

            <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-[#252923] sm:text-6xl lg:text-7xl">
              Discover more.
              <br />
              <span className="relative inline-block text-[#174B38]">
                Love every find.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 340 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8C88 1 226 1 337 7"
                    stroke="#A6B99D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-[#73786F] sm:text-lg">
              From everyday essentials to special discoveries, explore a
              marketplace where independent sellers bring something different
              to your shopping experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#174B38] px-7 py-3.5 text-sm font-bold text-white! shadow-lg shadow-[#174B38]/15 transition duration-300 hover:-translate-y-1 hover:bg-[#103729] focus:outline-none focus:ring-2 focus:ring-[#174B38] focus:ring-offset-2"
              >
                Explore marketplace
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/become-seller"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-[#D8DED5] bg-white px-6 py-3.5 text-sm font-bold text-[#174B38] transition duration-300 hover:-translate-y-1 hover:border-[#174B38] hover:bg-[#EAF0E7]"
              >
                Start selling
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-[#E7E4DB] pt-7">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#E4EBE3] text-[#174B38]">
                  <ShoppingBag size={17} />
                </span>
                <span className="text-xs font-semibold text-[#555C52]">
                  Discover products
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#E4EBE3] text-[#174B38]">
                  <Store size={17} />
                </span>
                <span className="text-xs font-semibold text-[#555C52]">
                  Support sellers
                </span>
              </div>
            </div>
          </motion.div>

          {/* HERO VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            <div className="absolute -right-6 -top-8 size-32 rounded-full border border-[#CCD9C8] sm:size-40" />
            <div className="absolute -bottom-10 -left-8 size-36 rounded-full bg-[#E4EBE3] blur-2xl" />

            <div className="relative overflow-hidden rounded-4xl border border-white bg-white p-2 shadow-[0_30px_90px_rgba(23,75,56,0.15)] sm:p-3">
              <div className="relative aspect-[4/4.3] overflow-hidden rounded-3xl bg-[#E4EBE3]">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=90"
                  alt="Beautiful modern shopping boutique"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#10291F]/75 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-white/80 sm:text-xs">
                    THE MARKETPLACE EDIT
                  </span>
                  <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">
                    Find your kind of wonderful.
                  </h2>
                  <Link
                    to="/products"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:gap-3"
                  >
                    Explore the collection
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
            </div>

            {/* FLOATING DISCOVERY CARD */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative mx-3 mt-4 flex items-center gap-3 rounded-2xl border border-[#E7E4DB] bg-white p-4 shadow-xl sm:absolute sm:-bottom-6 sm:-left-9 sm:mx-0 sm:mt-0 sm:max-w-xs sm:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E4EBE3] text-[#174B38]">
                <Heart size={21} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#252923]">
                  Your next favourite awaits
                </p>
                <p className="mt-1 text-xs text-[#73786F]">
                  Discover something worth loving.
                </p>
              </div>
              <Star
                size={18}
                className="ml-auto shrink-0 fill-[#D7A95B] text-[#D7A95B]"
              />
            </motion.div>

            <div className="absolute -right-3 top-8 hidden rounded-xl border border-white/80 bg-white/95 p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2 text-xs font-bold text-[#174B38]">
                <CheckCircle2 size={16} />
                Made for discovery
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTRO STRIP */}
      <section className="border-y border-[#E7E4DB] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              number: "01",
              title: "Explore freely",
              description: "Browse a world of interesting discoveries.",
            },
            {
              number: "02",
              title: "Find your favourite",
              description: "Discover products that fit your lifestyle.",
            },
            {
              number: "03",
              title: "Shop with ease",
              description: "Enjoy a convenient shopping experience.",
            },
          ].map((item) => (
            <div key={item.number} className="flex items-start gap-4">
              <span className="text-sm font-bold text-[#91A88B]">
                {item.number}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#252923]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#73786F]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY DISCOVERY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#66846B]">
              EXPLORE YOUR INTERESTS
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
              A little something for everyone.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#73786F] sm:text-base">
              Explore different styles, everyday essentials and thoughtful
              finds waiting to be discovered.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#174B38] transition hover:gap-3"
          >
            View all products
            <MoveUpRight size={17} />
          </Link>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl bg-[#E4EBE3] ${category.className}`}
            >
              <Link
                to="/products"
                className="relative block aspect-4/3 min-h-64"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#10291F]/85 via-[#10291F]/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 sm:p-7">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">
                      {category.description}
                    </p>
                  </div>

                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-[#174B38]">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-[#E7E4DB] bg-[#EFEEE7]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold tracking-[0.2em] text-[#66846B]">
              THE MARKETPLACE DIFFERENCE
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#252923] sm:text-4xl">
              More than just a place to shop.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#73786F] sm:text-base">
              A thoughtful experience designed around discovery, convenience
              and independent sellers.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.article
                  key={benefit.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group rounded-3xl border border-[#E5E3D9] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
                >
                  <span className="flex size-13 items-center justify-center rounded-2xl bg-[#E4EBE3] text-[#174B38] transition duration-300 group-hover:bg-[#174B38] group-hover:text-white">
                    <Icon size={23} />
                  </span>

                  <h3 className="mt-6 text-lg font-bold text-[#252923]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#73786F]">
                    {benefit.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SELLER SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-[#123D2E] px-6 py-12 shadow-[0_25px_70px_rgba(18,61,46,0.16)] sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-32 size-100 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-20 size-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 size-96 rounded-full bg-[#A6B99D]/10 blur-3xl" />

          <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-[#DCE9D7]">
                <Store size={15} />
                FOR INDEPENDENT SELLERS
              </span>

              <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Have something special to sell?
                <span className="block text-[#C5D7BC]">
                  Give it a place to shine.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Bring your products to MarketHub, connect with shoppers and
                start building your online business with confidence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/become-seller"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#C8DDBE] bg-[#C8DDBE] px-6 py-3 text-sm font-bold text-[#123D2E]! shadow-lg transition duration-300 hover:-translate-y-1 hover:border-white hover:bg-white"
                >
                  Become a seller
                  <ArrowUpRight size={18} />
                </Link>

                <Link
                  to="/products"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white! transition duration-300 hover:bg-white/20"
                >
                  Explore marketplace
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <div className="hidden md:flex">
              <div className="flex size-40 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#C8DDBE] shadow-2xl lg:size-52">
                <Store size={76} strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL DISCOVERY CTA */}
      <section className="border-t border-[#E7E4DB] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#66846B]">
              YOUR NEXT FIND AWAITS
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#252923] sm:text-3xl">
              Ready to discover something new?
            </h2>
            <p className="mt-2 text-sm text-[#73786F]">
              Your next favourite product could be just one click away.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#174B38] px-6 py-3 text-sm font-bold text-white! shadow-md transition duration-300 hover:-translate-y-1 hover:bg-[#103729]"
          >
            Start exploring
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
