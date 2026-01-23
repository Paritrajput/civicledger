"use client";

import { useState } from "react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { useNotification } from "@/Context/NotificationContext";

export default function Footer() {
  const [message, setMessage] = useState("");
  const { success, error } = useNotification();

  const handleSendMessage = () => {
    if (!message.trim()) {
      error("Please write a message");
      return;
    }
    success("Message sent successfully");
    setMessage("");
  };

  return (
    <footer className="relative text-white ">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#04070f] to-[#22043e]" />

      <div className="border-t border-gray-800 bg-[#14162d8a] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3 max-md:text-center">
            <h3 className="text-2xl font-bold">CivicLedger</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              A blockchain-powered public infrastructure platform ensuring
              transparency, accountability, and trust in public works.
            </p>
          </div>

          {/* Links */}
          <div className="max-md:hidden">
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { name: "Home", href: "/" },
                { name: "About", href: "/about-us" },
                { name: "Services", href: "/services" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-white transition">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Get in Touch</h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-[#0f1224] border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-3 rounded-xl bg-white text-black hover:bg-gray-200 transition"
              >
                <IoIosSend size={18} />
              </button>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-4 text-gray-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CivicLedger. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
