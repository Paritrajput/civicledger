"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

export default function PublicLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/public-sec/login", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        router.push("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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
        <h2 className="text-2xl font-bold text-center mb-2">Public Login</h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          Login to report and track public issues
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl transition"
          >
            Login
          </motion.button>
        </form>

        <div className="my-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#14162d8a] text-gray-400">Or</span>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <LoginWithGoogle />
        </div>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don't have an account?{" "}
          <a
            href="/authenticate/public-auth/signup"
            className="text-white hover:underline"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export function LoginWithGoogle() {
  const router = useRouter();
  const { data: session } = useSession();
  console.log(session?.user.jwt);
  useEffect(() => {
    if (session?.user?.jwt) {
      const userData = {
        token: session.user.jwt,
        id: session.user.id,
        name: session.user.username,
        email: session.user.email,
        role: session.user.role,
      };
      console.log("token:", session.user.jwt);
      const decoded = jwtDecode(session.user.jwt);

      console.log(decoded);
      localStorage.setItem("token", session.user.jwt); // ✅

      router.push("/");
    }
  }, [session]);

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-gray-700 text-white px-9 py-2 rounded-3xl my-3 justify-self-center border-2 border-gray-600"
    >
      Login with Google
    </button>
  );
}
