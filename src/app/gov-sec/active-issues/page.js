"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get("/api/public-issue");

        console.log(response.data);
        setIssues(response.data.issues);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchIssue();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:text-3xl text-2xl font-bold mb-6 text-center"
        >
          Reported Issues
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search issues by type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition"
          />
        </motion.div>
        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-[#14162d8a] backdrop-blur-xl p-5 rounded-2xl animate-pulse border border-gray-800"
              >
                <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-5/6"></div>
              </div>
            ))
          ) : issues.length > 0 ? (
            issues
              .filter((item) =>
                item.issue_type
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
              )
              .map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#14162d8a] backdrop-blur-xl md:p-5 p-3 rounded-2xl shadow-lg border border-gray-800 hover:border-gray-600 transition"
                >
                  <h2 className="text-xl font-semibold">{item.issue_type}</h2>
                  <p className="text-gray-300 mt-1 md:mt-2">
                    {item.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push(
                        `/gov-sec/issue-details?issue=${encodeURIComponent(JSON.stringify(item))}`,
                      )
                    }
                    className="mt-2 md:mt-4 bg-white text-black font-semibold px-6 py-2 rounded-xl hover:shadow-lg transition"
                  >
                    🔍 View Details
                  </motion.button>
                </motion.div>
              ))
          ) : (
            <p className="text-gray-400 text-center">No issues found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
