import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import Link from "next/link";

// --- Styles & Variants ---
const bgGrid =
  "before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(40%_40%_at_30%_20%,rgba(16,185,129,0.1),rgba(16,185,129,0)_60%),radial-gradient(40%_40%_at_70%_60%,rgba(59,130,246,0.15),rgba(59,130,246,0)_60%)] after:absolute after:inset-0 after:-z-10 after:[background-image:linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px)] after:[background-size:24px_24px] after:opacity-20";

const glass =
  "relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-white/50";

const gradientBorder =
  "relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500";

const inputBase =
  "block w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:bg-white";

const buttonBase =
  "group inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 active:scale-[.98]";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const child = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.45 } },
};

// --- Helper Components ---

function useFormState() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  // Form submission handler
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setOk(true);
    e.target.reset();
    setTimeout(() => setOk(false), 3000);
  };
  return { loading, ok, submit };
}

const StarRating = () => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{
          scale: [0.9, 1, 0.95],
          opacity: 1,
        }}
        transition={{
          duration: 1.6,
          delay: 0.15 * i,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="text-yellow-400 drop-shadow-[0_1px_2px_rgba(251,191,36,.4)]"
      >
        <FaStar className="h-4 w-4" />
      </motion.span>
    ))}
  </div>
);

const ContactInfo = () => (
  <motion.div variants={stagger} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm mt-8">
    <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>

    <div className="space-y-5">
      <motion.div variants={child} className="flex items-start gap-4">
        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
          <FaMapMarkerAlt className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Address</h4>
          <p className="text-gray-600 text-sm mt-0.5">E3 Building, 144 Xuan Thuy, Cau Giay, Hanoi, Vietnam</p>
        </div>
      </motion.div>

      <motion.div variants={child} className="flex items-center gap-4">
        <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
          <FaPhoneAlt className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Phone</h4>
          <p className="text-gray-600 text-sm mt-0.5">+84 999 999 999</p>
        </div>
      </motion.div>

      <motion.div variants={child} className="flex items-center gap-4">
        <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
          <FaEnvelope className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Email</h4>
          <p className="text-gray-600 text-sm mt-0.5">contact@vnu.edu.vn</p>
        </div>
      </motion.div>
    </div>

    <div className="mt-8 pt-6 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Follow Us</h4>
      <div className="flex gap-4">
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white transition-all duration-300">
          <FaGithub className="w-5 h-5" />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
          <FaLinkedin className="w-5 h-5" />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-300">
          <FaFacebook className="w-5 h-5" />
        </a>
      </div>
    </div>
  </motion.div>
);

const Form = () => {
  const { loading, ok, submit } = useFormState();

  return (
    <motion.div variants={child} className={`${gradientBorder}`}>
      <div className={`${glass} p-6 sm:p-8 lg:p-10 h-full`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Send us a message
            </h3>
            <p className="mt-1.5 text-sm text-gray-600">
              We'll get back to you within 24 hours.
            </p>
          </div>
          <motion.div
            initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
            whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 sm:block"
          >
            <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Online Support
          </motion.div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700"> Name </label>
              <input id="name" name="name" placeholder="John Doe" className={inputBase} required />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700"> Email </label>
              <input id="email" name="email" type="email" placeholder="john@example.com" className={inputBase} required />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700"> Subject </label>
            <input id="subject" name="subject" placeholder="How can we help?" className={inputBase} required />
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700"> Message </label>
            <textarea id="message" name="message" rows={4} placeholder="Tell us more details..." className={`${inputBase} resize-y min-h-[120px]`} required />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`${buttonBase} ${shimmer} w-full`}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.293 4.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L17.586 12l-4.293-4.293a1 1 0 010-1.414z" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Success toast */}
        <motion.div
          initial={false}
          animate={ok ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          className="pointer-events-none absolute right-4 top-4 z-10"
        >
          <div className="rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 flex items-center gap-2">
            <span>Message sent successfully!</span>
            <span className="text-xl">✅</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
const TrangLienHe = () => {
  return (
    <section className={`relative ${bgGrid} min-h-screen py-16 sm:py-20 lg:py-28 overflow-hidden`}>
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl opacity-50 mix-blend-multiply"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl opacity-50 mix-blend-multiply"
        />
      </div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left Column: Heading + Contact Info */}
          <motion.div variants={stagger} className="flex flex-col h-full">
            <motion.div variants={child} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-emerald-500"></span>
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Contact Us</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
                Let's start a <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Conversation
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Have questions about volunteering or organizing an event? We're here to help you make a difference.
              </p>
            </motion.div>

            {/* Testimonial / Trust Indicator */}
            <motion.div variants={child} className="hidden lg:flex items-center gap-4 mb-10 bg-white/40 p-4 rounded-xl border border-white/50 backdrop-blur-sm max-w-md">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="Avatar" />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <StarRating />
                  <span className="text-xs font-bold text-gray-700 ml-1">5.0</span>
                </div>
                <p className="text-xs text-gray-500">Trusted by 50+ Communities</p>
              </div>
            </motion.div>

            <ContactInfo />
          </motion.div>

          {/* Right Column: Contact Form */}
          <div className="lg:pl-6">
            <Form />
          </div>

        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

export default TrangLienHe;

