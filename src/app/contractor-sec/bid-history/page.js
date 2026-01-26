"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useGovUser } from "@/Context/govUser";

export default function BidHistory() {
  const { user, loading: userLoading } = useGovUser();

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const contractorId = user?.id;

  useEffect(() => {
    if (!contractorId) return;

    const fetchBidHistory = async () => {
      try {
        const res = await axios.post("/api/contractor/bid-history", {
          contractorId,
        });

        setBids(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bid history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBidHistory();
  }, [contractorId]);

  if (userLoading) {
    return <CenteredText text="Checking session..." />;
  }

  return (
    <div className="relative min-h-screen text-white">
  
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 space-y-10">
        <Header />

        {loading ? (
          <CenteredText text="Loading your bid history…" />
        ) : bids.length === 0 ? (
          <CenteredText text="You haven’t placed any bids yet." />
        ) : (
          <BidGrid bids={bids} />
        )}
      </div>
    </div>
  );
}


function Header() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-center"
    >
      My Bid History
    </motion.h1>
  );
}

function BidGrid({ bids }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {bids.map((bid, idx) => (
        <BidCard key={bid._id || idx} bid={bid} index={idx} />
      ))}
    </div>
  );
}

function BidCard({ bid, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition space-y-4"
    >
  
      <div>
        <h2 className="text-lg font-semibold line-clamp-1">
          {bid.tenderTitle || "Untitled Tender"}
        </h2>
        <p className="text-gray-400 text-sm line-clamp-2 mt-1">
          {bid.tenderDescription || "No description provided"}
        </p>
      </div>

  
      <div className="text-sm space-y-1">
        <Info label="Bid Amount" value={`₹${bid.bidAmount}`} />
        <Info label="Experience" value={`${bid.experience || 0} yrs`} />
        <Info
          label="Documents"
          value={`${bid.documentsSubmitted || 0} files`}
        />
      </div>


      <div className="bg-[#0f1224] border border-gray-700 rounded-xl p-3 text-sm space-y-1">
        <Info
          label="Status"
          value={<StatusBadge status={bid.status} />}
        />
        <Info
          label="Selection"
          value={bid.selectionType || "—"}
        />
        {bid.systemScore !== undefined && (
          <Info label="System Score" value={bid.systemScore} />
        )}
        {bid.rank && <Info label="Rank" value={`#${bid.rank}`} />}
      </div>


      <div className="text-xs text-gray-400">
        <p>
          Submitted:{" "}
          {bid.createdAt
            ? new Date(bid.createdAt).toLocaleString()
            : "—"}
        </p>
        {bid.evaluatedAt && (
          <p>
            Evaluated:{" "}
            {new Date(bid.evaluatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}


function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING: "bg-yellow-500",
    WON: "bg-green-500",
    LOST: "bg-gray-500",
    REJECTED: "bg-red-500",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold text-black ${
        map[status] || "bg-gray-400"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function CenteredText({ text }) {
  return (
    <div className="text-center text-gray-400 py-20">
      {text}
    </div>
  );
}
