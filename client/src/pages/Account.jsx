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
  Sparkles,
  CircleCheck,
  ArrowRight,
  Star,
  Fingerprint,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Account() {
  const { user } = useAuth();

  const role = user?.role || "buyer";
  const displayName = user?.name || "MarketHub Member";
  const email = user?.email || "No email available";

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  const accountLinks = [
    {
      title: "Explore Products",
      description:
        "Discover fresh collections and find your next favourite product.",
      icon: <ShoppingBag size={25} strokeWidth={1.7} />,
      path: "/products",
      label: "Start shopping",
      number: "01",
      accent: "bg-[#E8F0E7]",
      iconColor: "text-[#174B38]",
    },
    ...(role === "seller"
      ? [
          {
            title: "Seller Dashboard",
            description: "Manage your store, products and seller activities.",
            icon: <LayoutDashboard size={25} strokeWidth={1.7} />,
            path: "/seller/dashboard",
            label: "Open dashboard",
            number: "02",
            accent: "bg-[#F5EEDF]",
            iconColor: "text-[#92713A]",
          },
        ]
      : role === "buyer"
        ? [
            {
              title: "Become a Seller",
              description:
                "Start your own store and turn your products into a business.",
              icon: <Store size={25} strokeWidth={1.7} />,
              path: "/become-seller",
              label: "Start selling",
              number: "02",
              accent: "bg-[#EDEAF5]",
              iconColor: "text-[#71618F]",
            },
          ]
        : []),
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F4EE] pb-14 text-[#252923]">
      {/* Background Decoration */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035]">
        <div className="absolute -left-32 top-40 size-96 rounded-full border border-[#174B38]" />
        <div className="absolute -right-40 top-80 size-125 rounded-full border border-[#174B38]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-9 px-4 pt-8 sm:px-6 sm:pt-12">
        {/* Heading */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9E3D5] bg-[#EAF0E7] px-3.5 py-2 text-[10px] font-bold tracking-[0.16em] text-[#174B38]">
              <Leaf size={14} />
              YOUR PERSONAL SPACE
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Account<span className="text-[#174B38]">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777C72]">
              Your personal space to manage your profile and discover your
              MarketHub experience.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-[#E3E3D9] bg-white px-4 py-3 shadow-sm">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#39835B] opacity-50" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#39835B]" />
            </span>
            <span className="text-xs font-semibold text-[#174B38]">
              Account Active
            </span>
          </div>
        </motion.header>

        {/* Premium Profile Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative isolate overflow-hidden rounded-[28px] bg-[#123D2E] text-white shadow-[0_22px_55px_rgba(18,61,46,0.18)]"
        >
          {/* Decorative Shapes */}
          <div className="pointer-events-none absolute -right-20 -top-40 -z-10 size-105 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-24 -z-10 size-75 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-80 rounded-full bg-[#6F9874]/20 blur-3xl" />
          <div className="pointer-events-none absolute right-12 top-10 -z-10 size-32 rounded-full bg-[#A5C2A0]/10 blur-2xl" />

          <div className="relative p-6 sm:p-9 lg:p-11">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              {/* Profile */}
              <div className="flex min-w-0 items-center gap-5 sm:gap-6">
                <div className="relative flex size-20.5 shrink-0 items-center justify-center rounded-[26px] border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-md sm:size-28 sm:rounded-4xl">
                  <UserRound
                    size={45}
                    strokeWidth={1.4}
                    className="text-[#F1F4E9] sm:size-14.5"
                  />

                  <span className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-xl border-[3px] border-[#123D2E] bg-[#A8C49F] text-[#123D2E]">
                    <CircleCheck size={15} />
                  </span>
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#B6CDB7]">
                      WELCOME TO MARKETHUB
                    </span>
                    <Sparkles size={14} className="text-[#D4C18D]" />
                  </div>

                  <h2 className="wrap-break-word text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {displayName}
                  </h2>

                  <p className="break-all text-sm text-[#D1DDD2]/75">{email}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <ShieldCheck size={13} />
                      Verified Account
                    </span>

                    <span className="rounded-full border border-[#D6C18C]/30 bg-[#D6C18C]/15 px-3 py-1.5 text-[10px] font-semibold text-[#E9D8AA]">
                      {formattedRole} Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Badge */}
              <div className="hidden shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-center backdrop-blur-md sm:flex">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#D6C18C]/15 text-[#E9D8AA]">
                  <Star size={23} />
                </div>
                <p className="text-xs font-bold">MarketHub</p>
                <p className="text-[10px] text-white/55">Member Account</p>
              </div>
            </div>

            {/* Bottom Information */}
            <div className="mt-9 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 sm:mt-10 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#C4D7C3]">
                  <Fingerprint size={19} />
                </div>
                <div>
                  <p className="text-[10px] text-white/55">ACCOUNT STATUS</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Registered
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#C4D7C3]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <p className="text-[10px] text-white/55">MEMBERSHIP</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formattedRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Account Information */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.17em] text-[#92968B]">
                PERSONAL INFORMATION
              </p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                Account Details
              </h2>
            </div>

            <span className="hidden rounded-lg bg-[#EAEDE5] px-3 py-2 text-[10px] font-semibold text-[#627461] sm:inline-flex">
              PROFILE OVERVIEW
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <motion.article
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-[#E5E3D9] bg-white p-5 shadow-[0_5px_20px_rgba(23,75,56,0.025)] transition-shadow hover:shadow-xl hover:shadow-[#174B38]/5"
            >
              <div className="absolute -right-5 -top-5 size-24 rounded-full bg-[#EAF0E7] opacity-70 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38]">
                    <UserRound size={21} />
                  </span>
                  <span className="text-[10px] font-bold text-[#B4B7AE]">
                    01
                  </span>
                </div>

                <p className="mt-6 text-xs font-medium text-[#92968B]">
                  Full Name
                </p>
                <p className="mt-1.5 wrap-break-word text-base font-bold text-[#252923]">
                  {displayName}
                </p>
              </div>
            </motion.article>

            {/* Email */}
            <motion.article
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-[#E5E3D9] bg-white p-5 shadow-[0_5px_20px_rgba(23,75,56,0.025)] transition-shadow hover:shadow-xl hover:shadow-[#174B38]/5"
            >
              <div className="absolute -right-5 -top-5 size-24 rounded-full bg-[#EDEAF5] opacity-70 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#EDEAF5] text-[#71618F]">
                    <Mail size={21} />
                  </span>
                  <span className="text-[10px] font-bold text-[#B4B7AE]">
                    02
                  </span>
                </div>

                <p className="mt-6 text-xs font-medium text-[#92968B]">
                  Email Address
                </p>
                <p className="mt-1.5 break-all text-sm font-bold text-[#252923]">
                  {email}
                </p>
              </div>
            </motion.article>

            {/* Role */}
            <motion.article
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-[#E5E3D9] bg-white p-5 shadow-[0_5px_20px_rgba(23,75,56,0.025)] transition-shadow hover:shadow-xl hover:shadow-[#174B38]/5 sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute -right-5 -top-5 size-24 rounded-full bg-[#F5EEDF] opacity-80 transition-transform duration-500 group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#F5EEDF] text-[#92713A]">
                    <ShieldCheck size={21} />
                  </span>
                  <span className="text-[10px] font-bold text-[#B4B7AE]">
                    03
                  </span>
                </div>

                <p className="mt-6 text-xs font-medium text-[#92968B]">
                  Account Type
                </p>
                <p className="mt-1.5 text-base font-bold text-[#252923]">
                  {formattedRole}
                </p>
              </div>
            </motion.article>
          </div>
        </section>

        {/* Quick Access */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.17em] text-[#92968B]">
                YOUR MARKETPLACE
              </p>

              <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                Quick Access
              </h2>

              <p className="mt-2 text-sm text-[#777C72]">
                Everything you need, just one click away.
              </p>
            </div>

            <div className="hidden size-11 items-center justify-center rounded-xl bg-[#EAF0E7] text-[#174B38] sm:flex">
              <ArrowRight size={20} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {accountLinks.map((item, index) => (
              <motion.article
                key={item.path}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-[22px] border border-[#E5E3D9] bg-white p-6 shadow-[0_6px_24px_rgba(23,75,56,0.035)] transition-all duration-300 hover:border-[#C8D8C8] hover:shadow-[0_18px_40px_rgba(23,75,56,0.09)] sm:p-7"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#F5F4EE] transition-transform duration-500 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex size-16 items-center justify-center rounded-[20px] ${item.accent} ${item.iconColor} transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110`}
                    >
                      {item.icon}
                    </div>

                    <span className="rounded-lg bg-[#F5F4EE] px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#92968B]">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold tracking-tight text-[#252923]">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#777C72]">
                    {item.description}
                  </p>

                  <div className="mt-7 border-t border-[#EEECE5] pt-5">
                    <Link
                      to={item.path}
                      className="inline-flex min-h-11 items-center gap-3 rounded-xl bg-[#174B38] px-5 py-3 text-sm font-semibold text-white! shadow-md shadow-[#174B38]/10 transition-all duration-300 hover:gap-5 hover:bg-[#103729] hover:shadow-lg"
                    >
                      {item.label}
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Bottom Brand Section */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E5E3D9] bg-white/70 px-5 py-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#174B38] text-white">
              <Leaf size={17} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#252923]">MarketHub</p>
              <p className="text-[10px] text-[#92968B]">
                Your marketplace, your experience.
              </p>
            </div>
          </div>

          <p className="text-[10px] font-medium tracking-wide text-[#92968B]">
            MADE FOR BETTER SHOPPING EXPERIENCES
          </p>
        </div>
      </div>
    </main>
  );
}

export default Account;
