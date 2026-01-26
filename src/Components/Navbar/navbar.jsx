"use client";

import { useGovUser } from "@/Context/govUser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, setShowPopup } = useGovUser();
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about-us" },
    { label: "Services", href: "/our-services" },
  ];

  return (
    <nav className="sticky top-0 z-50">
      <div className="bg-[#14162d8a] backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          
          <Link
            href="/"
            className="text-2xl font-bold text-white tracking-wide"
          >
            CivicLedger
          </Link>

          <ul className="hidden md:flex items-center gap-8 text-gray-300">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-white transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <img
                src="/user-icon.png"
                alt="User"
                className="h-9 w-9 rounded-full cursor-pointer border border-gray-700 hover:border-gray-500 transition"
                onClick={() => setShowPopup(true)}
              />
            ) : (
              <Link
                href="/login"
                className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={26} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-linear-to-t from-[#22043e] to-[#04070f]" />

            <div className="relative h-full flex flex-col">
              
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                <h1 className="text-xl font-bold">CivicLedger</h1>
                <X
                  size={26}
                  className="cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                />
              </div>

              <div className="flex flex-col gap-6 px-6 py-10 text-lg text-gray-300">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-gray-800 pt-6">
                  {user ? (
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        setShowPopup(true);
                        setMenuOpen(false);
                      }}
                    >
                      <img
                        src="/user-icon.png"
                        alt="User"
                        className="h-9 w-9 rounded-full border border-gray-700"
                      />
                      <span>Profile</span>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="inline-block bg-white text-black px-4 py-2 rounded-xl font-semibold"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
