"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function ContractorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    experienceYears: "",
    contractorRating: "0",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/contractor/signup", formData);
      if (res.data.success) {
        router.push("/authenticate/contractor/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-t from-[#22043e] to-[#04070f] text-white px-4">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Contractor Signup
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          Create your account to start bidding on contracts
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
          />

          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
          />

          <input
            type="text"
            name="experienceYears"
            placeholder="Years of Experience"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f1224] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl transition"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <a
            href="/authenticate/contractor/login"
            className="text-white hover:underline"
          >
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
