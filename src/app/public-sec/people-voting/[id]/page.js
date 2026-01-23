"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";

const PeopleVote = () => {
  const router = useRouter();
  const { id } = useParams();
  const [issue2, setIssue2] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [eligible, setEligible] = useState(null);
  const [issueLocation, setIssueLocation] = useState(null);
  const [loading, setLoading] = useState(true); // 🔄

  // Fetch issue details
  useEffect(() => {
    const getIssue = async () => {
      try {
        const response = await axios.get(`/api/public-issue/${id}`);
        setIssue2(response.data);
        setIssueLocation(response.data.location);
      } catch {
        console.log("Failed to fetch issue");
      } finally {
        setLoading(false); 
      }
    };
    if (id) getIssue();
  }, [id]);

  // Get user's geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Location access is required to verify voting eligibility.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  // Check eligibility only when both issue location & user location are available
  useEffect(() => {
    if (userLocation && issueLocation) {
      checkEligibility(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, issueLocation]);

  const checkEligibility = async (lat, lon) => {
    try {
      const response = await fetch("/api/check-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userLat: lat,
          userLon: lon,
          issueLat: issueLocation.lat,
          issueLon: issueLocation.lng,
        }),
      });

      const data = await response.json();
      console.log(data);
      setEligible(data.eligible);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleVoting = async (vote) => {
    if (!eligible) {
      alert("You are not eligible for voting.");
      return;
    }

    try {
      setIsVoting(true);
      const response = await fetch("/api/public-issue/vote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: issue2._id, vote }),
      });
      alert("Voted Successfully");
      setIsVoting(false);
    } catch {
      console.log("Failed to vote");
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />
        <div className="flex justify-center items-center min-h-screen p-6">
          <div className="bg-[#14162d8a] backdrop-blur-xl shadow-lg border border-gray-800 rounded-2xl p-6 w-full max-w-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded-lg w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded-lg w-5/6 mb-4"></div>
            <div className="h-48 bg-gray-800 rounded-lg mb-6"></div>
            <div className="flex gap-4">
              <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
              <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue2)
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />
        <p className="text-center">Issue not found.</p>
      </div>
    );

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen text-white">
        {/* FIXED BACKGROUND */}
        <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

        {/* SCROLLABLE CONTENT */}
        <div className="relative p-4 md:p-6 flex flex-col items-center">
          {/* Header */}
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-center mb-8"
          >
            Vote on Issue
          </motion.h1>

          {/* Issue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14162d8a] backdrop-blur-xl shadow-lg border border-gray-800 rounded-2xl p-6 w-full max-w-lg text-white"
          >
            <h2 className="text-2xl font-bold">
              {issue2.issue_type}
            </h2>
            <p className="text-gray-300 mt-3">{issue2.description}</p>
            <p className="text-gray-400 mt-3 font-medium">
              📍 {issue2.placename}
            </p>

            {issue2.image && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={issue2.image}
                alt="Issue Image"
                className="mt-5 rounded-xl border border-gray-700 w-full"
              />
            )}

            {!isVoting ? (
              <div className="mt-6 flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVoting(true)}
                  className="px-6 py-3 bg-green-500 text-black font-semibold rounded-xl hover:bg-green-400 transition shadow-lg"
                >
                  ✅ Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVoting(false)}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-400 transition shadow-lg"
                >
                  ❌ Reject
                </motion.button>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <p className="text-gray-300 font-medium">Processing your vote...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PeopleVote;
