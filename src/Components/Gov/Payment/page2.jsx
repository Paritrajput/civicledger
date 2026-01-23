"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";



export default function AdminPaymentPage() {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract");
  const contractData = contractParam
    ? JSON.parse(decodeURIComponent(contractParam))
    : null;

  const [contractor, setContractor] = useState(null);
  const [rating, setRating] = useState("");
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [vote, setVote] = useState("approve");
  const [review, setReview] = useState("");
  const [image, setImage] = useState(null);

  /* Fetch Payments*/

  const fetchPayments = async () => {
    try {
      const res = await fetch(
        `/api/payment/get-payments/${contractData._id}`
      );
      const data = await res.json();
      setPayments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractData?._id) fetchPayments();
  }, [contractData?._id]);

  /* Fetch Contractor */

  useEffect(() => {
    if (!contractData?.winner) return;

    axios
      .post("/api/contractor/get-profile", {
        contractorId: contractData.winner,
      })
      .then((res) => setContractor(res.data))
      .catch(() => setError("Failed to load contractor"));
  }, [contractData?.winner]);



  const submitVote = async () => {
    if (!selectedPayment) return;

    const formData = new FormData();
    formData.append("contractId", contractData._id);
    formData.append("paymentId", selectedPayment._id);
    formData.append("contractorId", selectedPayment.contractorId);
    formData.append("vote", vote);
    formData.append("review", review);
    if (image) formData.append("image", image);

    try {
      await axios.put(
        "/api/contract-voting/public-voting",
        formData
      );
      alert("Vote submitted");
      setShowVoteModal(false);
      fetchPayments();
    } catch (err) {
      alert("Vote submission failed");
    }
  };

  /* ---------------- Submit Rating ---------------- */

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) return;

    try {
      await axios.post("/api/contractor/rating", {
        contractorId: contractData.winner,
        rating: Number(rating),
      });
      alert("Rating submitted");
      setRating("");
    } catch {
      alert("Failed to submit rating");
    }
  };

  const progress =
    contractData?.bidAmount
      ? (contractData.paidAmount / contractData.bidAmount) * 100
      : 0;

  

  return (
    <div className="relative min-h-screen text-white p-4 md:p-6">
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-center mb-8"
      >
        Contract Administration
      </motion.h1>

      {/* Contractor */}
      {contractor && (
        <GlassCard title="Contractor Details">
          <p>Name: {contractor.name}</p>
          <p>Email: {contractor.email}</p>
          <p>Experience: {contractor.experienceYears} yrs</p>

          <div className="flex gap-3 mt-3">
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="bg-[#0f1224] border border-gray-700 rounded-xl px-3 py-2 w-24"
            />
            <button
              onClick={submitRating}
              className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
            >
              Rate
            </button>
          </div>
        </GlassCard>
      )}

      {/* Contract */}
      <GlassCard title="Contract Overview">
        <p>ID: {contractData._id}</p>
        <p>Total Budget: ₹{contractData.bidAmount}</p>

        <div className="mt-3">
          <div className="w-full bg-gray-700 h-3 rounded-xl overflow-hidden">
            <div
              className="bg-green-500 h-3"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm mt-1 text-gray-400">
            {progress.toFixed(2)}% Completed
          </p>
        </div>
      </GlassCard>

      {/* Pending Payments */}
      <Section title="Pending Payment Requests">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          payments
            .filter((p) => p.status === "Pending")
            .map((p) => (
              <GlassCard key={p._id}>
                <p>Requested: ₹{p.paymentMade}</p>
                <p>Reason: {p.reason}</p>

                <button
                  onClick={() => {
                    setSelectedPayment(p);
                    setShowVoteModal(true);
                  }}
                  className="mt-3 bg-white text-black px-4 py-2 rounded-xl"
                >
                  Vote
                </button>
              </GlassCard>
            ))
        )}
      </Section>

      {/* History */}
      <Section title="Payment History">
        {payments
          .filter((p) => p.status === "Completed")
          .map((p) => (
            <GlassCard key={p._id}>
              <p>Paid: ₹{p.paymentMade}</p>
              <p>Reason: {p.reason}</p>
            </GlassCard>
          ))}
      </Section>

      {/* Vote Modal */}
      {showVoteModal && (
        <Modal onClose={() => setShowVoteModal(false)}>
          <h2 className="text-xl font-semibold mb-4">
            Cast Vote
          </h2>

          <div className="flex gap-4 mb-3">
            <label>
              <input
                type="radio"
                checked={vote === "approve"}
                onChange={() => setVote("approve")}
              />{" "}
              Approve
            </label>
            <label>
              <input
                type="radio"
                checked={vote === "reject"}
                onChange={() => setVote("reject")}
              />{" "}
              Reject
            </label>
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full bg-[#0f1224] border border-gray-700 rounded-xl p-2 mb-3"
            placeholder="Review"
          />

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowVoteModal(false)}
              className="px-4 py-2 bg-gray-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={submitVote}
              className="px-4 py-2 bg-white text-black rounded-xl font-semibold"
            >
              Submit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/*Reusable Components*/

function GlassCard({ title, children }) {
  return (
    <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-6">
      {title && (
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
      )}
      <div className="space-y-2 text-gray-300">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        {children}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
