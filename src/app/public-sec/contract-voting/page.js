"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/Components/ProtectedRoutes/protected-routes";
import { useGovUser } from "@/Context/govUser";
import { useNotification } from "@/Context/NotificationContext";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <PublicContractDashboard />
    </Suspense>
  );
}

function PublicContractDashboard() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId");

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useGovUser();
  const { success, warning } = useNotification;

  /* ---------------- FETCH CONTRACT ---------------- */
  useEffect(() => {
    if (!contractId) return;

    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/${contractId}`);
        const data = await res.json();
        if (!res.ok) throw new Error();

        setContract(data.contract);
      } catch {
        setError("Failed to load contract");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (loading) {
    return <div className="text-white text-center p-10">Loading…</div>;
  }

  if (!contract) {
    return <div className="text-red-400 text-center p-10">{error}</div>;
  }

  const totalMilestones = contract.milestones.length;
  const completedMilestones = contract.milestones.filter(
    (m) => m.status === "Paid"|| m.status === "Approved",
  ).length;

  const progress =
    totalMilestones === 0
      ? 0
      : Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen text-white">
        <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

        <div className="relative max-w-6xl mx-auto p-4 md:p-6 space-y-8">
          {/* HEADER */}
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center"
          >
            Public Contract Dashboard
          </motion.h1>

          <Card title="Contract Summary">
            <InfoRow label="Contract ID" value={contract.contractId} />
            <InfoRow label="Status" value={contract.status} />
            <InfoRow
              label="Contract Value"
              value={`₹${contract.contractValue}`}
            />
            <InfoRow label="Paid Amount" value={`₹${contract.paidAmount}`} />
            <InfoRow
              label="Milestone Plan"
              value={contract.milestonePlanStatus}
            />
          </Card>

          <Card title="Contractor Information">
            <div className="space-y-2 text-sm text-gray-300">
              <InfoRow
                label="Name"
                value={contract.contractor?.name || "N/A"}
              />
              <InfoRow
                label="Experience"
                value={`${contract.contractor?.experienceYears || 0} years`}
              />
              <InfoRow
                label="Rating"
                value={
                  contract.contractor?.contractorRating?.average
                    ? `${contract.contractor.contractorRating.average.toFixed(1)} ⭐ 
             (${contract.contractor.contractorRating.count} reviews)`
                    : "Not rated yet"
                }
              />
            </div>

            <PublicRating
              contractorId={contract.contractor?._id}
              contractId={contract._id}
              userId={user.id}
            />
          </Card>

          {/* PROGRESS */}
          <Card title="Overall Progress">
            <div className="w-full bg-gray-800 h-3 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-green-500 h-3 rounded-full"
              />
            </div>
            <p className="text-sm mt-2 text-center">
              {progress}% completed ({completedMilestones}/{totalMilestones})
            </p>
          </Card>

          {/* MILESTONE TIMELINE */}
          <Card title="Milestone Timeline">
            {contract.milestones.length === 0 ? (
              <p className="text-gray-400 text-center">
                Milestones not finalized yet
              </p>
            ) : (
              <MilestoneTimeline
                milestones={contract.milestones}
                contractId={contract._id}
                userId={user.id}
              />
            )}
          </Card>

          {/* PAYMENT HISTORY */}
          <Card title="Payment History">
            {contract.milestones.filter((m) => m.fundRelease?.released)
              .length === 0 ? (
              <p className="text-gray-400 text-center">
                No payments released yet
              </p>
            ) : (
              contract.milestones.map(
                (m, i) =>
                  m.fundRelease?.released && (
                    <div
                      key={i}
                      className="border-b border-gray-700 py-2 text-sm"
                    >
                      <p>{m.title}</p>
                      <p className="text-gray-400">Amount: ₹{m.amount}</p>
                    </div>
                  ),
              )
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// MILESTONES

function MilestoneTimeline({ milestones, contractId, userId }) {
  return (
    <div className="space-y-6">
      {milestones.map((m, i) => (
        <div
          key={i}
          className="bg-[#0f1224] border border-gray-700 rounded-xl p-4"
        >
          <p className="font-semibold">{m.title}</p>
          <p className="text-sm text-gray-400">{m.description}</p>
          <p className="text-sm mt-1">Amount: ₹{m.amount}</p>
          <p className="text-sm">Status: {m.status}</p>

          {/* PROOFS */}
          {m.proofs?.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold">Proofs</p>
              {m.proofs.map((p, idx) => (
                <a
                  key={idx}
                  href={p.fileUrl}
                  target="_blank"
                  className="text-blue-400 text-sm underline"
                >
                  View {p.type}
                </a>
              ))}
            </div>
          )}
          {m.publicVoting?.closed && (
            <p className="text-sm text-yellow-400 mt-2">
              Public voting closed. Awaiting government review.
            </p>
          )}

          {m.status === "UnderReview" && !m.publicVoting?.closed && (
            <PublicVoteSection
              contractId={contractId}
              milestoneId={m._id}
              userId={userId}
            />
          )}

          {m.publicVotesLog?.length > 0 && (
            <div className="mt-3 text-sm text-gray-300">
              <p className="font-semibold">Public Feedback</p>
              {m.publicVotesLog.map((v, idx) => (
                <div key={idx} className="border-b border-gray-700 py-1">
                  <p>
                    <strong>{v.vote.toUpperCase()}</strong> –{" "}
                    {v.comment || "No comment"}
                  </p>
                  {v.attachment && (
                    <a
                      href={v.attachment}
                      target="_blank"
                      className="text-blue-400 underline text-xs"
                    >
                      View attachment
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PublicVoteSection({ contractId, milestoneId, userId }) {
  const [comment, setComment] = useState("");
  const [vote, setVote] = useState("approve");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submitVote = async () => {
    if (!userId) {
      alert("You must be logged in to vote");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("contractId", contractId);
      formData.append("milestoneId", milestoneId);
      formData.append("userId", userId);
      formData.append("vote", vote);
      formData.append("comment", comment);

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/contract-voting/public-voting", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      success("Vote submitted successfully");
      location.reload();
    } catch (err) {
      warning("Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 bg-[#14162d8a] border border-gray-800 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">
        Public Verification
      </h4>

      {/* Comment */}
      <textarea
        placeholder="Share your observation (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-[#0f1224] border border-gray-700 p-2 rounded-lg text-sm text-white focus:outline-none"
      />

      {/* Proof Image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full text-sm text-gray-400 file:bg-white file:text-black file:px-3 file:py-1 file:rounded-lg file:border-0"
      />

      {/* Vote + Submit */}
      <div className="flex gap-3">
        <select
          value={vote}
          onChange={(e) => setVote(e.target.value)}
          className="bg-[#0f1224] border border-gray-700 p-2 rounded-lg text-sm text-white"
        >
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          disabled={submitting}
          onClick={submitVote}
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Vote"}
        </motion.button>
      </div>
    </div>
  );
}

function PublicRating({ contractorId, contractId, userId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contractor/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          contractId,
          userId,
          rating,
          comment,
        }),
      });

      if (!res.ok) throw new Error();
      success("Rating submitted successfully");
      location.reload();
    } catch {
      warning("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold">Rate Contractor</p>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-2xl ${
              n <= rating ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional feedback (visible publicly)"
        className="w-full bg-[#14162d] p-2 rounded-lg text-sm border border-gray-700"
      />

      <button
        disabled={submitting}
        onClick={submitRating}
        className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold"
      >
        Submit Rating
      </button>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-[#14162d8a] border border-gray-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm border-b border-gray-700 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
