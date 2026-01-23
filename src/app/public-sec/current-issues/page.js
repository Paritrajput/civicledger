"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function Page1() {
  const [issues2, setIssues2] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [all, setAll] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.error("Failed to get location"),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // Fetch all issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("/api/public-issue");
        setIssues2(response.data.issues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Distance calculation
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Filter nearby issues
  useEffect(() => {
    if (userLocation && issues2.length > 0) {
      const nearby = issues2.filter((issue) => {
        const { lat, lng } = issue.location || {};
        if (!lat || !lng) return false;
        return getDistance(userLocation.lat, userLocation.lng, lat, lng) <= 10;
      });
      setFilteredIssues(nearby);
    }
  }, [userLocation, issues2]);

  // Search filter
  const getDisplayedIssues = () => {
    const baseIssues = all ? issues2 : filteredIssues;
    if (!searchQuery.trim()) return baseIssues;

    return baseIssues.filter(
      (issue) =>
        issue.issue_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.placename?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* FIXED BACKGROUND (does NOT scroll) */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* SCROLLABLE CONTENT */}
      <div className="relative p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold"
          >
            Reported Public Issues
          </motion.h1>

          <motion.select
            whileHover={{ scale: 1.02 }}
            value={all ? "all" : "nearby"}
            onChange={(e) => setAll(e.target.value === "all")}
            className="bg-[#0f1224] text-white border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:border-gray-500 transition"
          >
            <option value="all">All Issues</option>
            <option value="nearby">Nearby Issues</option>
          </motion.select>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Search issues by type, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1224] text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-500 transition placeholder-gray-500"
          />
        </motion.div>

        {/* Issues List */}
        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded-lg w-2/3 mb-4" />
                <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-2" />
                <div className="h-4 bg-gray-700 rounded-lg w-1/3 mb-4" />
                <div className="h-10 bg-gray-700 rounded-xl w-32" />
              </div>
            ))
          ) : getDisplayedIssues()?.length > 0 ? (
            getDisplayedIssues().map((issue, idx) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
              >
                <h2 className="text-lg md:text-xl font-semibold">
                  {issue.issue_type}
                </h2>

                <p className="text-gray-300 mt-2 max-md:hidden">
                  {issue.description}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                  <span>
                    <strong>Location:</strong> {issue.placename}
                  </span>
                  <span>
                    <strong>Date:</strong> {issue.date_of_complaint}
                  </span>
                  <span className="max-md:hidden">
                    <strong>Votes:</strong> 👍 {issue.approval} / 👎{" "}
                    {issue.denial}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(`/public-sec/people-voting/${issue._id}`)
                  }
                  className="mt-5 px-5 py-2 bg-white text-black font-semibold rounded-xl transition"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">No issues found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
