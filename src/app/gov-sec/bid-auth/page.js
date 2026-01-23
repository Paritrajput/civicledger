"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <BidAuth />
    </Suspense>
  );
}
export const BidAuth = () => {
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const tenderData = searchParams.get("tender");
  const tender = JSON.parse(tenderData);
  const [tenders, setTenders] = useState(tender);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const response = await axios.get(`/api/bidding?tenderId=${tender._id}`);
        setBids(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Could not get bids", error);
        setError("Could not get bids");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // const handleApproveBid = async () => {
  //   if (!selectedBidder) {
  //     alert("Please select a bidder to approve");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     console.log("selected bidder", selectedBidder);
  //     const data = {
  //       blockchainBidId: selectedBidder.blockchainBidId,
  //       bidId: selectedBidder._id,
  //       bidAmount: selectedBidder.bidAmount,
  //       tenderId: selectedBidder.tenderId,
  //       contractorId: selectedBidder.contractorId,
  //     };

  //     const response = await fetch("/api/bid-approve", {
  //       method: "POST",
  //       body: JSON.stringify(data),
  //     });
  //     if (response.ok) {
  //       console.log("Response:", response);
  //       alert("Bid approved successfully!");
  //     } else {
  //       console.log("Error approving bid", response.error);
  //     }
  //   } catch (error) {
  //     alert("Failed to approve bid");
  //     console.error("Error approving bid:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const closeTender = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/tender/close-tender", {
        method: "POST",
        body: JSON.stringify(tenders._id),
      });
      if (response.ok) {
        router.push("/gov-sec");
        console.log("Response:", response);
        alert("Tender closed successfully!");
      } else {
        console.log("Error approving bid", response.error);
      }
    } catch (error) {
      alert("Failed to approve bid");
      console.error("Error approving bid:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3">
        {tenders.status === "Active" ? (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-5 py-2 text-2xl font-semibold text-center"
          >
            Bidding Process Ongoing
          </motion.div>
        ) : tenders.status === "Completed" ? (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-5 py-2 text-center"
          >
            <h1 className="text-2xl font-semibold mb-4">Bidding Completed</h1>

            <h1 className="text-xl font-semibold mb-4">Winner</h1>

            <div className="mt-4 max-w-3xl mx-auto">
              {bids.filter((bid) => bid.status === "Accepted").length > 0 ? (
                bids
                  .filter((bid) => bid.status === "Accepted")
                  .map((bid) => (
                    <motion.div
                      key={bid._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-[#14162d8a] backdrop-blur-xl rounded-2xl shadow-md border-2 border-white mb-4"
                    >
                      <h2 className="text-lg font-semibold text-white">
                        {bid.name}
                      </h2>
                      <h2 className="text-md text-gray-400">
                        {bid.contractorId}
                      </h2>
                      <p className="text-md text-gray-300">
                        Bid Amount: ₹{bid.bidAmount}
                      </p>
                      <p className="text-sm text-green-400 font-medium mt-2">
                        ✅ Status: Accepted
                      </p>
                    </motion.div>
                  ))
              ) : (
                <div className="text-gray-400">No accepted bid found.</div>
              )}
            </div>
          </motion.div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center mb-6"
        >
          Submitted Bids
        </motion.h1>
        {isLoadingData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 text-center max-w-3xl mx-auto"
          >
            <div className="text-gray-300">Loading Data...</div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {bids.map((bid, index) => (
                <motion.div
                  key={bid._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedBidder(bid)}
                  className={`p-6 bg-[#14162d8a] backdrop-blur-xl rounded-2xl shadow-md cursor-pointer border-2 transition duration-200 ${
                    selectedBidder?._id === bid._id
                      ? "border-white"
                      : "border-gray-800"
                  } hover:border-gray-600`}
                >
                  <h2 className="text-lg font-semibold text-white">
                    {bid.name}
                  </h2>
                  <h2 className="text-md text-gray-400">{bid.contractorId}</h2>
                  <p className="text-md text-gray-300">
                    Bid Amount: ₹{bid.bidAmount}
                  </p>
                </motion.div>
              ))}
            </div>
            {bids.length > 0 ? (
              tenders.status === "Completed" ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeTender}
                  disabled={isLoading}
                  className="mt-6 w-full bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-50 transition duration-200 hover:shadow-lg"
                >
                  Close Tender
                </motion.button>
              ) : null
            ) : (
              <div className="mt-6 text-center text-gray-400 bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800">
                No Bids for this tender
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// export default BidAuth;
