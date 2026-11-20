
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
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Package,
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

    setTimeout(() => {
      document
        .getElementById("seller-application")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
      title: "Your own storefront",
      description:
        "Build your brand and showcase your products in a dedicated store.",
      icon: Store,
    },
    {
      number: "02",
      title: "Reach more customers",
      description:
        "Make your products discoverable to people browsing MarketHub.",
      icon: TrendingUp,
    },
    {
      number: "03",
      title: "Grow at your pace",
      description:
        "Start with a few products and expand your business over time.",
      icon: Package,
    },
  ];

  const inputClass =
    "w-full min-w-0 bg-transparent! border-0! p-0! text-sm text-[#252923] outline-none! ring-0! shadow-none! placeholder:text-[#A0A39B] focus:bg-transparent! focus:border-0! focus:outline-none! focus:ring-0! focus:shadow-none!";

  const fieldWrapper =
    "flex min-h-13 items-center gap-3 rounded-xl border border-[#E7E4DB] bg-[#FCFBF8] px-4 transition focus-within:border-[#174B38]";

  return (
    <main className="overflow-hidden bg-[#F7F5EF] text-[#252923]">
      {/* HERO */}
      <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-20">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#E4EBE3]/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-[#E9E5D9]/70 blur-3xl" />

        <div className="container relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE5D9] bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.13em] text-[#174B38]">
              <Sparkles size={14} />
              YOUR BUSINESS, YOUR WAY
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight text-[#183A2D] sm:text-5xl lg:text-6xl">
                Good products deserve{" "}
                <span className="font-serif italic font-medium text-[#719078]">
                  a bigger stage.
                </span>
              </h1>

              <p className="max-w-lg text-base leading-8 text-[#73786F] sm:text-lg">
                Turn your ideas into a growing business. Create your store,
                showcase what you love, and take your first step with MarketHub.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleStartSelling}
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#174B38] px-7 py-3 text-sm font-semibold text-white! shadow-lg shadow-[#174B38]/15 transition hover:-translate-y-0.5 hover:bg-[#103729] focus:outline-none focus:ring-2 focus:ring-[#174B38] focus:ring-offset-2"
              >
                Start your seller journey
                <ArrowRight size={18} />
              </button>

              <span className="inline-flex items-center gap-2 px-2 text-sm text-[#73786F]">
                <LockKeyhole size={15} />
                Simple application process
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[#E5E2D9] pt-6 text-sm font-medium text-[#456B50]">
              <span className="inline-flex items-center gap-2">
                <CircleCheck size={17} />
                Your own storefront
              </span>
              <span className="inline-flex items-center gap-2">
                <CircleCheck size={17} />
                Easy to get started
              </span>
            </div>
          </motion.div>

          {/* HERO IMAGE */}
          <motion.div
            className="relative mx-auto w-full max-w-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            <div className="absolute -right-5 -top-5 size-32 rounded-3xl bg-[#DDE8DA] sm:-right-7 sm:-top-7" />

            <div className="relative aspect-4/5 overflow-hidden rounded-[28px] bg-[#E4EBE3] shadow-2xl shadow-[#183A2D]/10 sm:aspect-5/4">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85"
                alt="Beautifully arranged retail store"
                className="size-full object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-[#103729]/80 via-[#103729]/5 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur-md sm:inset-x-6 sm:bottom-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E4EBE3] text-[#174B38]">
                  <Store size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#829080]">
                    YOUR NEXT CHAPTER
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#183A2D] sm:text-base">
                    Made for your ambition.
                  </p>
                </div>
                <ArrowUpRight size={20} className="text-[#174B38]" />
              </div>
            </div>

            <div className="absolute -bottom-5 -left-2 flex max-w-xs items-center gap-3 rounded-2xl border border-[#E7E4DB] bg-white p-4 shadow-xl sm:-left-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E4EBE3] text-[#174B38]">
                <Leaf size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#183A2D]">
                  Start with an idea.
                </p>
                <p className="mt-1 text-xs text-[#73786F]">
                  Build something of your own.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="mx-auto mb-12 max-w-2xl space-y-4 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold tracking-[0.18em] text-[#719078]">
              WHY MARKETHUB
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[#183A2D] sm:text-4xl">
              A little space for a big idea.
            </h2>
            <p className="text-sm leading-7 text-[#73786F] sm:text-base">
              Everything starts with taking the first step. Here's what your
              seller journey can look like.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.article
                  key={benefit.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group rounded-3xl border border-[#E7E4DB] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9D8C8] hover:shadow-xl hover:shadow-[#183A2D]/5"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EAF0E7] text-[#174B38] transition group-hover:bg-[#174B38] group-hover:text-white">
                      <Icon size={22} />
                    </span>
                    <span className="text-sm font-bold tracking-widest text-[#B4B9AE]">
                      {benefit.number}
                    </span>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-[#183A2D]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-7 text-[#73786F]">
                    {benefit.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SELLER APPLICATION */}
      <AnimatePresence>
        {showForm && (
          <motion.section
            id="seller-application"
            className="scroll-mt-24 border-t border-[#E7E4DB] bg-white px-4 py-16 sm:px-6 sm:py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
          >
            <div className="container mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="space-y-6 lg:sticky lg:top-28">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF0E7] px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#174B38]">
                  <Leaf size={14} />
                  LET'S GET STARTED
                </span>

                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#183A2D] sm:text-4xl">
                    Tell us about your{" "}
                    <span className="font-serif italic text-[#719078]">
                      store.
                    </span>
                  </h2>
                  <p className="max-w-md text-sm leading-8 text-[#73786F] sm:text-base">
                    Share a few details about your business. Once submitted,
                    your application can be reviewed by the MarketHub team.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-[#E7E4DB] bg-[#F7F5EF] p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#174B38]">
                      <ShieldCheck size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#183A2D]">
                        Your details matter.
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[#73786F]">
                        We use your information to process your seller
                        application.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t border-[#E5E2D9] pt-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#174B38]">
                      <LockKeyhole size={19} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#183A2D]">
                        Secure submission
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[#73786F]">
                        Your application is submitted through your
                        authenticated account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#73786F]">
                  <CheckCircle2 size={17} className="text-[#719078]" />
                  Three simple details to get started
                </div>
              </div>

              {/* FORM CARD */}
              <motion.form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-3xl border border-[#E7E4DB] bg-white shadow-xl shadow-[#183A2D]/5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div className="flex items-center gap-4 border-b border-[#E7E4DB] bg-[#FCFBF8] p-5 sm:p-7">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E4EBE3] text-[#174B38]">
                    <Store size={23} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[#183A2D]">
                      Seller application
                    </h3>
                    <p className="mt-1 text-xs text-[#858A80]">
                      Complete all fields to submit your request.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    aria-label="Close application form"
                    className="flex size-9 items-center justify-center rounded-xl text-[#73786F] transition hover:bg-[#EAEDE6] hover:text-[#174B38]"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="space-y-6 p-5 sm:p-8">
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      role={isError ? "alert" : "status"}
                      className={
                        isError
                          ? "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                          : "flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                      }
                    >
                      {isError ? (
                        <XCircle size={19} className="shrink-0" />
                      ) : (
                        <CheckCircle2 size={19} className="shrink-0" />
                      )}
                      <span>{message}</span>
                    </motion.div>
                  )}

                  {/* STORE NAME */}
                  <div className="space-y-2">
                    <label
                      htmlFor="storeName"
                      className="text-sm font-semibold text-[#34483A]"
                    >
                      Store name <span className="text-red-500">*</span>
                    </label>

                    <div className={fieldWrapper}>
                      <Store size={18} className="shrink-0 text-[#829080]" />
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
                        className={inputClass}
                        required
                      />
                    </div>
                    <p className="text-xs text-[#999D95]">
                      Choose a name that represents your brand.
                    </p>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-semibold text-[#34483A]"
                    >
                      About your store{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us what products you plan to sell and what makes your store special..."
                      maxLength={500}
                      rows={5}
                      className="w-full resize-y rounded-xl border border-[#E7E4DB] bg-[#FCFBF8] p-4 text-sm leading-7 text-[#252923] outline-none transition placeholder:text-[#A0A39B] focus:border-[#174B38] focus:ring-0"
                      required
                    />

                    <div className="flex justify-between gap-3 text-xs text-[#999D95]">
                      <span>Describe your products or business.</span>
                      <span className="shrink-0 tabular-nums">
                        {formData.description.length}/500
                      </span>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-semibold text-[#34483A]"
                    >
                      Contact number{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className={fieldWrapper}>
                      <Phone size={18} className="shrink-0 text-[#829080]" />
                      <span className="border-r border-[#E7E4DB] pr-3 text-sm text-[#73786F]">
                        +91
                      </span>
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
                        className={inputClass}
                        required
                      />
                    </div>
                    <p className="text-xs text-[#999D95]">
                      Enter your 10-digit Indian mobile number.
                    </p>
                  </div>

                  <div className="border-t border-[#E7E4DB] pt-6">
                    <button
                      className="inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! shadow-lg shadow-[#174B38]/10 transition hover:-translate-y-0.5 hover:bg-[#103729] focus:outline-none focus:ring-2 focus:ring-[#174B38] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Submitting application..." : "Submit application"}
                      {!loading && <ArrowRight size={18} />}
                    </button>

                    <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#858A80]">
                      <LockKeyhole size={13} />
                      Your application details are submitted securely.
                    </p>
                  </div>
                </div>
              </motion.form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* BOTTOM CTA */}
      {!showForm && (
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="container mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-[#123D2E] px-6 py-12 sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-5 -top-14 size-56 rounded-full border border-white/10" />

              <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-xl space-y-3">
                  <span className="text-xs font-bold tracking-[0.18em] text-[#C3D8BD]">
                    YOUR NEXT CHAPTER STARTS HERE
                  </span>
                  <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    Ready to build something of your own?
                  </h2>
                  <p className="text-sm leading-7 text-white/70">
                    Take the first step towards creating your own MarketHub
                    store.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartSelling}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#DCE9D6] px-6 py-3 text-sm font-semibold text-[#123D2E] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Get started
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default BecomeSeller;
