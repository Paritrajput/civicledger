"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ContractTrackerPage() {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract");
  const contractDetails = contractParam ? JSON.parse(contractParam) : null;

  if (!contractDetails) {
    return <CenteredText text="Invalid contract data" error />;
  }

  const contractId = contractDetails._id;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");

  /* ---------------- FETCH CONTRACT ---------------- */

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setContract(data.contract);
    } catch {
      alert("Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  

  const finalizeMilestone = async ({
    milestoneId,
    action,
    overrideReason,
  }) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts/milestones/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          milestoneId,
          action, // ACCEPT | OVERRIDE
          overrideReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message || "Decision applied");
      setOverrideTarget(null);
      setOverrideReason("");
      fetchContract();
    } catch (err) {
      alert(err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) {
    return <CenteredText text="Loading contract..." />;
  }

  if (!contract) {
    return <CenteredText text="Contract not found" error />;
  }

  const remaining =
    (contract.contractValue || 0) - (contract.paidAmount || 0);

  return (
    <div className="relative min-h-screen text-white pb-16">
      <Background />

      <div className="relative max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        <Header />

        {/* CONTRACTOR */}
        <Card title="Contractor Overview">
          <InfoRow label="Contractor ID" value={contract.contractor?._id} />
          <InfoRow label="Name" value={contract.contractor?.name} />
          <InfoRow
            label="Experience"
            value={`${contract.contractor?.experienceYears || 0} years`}
          />
          <InfoRow
            label="Rating"
            value={
              contract.contractor?.contractorRating?.average
                ? `${contract.contractor.contractorRating.average.toFixed(
                    1
                  )} ⭐`
                : "Not rated"
            }
          />
        </Card>

        
        <Card title="Contract Overview">
          <InfoRow label="Contract ID" value={contract.contractId} />
          <InfoRow label="Status" value={contract.status} />
          <InfoRow
            label="Milestone Plan"
            value={contract.milestonePlanStatus}
          />
          <InfoRow
            label="Award Method"
            value={
              contract.awardMeta?.selectionType === "SYSTEM"
                ? "System Recommended"
                : "Manual Selection"
            }
          />
        </Card>

        
        <Card title="Financial Summary">
          <InfoRow
            label="Total Contract Value"
            value={`₹${contract.contractValue}`}
          />
          <InfoRow
            label="Paid Amount"
            value={`₹${contract.paidAmount}`}
          />
          <InfoRow
            label="Remaining Amount"
            value={`₹${remaining}`}
          />
          <ProgressBar
            value={contract.paidAmount}
            max={contract.contractValue}
          />
        </Card>

        {/* MILESTONES */}
        <Card title="Milestone Progress">
          {contract.milestones?.length === 0 ? (
            <Notice text="Milestones not finalized yet." />
          ) : (
            <MilestoneTimeline
              milestones={contract.milestones}
              submitting={submitting}
              onAccept={(id) =>
                finalizeMilestone({ milestoneId: id, action: "ACCEPT" })
              }
              onOverride={(m) => setOverrideTarget(m)}
            />
          )}
        </Card>

        {/* OVERRIDE MODAL */}
        {overrideTarget && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#14162d] p-6 rounded-xl w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">
                Override System Decision
              </h3>

              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Reason for override"
                className="w-full bg-[#0f1224] p-3 rounded-lg border border-gray-700"
              />

              <div className="flex gap-3">
                <button
                  disabled={submitting}
                  onClick={() =>
                    finalizeMilestone({
                      milestoneId: overrideTarget._id,
                      action: "OVERRIDE",
                      overrideReason,
                    })
                  }
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold"
                >
                  Submit Override
                </button>

                <button
                  onClick={() => setOverrideTarget(null)}
                  className="flex-1 bg-gray-600 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BLOCKCHAIN */}
        {/* {contract.blockchain?.transactionHash && (
          <Card title="Blockchain Record">
            <InfoRow
              label="Transaction Hash"
              value={contract.blockchain.transactionHash}
            />
            <InfoRow
              label="Network"
              value={contract.blockchain.network}
            />
          </Card>
        )} */}
      </div>
    </div>
  );
}



function MilestoneTimeline({ milestones, submitting, onAccept, onOverride }) {
  return (
    <div className="space-y-4">
      {milestones.map((m) => (
        <div
          key={m._id}
          className="bg-[#0f1224] border border-gray-700 rounded-xl p-4 space-y-2"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{m.title}</h3>
            <StatusBadge status={m.status} />
          </div>

          <p className="text-sm text-gray-400">{m.description}</p>

          {m.finalEvaluation && (
            <div className="bg-[#14162d] p-3 rounded-lg text-sm mt-2">
              <p>AI Score: {m.finalEvaluation.aiScore}</p>
              <p>Public Score: {m.finalEvaluation.publicScore}</p>
              <p>Gov Score: {m.finalEvaluation.govScore}</p>

              <p className="font-semibold mt-1">
                Final Score: {m.finalEvaluation.finalScore}
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                  m.finalEvaluation.recommended
                    ? "bg-green-500 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {m.finalEvaluation.recommended
                  ? "SYSTEM RECOMMENDED"
                  : "NOT RECOMMENDED"}
              </span>
            </div>
          )}

          {m.status === "GovReview" && m.finalEvaluation && (
            <div className="flex gap-3 mt-4">
              <button
                disabled={submitting}
                onClick={() => onAccept(m._id)}
                className="bg-green-500 text-black px-4 py-2 rounded-xl font-semibold"
              >
                Accept System Decision
              </button>

              <button
                disabled={submitting}
                onClick={() => onOverride(m)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold"
              >
                Override Decision
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-gray-500",
    InProgress: "bg-blue-500",
    Submitted: "bg-yellow-500",
    UnderReview: "bg-purple-500",
    GovReview: "bg-orange-500",
    Approved: "bg-green-500",
    Rejected: "bg-red-500",
    Paid: "bg-emerald-500",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full text-black font-semibold ${
        map[status] || "bg-gray-400"
      }`}
    >
      {status}
    </span>
  );
}



function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
  );
}

function Header() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl md:text-3xl font-bold text-center"
    >
      Contract Progress Tracker
    </motion.h1>
  );
}

function Card({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">{title}</h2>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-700 py-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ProgressBar({ value, max }) {
  const percent = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Notice({ text }) {
  return <div className="text-center text-gray-400">{text}</div>;
}

function CenteredText({ text, error }) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        error ? "text-red-400" : "text-white"
      }`}
    >
      {text}
    </div>
  );
}
