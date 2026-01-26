"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";
import { useNotification } from "@/Context/NotificationContext";

const PeopleVote = () => {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [eligible, setEligible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const {error, success, warning} = useNotification();


  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/public-issue/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setIssue(data);
      } catch {
        setIssue(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchIssue();
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) {
      warning("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        warning("Location permission required to vote");
      }
    );
  }, []);


  useEffect(() => {
    if (!userLocation || !issue?.location) return;

    const checkEligibility = async () => {
      try {
        const res = await fetch("/api/check-eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userLat: userLocation.lat,
            userLon: userLocation.lon,
            issueLat: issue.location.coordinates[1], // lat
            issueLon: issue.location.coordinates[0], // lng
          }),
        });

        const data = await res.json();
        setEligible(data.eligible);
      } catch {
        setEligible(false);
      }
    };

    checkEligibility();
  }, [userLocation, issue]);


  const handleVoting = async (voteType) => {
    if (!eligible) {
      warning("You are not eligible to vote on this issue.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      warning("Login required");
      return;
    }

    try {
      setIsVoting(true);

      const res = await fetch("/api/public-issue/vote", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issueId: issue._id,
          vote: voteType, 
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setAlreadyVoted(true);
        warning("You already voted on this issue");
        return;
      }

      if (!res.ok) {
        error(data.error || "Voting failed");
        return;
      }

      success("Vote recorded successfully");

      // update counts locally
      setIssue((prev) => ({
        ...prev,
        publicValidation: {
          ...prev.publicValidation,
          approvals: data.approvals,
          rejections: data.rejections,
        },
        status: data.status,
      }));
    } catch {
      alert("Voting failed");
    } finally {
      setIsVoting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Issue not found
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

        <div className="relative p-4 md:p-6 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold mb-8"
          >
            Vote on Issue
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold">{issue.issue_type}</h2>
            <p className="text-gray-300 mt-3">{issue.description}</p>
            <p className="text-gray-400 mt-3">{issue.location.placeName}</p>

            {/* IMAGE CAROUSEL */}
            {issue.images?.length > 0 && (
              <div className="mt-5">
                <img
                  src={issue.images[activeImage]}
                  className="rounded-xl border w-full"
                />
                {issue.images.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {issue.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`border rounded-lg ${
                          i === activeImage
                            ? "border-white"
                            : "border-gray-600 opacity-70"
                        }`}
                      >
                        <img src={img} className="h-16 w-20 object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VOTE COUNTS */}
            <div className="mt-4 flex justify-between text-sm text-gray-300">
              <span>Approvals: {issue.publicValidation.approvals}</span>
              <span>denials: {issue.publicValidation.rejections}</span>
            </div>

            {/* ACTIONS */}
            {alreadyVoted ? (
              <p className="mt-6 text-center text-yellow-400">
                You already voted on this issue
              </p>
            ) : (
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  disabled={isVoting}
                  onClick={() => handleVoting("APPROVE")}
                  className="px-6 py-3 bg-green-500 rounded-xl font-semibold"
                >
                   Approve
                </button>
                <button
                  disabled={isVoting}
                  onClick={() => handleVoting("REJECT")}
                  className="px-6 py-3 bg-red-500 rounded-xl font-semibold"
                >
                   Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PeopleVote;
