"use client";
import { Suspense, useEffect, useState } from "react";
import Page1 from "@/Components/Gov/Payment/page1";
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
  const [activeTab, setActiveTab] = useState("Active Payments");
  const router = useRouter();
  const searchParams = useSearchParams();
  const contract = searchParams.get("contract");
  const contractData = contract ? JSON.parse(contract) : null;

  const renderScene = () => {
    switch (activeTab) {
      case "Active Payments":
        return <Page1 contract={contractData} />;
      case "Contract Status":
        return <Page2 contract={contractData} />;
      default:
        return <Page1 contract={contractData} />;
    }
  };

  return (
    <div className="relative min-h-screen text-white pb-20">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative flex-1 md:p-4 p-1">{renderScene()}</div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#14162d8a] backdrop-blur-xl border-t border-gray-800 z-50">
        <div className="flex justify-around items-center p-3 sm:p-4">
          {["Active Payments", "Contract Status"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition rounded-lg ${
                activeTab === tab
                  ? "text-white  bg-opacity-10 border-b-2 border-white"
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
