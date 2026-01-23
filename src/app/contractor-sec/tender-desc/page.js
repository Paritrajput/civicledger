"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function TenderDesc() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tenderParam = searchParams.get("tender");
  if (!tenderParam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No tender data found
      </div>
    );
  }

  const tenderData = JSON.parse(decodeURIComponent(tenderParam));

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-3xl mx-auto p-4 md:p-6 space-y-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center"
        >
          Tender Details
        </motion.h1>

        {/* Tender Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl rounded-2xl border border-gray-800 p-6 space-y-4"
        >
          <InfoRow label="Tender ID" value={tenderData.blockchainTenderId} />
          <InfoRow label="Title" value={tenderData.title} />
          <InfoRow label="Description" value={tenderData.description} />
          <InfoRow label="Category" value={tenderData.category} />
          <InfoRow
            label="Minimum Bid"
            value={`₹${tenderData.minBidAmount}`}
          />
          <InfoRow
            label="Maximum Bid"
            value={`₹${tenderData.maxBidAmount}`}
          />
          <InfoRow
            label="Bid Closing Date"
            value={new Date(
              tenderData.bidClosingDate
            ).toLocaleString()}
          />
          <InfoRow label="Location" value={tenderData.location} />
        </motion.div>

     
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            router.push(
              `/contractor-sec/bid-page?tenderId=${encodeURIComponent(
                tenderData.blockchainTenderId
              )}&mongoId=${encodeURIComponent(tenderData._id)}`
            )
          }
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
        >
          Place a Bid
        </motion.button>
      </div>
    </div>
  );
}

/*Info row*/

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-gray-700 pb-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}
