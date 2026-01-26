"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading tender details...
        </div>
      }
    >
      <TenderDesc />
    </Suspense>
  );
}

function TenderDesc() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("");

  const tenderParam = searchParams.get("tender");
  if (!tenderParam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No tender data found
      </div>
    );
  }

  let tenderData;
  try {
    tenderData = JSON.parse(decodeURIComponent(tenderParam));
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Invalid tender data
      </div>
    );
  }

  const bidClosingDate = tenderData.bidClosingDate;
  const isClosed = new Date(bidClosingDate).getTime() < Date.now();

  useEffect(() => {
    const updateTimer = () => {
      const diff = new Date(bidClosingDate).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Bidding Closed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${mins}m left`);
    };

    updateTimer(); 
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [bidClosingDate]);

  const locationText =
    tenderData.location?.placeName || "—";

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-3xl mx-auto p-4 md:p-6 space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center"
        >
          Tender Details
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl rounded-2xl border border-gray-800 p-6 space-y-4"
        >
          <InfoRow label="Blockchain Tender ID" value={tenderData.blockchain?.tenderId || "—"} />
          <InfoRow label="Title" value={tenderData.title} />
          <InfoRow label="Description" value={tenderData.description} />
          <InfoRow label="Category" value={tenderData.category || "—"} />
          <InfoRow
            label="Budget Range"
            value={`₹${tenderData.minBidAmount} – ₹${tenderData.maxBidAmount}`}
          />
          <InfoRow
            label="Bid Closing Date"
            value={new Date(bidClosingDate).toLocaleString()}
          />
          <InfoRow label="Time Remaining" value={timeLeft} />
          <InfoRow label="Location" value={locationText} />
          <InfoRow
            label="Source"
            value={tenderData.source === "ISSUE" ? "Public Issue Based" : "Direct Tender"}
          />
          <InfoRow
            label="Attachments"
            value={`${tenderData.attachments?.length || 0} document(s)`}
          />
        </motion.div>

        {tenderData.attachments?.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm font-medium">Attached Documents</p>
            {tenderData.attachments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#0f1224] border border-gray-700 rounded-xl px-4 py-3"
              >
                <div className="text-sm">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-gray-400 text-xs">{doc.type}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}

        <motion.button
          disabled={isClosed}
          whileHover={!isClosed ? { scale: 1.03 } : {}}
          whileTap={!isClosed ? { scale: 0.95 } : {}}
          onClick={() =>
            !isClosed &&
            router.push(
              `/contractor-sec/bid-page?tenderId=${encodeURIComponent(
                tenderData.blockchain?.tenderId
              )}&mongoId=${encodeURIComponent(tenderData._id)}`
            )
          }
          className={`w-full py-3 rounded-xl font-semibold transition ${
            isClosed
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {isClosed ? "Bidding Closed" : "Place a Bid"}
        </motion.button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-700 pb-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}
