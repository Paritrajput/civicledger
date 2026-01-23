"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

export default function VerifyEmail() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  // Get email from cookie
  useEffect(() => {
    const value = getCookie("verify_email");
    if (!value) {
      router.push("/authenticate/public-auth/signup");
    } else {
      setEmail(value);
    }
  }, [router]);

  // Countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.join("") }),
    });
    setLoading(false);

    if (res.ok) {
      document.cookie = "verify_email=; path=/; max-age=0";
      alert("Email verified successfully");
      router.push("/authenticate/public-auth/login");
    } else {
      alert("Invalid OTP");
    }
  };

  const resendOTP = async () => {
    setTimer(60);
    await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Verify your email</h2>

        <p className="text-gray-400 text-sm mb-6">
          Enter the 6-digit OTP sent to
          <br />
          <span className="text-white font-medium">{email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-[#0f1224] border border-gray-700 text-white focus:outline-none focus:border-gray-500 transition"
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={verifyOTP}
          disabled={otp.join("").length !== 6 || loading}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </motion.button>

        <div className="mt-4 text-sm text-gray-400">
          {timer > 0 ? (
            <span>Resend OTP in {timer}s</span>
          ) : (
            <button
              onClick={resendOTP}
              className="text-white underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
