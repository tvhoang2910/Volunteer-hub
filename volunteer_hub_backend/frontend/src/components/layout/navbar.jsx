'use client';

import { HiMenuAlt3 } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { BsPersonCircle } from "react-icons/bs";
import { FiSettings, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

// Animated Link Component with sliding underline
const NavLink = ({ href, children, isActive, isScrolled }) => {
  return (
    <Link href={href} className="relative group block">
      <span className={`relative z-10 transition-colors duration-300 font-medium ${isActive ? 'text-green-500' : 'text-gray-700 group-hover:text-green-500'
        } ${isScrolled ? 'text-sm' : 'text-base'}`}>
        {children}
      </span>
      {/* Sliding underline animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full origin-left"
        animate={{ scaleX: isActive ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </Link>
  );
};

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { scrollY } = useScroll();

  // Handle scroll with motion value for smoother detection
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Legacy scroll handler as fallback
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showDropdown = () => {
    setDropdown(!dropdown);
  };

  const handleLogout = () => {
    logout();
    setDropdown(false);
    router.push('/');
  };

  const handleLinkClick = () => {
    setDropdown(false);
  };

  // Mobile menu variants
  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const logoutOffsetClass = isScrolled ? 'top-20' : 'top-28';

  return (
    <>
    <motion.nav
      className="w-full flex items-center fixed top-0 z-50"
      initial={false}
      animate={{
        height: isScrolled ? 64 : 96,
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 1)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{
        boxShadow: isScrolled
          ? "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)"
          : "0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div className="max-w-screen-xl mx-auto w-full px-4 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            animate={{
              scale: isScrolled ? 0.9 : 1,
            }}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                className="transition-all duration-300"
                width={isScrolled ? 64 : 81}
                height={isScrolled ? 64 : 81}
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <ul className={`flex items-center flex-1 justify-center max-lg:hidden ${isScrolled ? 'gap-x-8' : 'gap-x-12'
            }`}>
            <li>
              <NavLink
                href="/"
                isActive={router.pathname === '/'}
                isScrolled={isScrolled}
              >
                Trang chủ
              </NavLink>
            </li>
            <li>
              <NavLink
                href="/contact"
                isActive={router.pathname === '/contact'}
                isScrolled={isScrolled}
              >
                Liên hệ
              </NavLink>
            </li>
          </ul>

          {/* Right Section - Search & Auth */}
          <div className="flex items-center gap-3 max-lg:hidden">
            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl text-gray-600 hover:text-green-500 transition-colors duration-300"
              aria-label="Search"
            >
              <CiSearch size={22} />
            </motion.button>

            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full bg-gradient-to-br from-green-50 to-emerald-50 text-gray-700 flex items-center justify-center p-0 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-green-200 ${isScrolled ? 'w-9 h-9' : 'w-11 h-11'
                      }`}
                  >
                    <BsPersonCircle size={isScrolled ? 18 : 22} />
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-64 rounded-xl border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
                  <div className="grid gap-2">
                    <Link
                      href="/my-account"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                    >
                      <BsPersonCircle size={18} />
                      <span>Thông tin tài khoản</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                    >
                      <FiSettings size={18} />
                      <span>Cài đặt</span>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <FiLogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className="rounded-xl px-5 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-green-200"
                    >
                      Đăng nhập
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="rounded-xl px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-300"
                    >
                      Đăng ký
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={showDropdown}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-green-500 hover:bg-green-50 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {dropdown ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdClose size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiMenuAlt3 size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {dropdown && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="lg:hidden w-full overflow-hidden"
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                top: isScrolled ? 64 : 96,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="px-4 py-6">
                <ul className="flex flex-col gap-1">
                  <motion.li variants={mobileItemVariants}>
                    <Link
                      href="/"
                      onClick={handleLinkClick}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${router.pathname === '/'
                        ? 'text-green-500 bg-green-50'
                        : 'text-gray-700 hover:text-green-500 hover:bg-green-50'
                        }`}
                    >
                      Trang chủ
                    </Link>
                  </motion.li>
                  <motion.li variants={mobileItemVariants}>
                    <Link
                      href="/contact"
                      onClick={handleLinkClick}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${router.pathname === '/contact'
                        ? 'text-green-500 bg-green-50'
                        : 'text-gray-700 hover:text-green-500 hover:bg-green-50'
                        }`}
                    >
                      Liên hệ
                    </Link>
                  </motion.li>
                  <div className="border-t border-gray-200 my-2"></div>
                  {isAuthenticated ? (
                    <>
                      <motion.li variants={mobileItemVariants}>
                        <Link
                          href="/my-account"
                          onClick={handleLinkClick}
                          className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-green-500 hover:bg-green-50 transition-all duration-200"
                        >
                          Thông tin tài khoản
                        </Link>
                      </motion.li>
                      <motion.li variants={mobileItemVariants}>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <span className="flex items-center gap-2">
                            <FiLogOut size={18} />
                            Đăng xuất
                          </span>
                        </button>
                      </motion.li>
                    </>
                  ) : (
                    <>
                      <motion.li variants={mobileItemVariants}>
                        <Link
                          href="/login"
                          onClick={handleLinkClick}
                          className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-green-500 hover:bg-green-50 transition-all duration-200"
                        >
                          Đăng nhập
                        </Link>
                      </motion.li>
                      <motion.li variants={mobileItemVariants}>
                        <Link
                          href="/signup"
                          onClick={handleLinkClick}
                          className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-center"
                        >
                          Đăng ký
                        </Link>
                      </motion.li>
                    </>
                  )}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    </>
  );
}
