"use client";

import { Suspense, useEffect, useState } from "react";

import Page2 from "@/Components/Gov/Payment/page2";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <ContractBottom />
    </Suspense>
  );
}

export const ContractBottom = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  const searchParams = useSearchParams();

  const contractParam = searchParams.get("contract");
  const contract = contractParam ? JSON.parse(contractParam) : null;

  if (!contract) {
    return <div className="text-white p-6">Invalid contract data</div>;
  }

  const { milestonePlanStatus } = contract;

  useEffect(() => {
    if (milestonePlanStatus === "FINALIZED") {
      setActiveTab("Contract Status");
    } else {
      setActiveTab("Overview");
    }
  }, [milestonePlanStatus]);

  const renderScene = () => {
    if (activeTab === "Contract Status") return <Page2 contract={contract} />;

    return <MilestoneOverview contract={contract} />;
  };

  return (
    <div className="relative min-h-screen text-white pb-20">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative flex-1 p-3 md:p-6">
        {renderScene()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#14162d8a] backdrop-blur-xl border-t border-gray-800 z-50">
        <div className="flex justify-around items-center p-3 sm:p-4">
          {[
            "Overview",
            "Contract Status",
          ].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition rounded-lg ${
                activeTab === tab
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab}
            </motion.button>
          ))} 
        </div>
      </div>
    </div>
  );
};


function MilestoneOverview({ contract }) {
  const router = useRouter();

  const statusMap = {
    DRAFT: {
      title: "Milestones Not Created",
      desc: "Create and define milestones to begin project execution.",
      action: "Create Milestones",
    },
    CONTRACTOR_REVIEW: {
      title: "Waiting for Contractor",
      desc: "Milestone plan sent. Contractor review pending.",
    },
    CONTRACTOR_PROPOSED: {
      title: "Contractor Proposed Changes",
      desc: "Review contractor’s milestone modifications.",
      action: "Review Proposal",
    },
    GOV_REVIEW: {
      title: "Gov Review Pending",
      desc: "Finalize milestone structure to activate the project.",
      action: "Finalize Milestones",
    },
    FINALIZED: {
      title: "Project Active",
      desc: "Milestones finalized. Project execution in progress.",
    },
  };

  const meta = statusMap[contract.milestonePlanStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-xl font-bold">{meta.title}</h2>
      <p className="text-gray-300">{meta.desc}</p>

      <div className="text-sm text-gray-300 space-y-1">
        <p>Contract ID: {contract.contractId}</p>
        <p>Contract Value: ₹{contract.contractValue}</p>
        <p>Paid Amount: ₹{contract.paidAmount}</p>
      </div>

      {meta.action && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            router.push(
              `/gov-sec/milestones?contract=${encodeURIComponent(
                JSON.stringify(contract)
              )}`
            )
          }
          className="mt-4 bg-white text-black px-6 py-2 rounded-xl font-semibold hover:shadow-lg"
        >
          {meta.action}
        </motion.button>
      )}
    </motion.div>
  );
}
