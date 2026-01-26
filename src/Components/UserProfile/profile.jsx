"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useGovUser } from "@/Context/govUser";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const router = useRouter();
  const { showPopup, setShowPopup, user, setUser } = useGovUser();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      if (session) await signOut({ redirect: false });
      localStorage.removeItem("token");
      setUser(null);
      setShowPopup(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPopup(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] max-w-sm rounded-2xl 
                       bg-[#14162d8a] backdrop-blur-xl 
                       border border-gray-800 shadow-2xl p-6"
          >
      
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>

            {user ? (
              <>
          
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 rounded-full 
                                  bg-gradient-to-br from-teal-400 to-purple-500 
                                  flex items-center justify-center text-2xl font-bold text-black">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <p className="mt-3 text-lg font-semibold text-white capitalize">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-400">{user.email}</p>

                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold 
                                   rounded-full bg-teal-500/20 text-teal-300">
                    {user.role}
                  </span>
                </div>

      
                <div className="space-y-2 text-sm text-gray-300">
                  {user.owner && (
                    <InfoBadge label="Owner Access" />
                  )}
                  {user.superOwner && (
                    <InfoBadge label="Super Owner" highlight />
                  )}
                </div>

            
                <button
                  onClick={handleLogout}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 
                             transition text-white font-semibold py-2 rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <p className="text-center text-gray-400">Not Logged In</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



function InfoBadge({ label, highlight }) {
  return (
    <div
      className={`text-center py-1 rounded-lg text-xs font-semibold ${
        highlight
          ? "bg-purple-500/20 text-purple-300"
          : "bg-gray-700/40 text-gray-300"
      }`}
    >
      {label}
    </div>
  );
}
