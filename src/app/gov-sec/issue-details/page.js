"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <IssueDetail />
    </Suspense>
  );
}
export function IssueDetail() {
  const [issueData, setIssueData] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const issueParam = searchParams.get("issue");
  console.log(issueParam);
  const parsedIssue = issueParam
    ? JSON.parse(decodeURIComponent(issueParam))
    : null;
  useEffect(() => {
    if (parsedIssue) {
      setIssueData(parsedIssue);
    }
  }, []);
  const handleRejectIssue = async () => {
    try {
      const response = await fetch(
        `/api/public-issue/issue-update/${parsedIssue._id}`,
        {
          method: "PUT",
        },
      );
      if (response.ok) {
        router.push("/gov-sec");
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3 min-h-screen flex items-center justify-center">
        {issueData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14162d8a] backdrop-blur-xl md:p-6 p-4 rounded-2xl shadow-lg w-full max-w-2xl border border-gray-800"
          >
            <h2 className="text-2xl font-bold mb-6">Issue Details</h2>

            {parsedIssue.image && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={parsedIssue.image}
                alt="Issue"
                className="w-full h-48 object-cover mt-3 rounded-xl shadow-md"
              />
            )}
            <div className="space-y-3 mt-4">
              <p className="text-gray-300">
                <strong className="text-white">Type:</strong>{" "}
                {parsedIssue.issue_type}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Description:</strong>{" "}
                {parsedIssue.description}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Location:</strong>{" "}
                {parsedIssue.placename}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Coordinate:</strong>{" "}
                {`${parsedIssue.location.lat}/${parsedIssue.location.lng}`}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Public Votes:</strong>{" "}
                {`Approvals: ${parsedIssue.approval}, Denials: ${parsedIssue.denial}`}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Issue Status:</strong>{" "}
                {parsedIssue.status}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Date:</strong>{" "}
                {parsedIssue.date_of_complaint}
              </p>
            </div>

            <div className="flex gap-4 mt-8 flex-col sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  router.push(
                    `/gov-sec/make-tender?issue=${encodeURIComponent(
                      JSON.stringify(parsedIssue),
                    )}`,
                  );
                }}
                className="flex-1 bg-white text-black rounded-xl py-3 px-6 font-semibold hover:shadow-lg transition"
              >
                Resolve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRejectIssue}
                className="flex-1 bg-red-600 text-white rounded-xl py-3 px-6 font-semibold hover:shadow-lg transition"
              >
                Reject
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
