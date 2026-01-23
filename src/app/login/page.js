"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const LoginPortals = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-linear-to-t from-[#22043e] to-[#04070f] text-white px-4 py-6">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Select Your Role
        </h1>
        <p className="text-gray-400 text-lg">
          Choose your login portal to continue
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl flex flex-col sm:flex-row gap-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex-1">
          <Link
            href="/authenticate/contractor/login"
            className="block h-full"
          >
            <div className="h-full flex flex-col items-center justify-center p-8 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 text-white rounded-2xl cursor-pointer hover:bg-[#1a1d3a] hover:border-gray-600 transition duration-300 shadow-xl hover:shadow-2xl group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform duration-300">
                👷
              </div>
              <h2 className="text-xl font-bold mb-2">Contractor</h2>
              <p className="text-gray-400 text-sm">Bid on contracts</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="flex-1">
          <Link
            href="/authenticate/public-auth/login"
            className="block h-full"
          >
            <div className="h-full flex flex-col items-center justify-center p-8 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 text-white rounded-2xl cursor-pointer hover:bg-[#1a1d3a] hover:border-gray-600 transition duration-300 shadow-xl hover:shadow-2xl group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform duration-300">
                👥
              </div>
              <h2 className="text-xl font-bold mb-2">Public</h2>
              <p className="text-gray-400 text-sm">Report public issues</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="w-full max-w-4xl mt-6 relative z-10"
      >
        <Link
          href="/authenticate/gov-auth/login"
          className="block"
        >
          <div className="flex flex-col items-center justify-center p-8 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 text-white rounded-2xl cursor-pointer hover:bg-[#1a1d3a] hover:border-gray-600 transition duration-300 shadow-xl hover:shadow-2xl group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition transform duration-300">
              🏛️
            </div>
            <h2 className="text-xl font-bold mb-2">Government</h2>
            <p className="text-gray-400 text-sm">Manage tenders & contracts</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default LoginPortals;
