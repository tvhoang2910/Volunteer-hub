// components/Hero.js
import { useEffect, useState } from "react";
import {
  MdUpgrade,
  MdEventSeat,
  MdShoppingBag,
  MdHotel,
  MdMiscellaneousServices,
} from "react-icons/md";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

// Floating icon component with animation
const FloatingIcon = ({ icon: Icon, delay, position }) => {
  return (
    <motion.div
      className={`absolute ${position} text-white/20 z-[15]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.2, 0.4, 0.2],
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <Icon className="w-8 h-8 lg:w-12 lg:h-12" />
    </motion.div>
  );
};

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen lg:h-screen bg-white overflow-hidden">
      {/* Video Background */}
      {/* <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(2px)' }}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video> */}

      {/* Gradient Overlay - Dark at top, transparent middle, dark at bottom */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 z-10"></div> */}
      {/* Background image on the right half */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-no-repeat bg-contain bg-right z-0"
        style={{
          backgroundImage: "url('/thumbnail.jpg')",
          backgroundSize: "70%"
        }}
      ></div>
      {/* Additional subtle gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-emerald-900/10 z-[11]"></div>

      {/* Floating Icons */}
      <FloatingIcon icon={MdEventSeat} delay={0} position="top-20 left-10 lg:top-32 lg:left-20" />
      <FloatingIcon icon={MdHotel} delay={0.5} position="top-40 right-16 lg:top-52 lg:right-32" />
      <FloatingIcon icon={MdShoppingBag} delay={1} position="bottom-40 left-20 lg:bottom-52 lg:left-32" />
      <FloatingIcon icon={MdMiscellaneousServices} delay={1.5} position="bottom-32 right-12 lg:bottom-40 lg:right-24" />
      <FloatingIcon icon={MdUpgrade} delay={2} position="top-1/2 left-8 lg:top-1/2 lg:left-16" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 lg:px-12 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto w-full items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="flex flex-col"
          >
            {/* Subtitle - "Hãy cùng chung tay" */}
            <motion.p
              variants={itemVariants}
              className="text-sm lg:text-lg text-gray-300 font-medium tracking-wider uppercase mb-4 lg:mb-6"
            >
              Hãy cùng chung tay
            </motion.p>

            {/* Main Heading with Gradient */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Hành trình giúp đỡ
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={itemVariants}
              className="text-lg lg:text-xl text-gray-300 mb-12 lg:mb-16 font-light leading-relaxed"
            >
              🌱 Chung tay hôm nay, vì ngày mai tốt đẹp hơn
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6"
            >
              {/* Primary Button - Gradient with Glow */}
              <Link href={isAuthenticated ? "/user/dashboard" : "/login"}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Button
                    className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
                      text-white text-base lg:text-lg font-semibold px-8 lg:px-12 py-4 lg:py-6 rounded-2xl
                      shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300
                      border-2 border-transparent hover:border-green-300/50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Tham gia ngay
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                    {/* Glow effect */}
                    <span className="absolute inset-0 bg-green-400/30 blur-xl opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300"></span>
                  </Button>
                </motion.div>
              </Link>

              {/* Secondary Button - Outline with Glassmorphism */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    const element = document.querySelector('[data-section="destination"]');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 
                    text-black text-base lg:text-lg font-semibold px-8 lg:px-12 py-4 lg:py-6 rounded-2xl
                    hover:bg-white/20 hover:border-white/50 transition-all duration-300
                    shadow-lg shadow-black/20"
                >
                  <span className="relative z-10">Khám phá thêm</span>
                  {/* Subtle shimmer */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    -translate-x-full hover:translate-x-full transition-transform duration-700"></span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="hidden lg:flex justify-center items-center"
          >

          </motion.div>
        </div>

        {/* Decorative Scroll Indicator - Positioned at bottom */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-1 text-white/60"
          >
            <span className="text-xs lg:text-sm font-light tracking-wider">Khám phá</span>
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade gradient */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-30"></div> */}
    </section>
  );
}