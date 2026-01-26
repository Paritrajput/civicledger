"use client";

import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <BidAuth />
    </Suspense>
  );
}

function BidAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);

  const [manualReason, setManualReason] = useState("");
  const [search, setSearch] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tenderParam = searchParams.get("tender");
    if (!tenderParam) return;

    try {
      setTender(JSON.parse(decodeURIComponent(tenderParam)));
    } catch {
      alert("Invalid tender data");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!tender?._id) return;

    const fetchBids = async () => {
      setIsLoadingData(true);
      try {
        const res = await axios.get(`/api/bidding?tenderId=${tender._id}`);
        setBids(res.data);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBids();
  }, [tender?._id]);

  const biddingClosed =
    tender && new Date(tender.bidClosingDate).getTime() < Date.now();

  const systemRecommendedBid = bids.find(
    (b) => b.evaluation?.systemRecommended,
  );

  const acceptedBid = bids.find((b) => b.status === "Accepted");

  const filteredBids = useMemo(() => {
    return bids.filter((b) => {
      const contractorName =
        typeof b.contractorId === "object"
          ? b.contractorId?.name || ""
          : String(b.contractorId || "");

      return (
        contractorName.toLowerCase().includes(search.toLowerCase()) ||
        String(b.bidAmount).includes(search)
      );
    });
  }, [bids, search]);

  const approveBid = async (bidId, reason = null) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");

    try {
      const res = await fetch("/api/bid-approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenderId: tender._id,
          winningBidId: bidId,
          manualReason: reason,
        }),
      });

      if (!res.ok) throw new Error();
      alert("Winner approved & contract created");
      router.refresh();
    } catch {
      alert("Failed to approve bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {tender && (
          <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold">{tender.title}</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300 mt-2">
              <p>
                Budget: ₹{tender.minBidAmount} – ₹{tender.maxBidAmount}
              </p>
              <p>Bids Received: {bids.length}</p>
              <p>
                Bid Closing: {new Date(tender.bidClosingDate).toLocaleString()}
              </p>
              <p>Status: {biddingClosed ? "Bidding Closed" : "Ongoing"}</p>
            </div>
          </div>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by contractor name or bid amount..."
          className="w-full px-4 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl"
        />

        {biddingClosed && systemRecommendedBid && !acceptedBid && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            onClick={() => approveBid(systemRecommendedBid._id)}
            className="w-full bg-green-500 text-black py-3 rounded-xl font-semibold"
          >
            Accept System Recommended Bid
          </motion.button>
        )}

        {isLoadingData ? (
          <div className="bg-[#14162d8a] p-6 rounded-2xl text-center">
            Loading bids...
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <div
                key={bid._id}
                onClick={() => setSelectedBid(bid)}
                className={`p-6 rounded-2xl border cursor-pointer transition
                  ${
                    selectedBid?._id === bid._id
                      ? "ring-2 ring-white"
                      : "border-gray-800"
                  }
                  bg-[#14162d8a]`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {bid.contractorId?.name || "Unknown Contractor"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Experience:{" "}
                      {bid.contractorId?.experienceYears ?? bid.experienceYears}{" "}
                      yrs • Rating:{" "}
                      {bid.contractorId?.contractorRating ??
                        bid.contractorRating}
                    </p>
                  </div>

                  {bid.evaluation?.systemRecommended && (
                    <span className="text-xs bg-green-500 text-black px-3 py-1 rounded-full">
                      System Recommended
                    </span>
                  )}
                </div>

                <div className="mt-3 text-sm text-gray-300 space-y-1">
                  <p> Amount: ₹{bid.bidAmount}</p>
                  <p> Timeline: {bid.timeline || "—"}</p>
                  <p> Score: {bid.score ?? "—"}</p>
                  <p>
                    Status: <span className="font-semibold">{bid.status}</span>
                  </p>
                </div>

                {bid.proposalDocument && (
                  <a
                    href={bid.proposalDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 bg-white text-black px-4 py-1 rounded-lg text-sm font-semibold"
                  >
                    View Proposal
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {biddingClosed && selectedBid && !acceptedBid && (
          <div className="bg-[#14162d8a] border border-gray-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-semibold">
              Manual Selection Reason (Required)
            </h3>

            <textarea
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="Explain why this bid is selected over the system recommendation..."
              className="w-full p-3 rounded-xl bg-[#0f1224] border border-gray-700"
            />

            <motion.button
              disabled={!manualReason || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => approveBid(selectedBid._id, manualReason)}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Approve Selected Bid (Manual)
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
