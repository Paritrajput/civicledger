"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ContractDesc() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get("contractId");

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCounterUI, setShowCounterUI] = useState(false);
  const [counterMilestones, setCounterMilestones] = useState([]);
  const [counterReason, setCounterReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const openSubmissionModal = (milestone) => {
    setActiveMilestone(milestone);
    setShowSubmitModal(true);
  };
  /* ---------------- FETCH CONTRACT ---------------- */

  useEffect(() => {
    if (!contractId) return;

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

    fetchContract();
  }, [contractId]);

  /* ---------------- ACTIONS ---------------- */

  const acceptGovMilestones = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts/milestones/contractor-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });
      if (!res.ok) throw new Error();
      alert("Government milestones accepted");
      location.reload();
    } catch {
      alert("Failed to accept milestones");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCounterProposal = async () => {
    if (!counterReason || counterMilestones.length === 0) {
      alert("Add milestones and reason");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts/milestones/contractor-counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          proposedMilestones: counterMilestones,
          proposalReason: counterReason,
        }),
      });
      if (!res.ok) throw new Error();
      alert("Counter proposal submitted");
      location.reload();
    } catch {
      alert("Failed to submit counter proposal");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- COUNTER HELPERS ---------------- */

  const addMilestone = () => {
    setCounterMilestones([
      ...counterMilestones,
      { title: "", description: "", amount: "", dueDate: "" },
    ]);
  };

  const updateMilestone = (i, field, value) => {
    const copy = [...counterMilestones];
    copy[i][field] = value;
    setCounterMilestones(copy);
  };

  const removeMilestone = (i) => {
    setCounterMilestones(counterMilestones.filter((_, idx) => idx !== i));
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <div className="text-white text-center p-10">Loading…</div>;
  }

  if (!contract) {
    return (
      <div className="text-red-400 text-center p-10">Contract not found</div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <Header title="Contract Overview" />

        <Card title="Contract Summary">
          <InfoRow label="Contract ID" value={contract.contractId} />
          <InfoRow label="Value" value={`₹${contract.contractValue}`} />
          <InfoRow label="Status" value={contract.status} />
          <InfoRow
            label="Milestone Plan"
            value={contract.milestonePlanStatus}
          />
        </Card>

        {/* ---------------- GOV PROPOSED ---------------- */}
        {contract.milestonePlanStatus === "CONTRACTOR_REVIEW" && (
          <Card title="Government Proposed Milestones">
            <MilestoneList milestones={contract.proposedMilestones} />

            <div className="flex gap-4 mt-6">
              <ActionButton
                text="Accept These Milestones"
                color="green"
                onClick={acceptGovMilestones}
                disabled={submitting}
              />
              <ActionButton
                text="Create Counter Proposal"
                color="white"
                onClick={() => {
                  setShowCounterUI(true);
                  setCounterMilestones(
                    contract.proposedMilestones.map((m) => ({ ...m })),
                  );
                }}
                disabled={submitting}
              />
            </div>
          </Card>
        )}

        {/* ---------------- COUNTER UI ---------------- */}
        {showCounterUI && (
          <Card title="Counter Milestone Proposal">
            <MilestoneEditor
              milestones={counterMilestones}
              updateMilestone={updateMilestone}
              removeMilestone={removeMilestone}
            />

            <button
              onClick={addMilestone}
              className="w-full bg-gray-700 py-2 rounded-xl font-semibold"
            >
              + Add Milestone
            </button>

            <textarea
              value={counterReason}
              onChange={(e) => setCounterReason(e.target.value)}
              placeholder="Explain why changes are required"
              className="w-full p-3 rounded-xl bg-[#0f1224] border border-gray-700"
            />

            <ActionButton
              text="Submit Counter Proposal"
              color="white"
              onClick={submitCounterProposal}
              disabled={submitting}
            />
          </Card>
        )}

        {/* ---------------- FINALIZED ---------------- */}
        {contract.milestonePlanStatus === "FINALIZED" && (
          <Card title="Project Progress">
            <MilestoneList
              milestones={contract.milestones}
              openSubmissionModal={openSubmissionModal}
              showStatus
            />
          </Card>
        )}
        {showSubmitModal && activeMilestone && (
          <MilestoneSubmissionModal
            milestone={activeMilestone}
            onClose={() => setShowSubmitModal(false)}
          />
        )}
      </div>
    </div>
  );
}

const resolveMilestoneTimeState = (milestone) => {
  const terminalStates = ["Approved", "Rejected", "Paid"];

  if (terminalStates.includes(milestone.status)) {
    return milestone.status.toUpperCase();
  }

  if (
    milestone.status === "Submitted" ||
    milestone.status === "UnderReview" ||
    milestone.status === "GovReview"
  ) {
    return "UNDER_VERIFICATION";
  }

  const now = new Date();
  const due = new Date(milestone.dueDate);
  const graceEnd = new Date(
    due.getTime() + (milestone.gracePeriodDays || 0) * 24 * 60 * 60 * 1000,
  );

  if (now < due) return "UPCOMING";
  if (now >= due && now <= graceEnd) return "DUE";
  if (now > graceEnd) return "OVERDUE";

  return milestone.status;
};

/* ---------------- UI ---------------- */

const Header = ({ title }) => (
  <h1 className="text-3xl font-bold text-center">{title}</h1>
);

const Card = ({ title, children }) => (
  <div className="bg-[#14162d8a] border border-gray-800 rounded-2xl p-6 space-y-4">
    <h2 className="text-xl font-semibold text-center">{title}</h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm border-b border-gray-700 py-2">
    <span className="text-gray-400">{label}</span>
    <span>{value}</span>
  </div>
);

const ActionButton = ({ text, color, onClick, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex-1 py-3 rounded-xl font-semibold ${
      color === "green" ? "bg-green-500 text-black" : "bg-white text-black"
    }`}
  >
    {text}
  </button>
);

const MilestoneList = ({ milestones, openSubmissionModal }) => {
  return (
    <div className="space-y-4">
      {milestones.map((m, i) => {
        const timeState = resolveMilestoneTimeState(m);
        const canSubmit =
          (timeState === "DUE" || timeState === "OVERDUE") &&
          ![
            "Submitted",
            "UnderReview",
            "GovReview",
            "Approved",
            "Paid",
          ].includes(m.status);

        return (
          <div
            key={i}
            className={`p-4 rounded-xl border ${
              timeState === "OVERDUE"
                ? "border-red-500 bg-red-500/10"
                : timeState === "DUE"
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-gray-700 bg-[#0f1224]"
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold">{m.title}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-black/40">
                {timeState}
              </span>
            </div>

            <p className="text-sm text-gray-400">{m.description}</p>
            <p>Amount: ₹{m.amount}</p>
            <p>Due: {new Date(m.dueDate).toLocaleDateString()}</p>

         
            {timeState === "DUE" && (
              <div className="mt-3 text-yellow-400 text-sm font-semibold">
                 Due date reached — submit proof within grace period
              </div>
            )}

           
            {timeState === "OVERDUE" && (
              <div className="mt-3 text-red-400 text-sm font-semibold">
                 Deadline missed — delay reason required
              </div>
            )}

            {canSubmit && (
              <button
                onClick={() => openSubmissionModal(m)}
                className="mt-3 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Submit Milestone Report
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MilestoneEditor = ({ milestones, updateMilestone, removeMilestone }) => (
  <div className="space-y-4">
    {milestones.map((m, i) => (
      <div key={i} className="bg-[#0f1224] p-4 rounded-xl space-y-2">
        <input
          value={m.title}
          onChange={(e) => updateMilestone(i, "title", e.target.value)}
          placeholder="Title"
          className="input"
        />
        <textarea
          value={m.description}
          onChange={(e) => updateMilestone(i, "description", e.target.value)}
          placeholder="Description"
          className="input"
        />
        <input
          type="number"
          value={m.amount}
          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
          placeholder="Amount"
          className="input"
        />
        <input
          type="date"
          value={m.dueDate?.slice(0, 10)}
          onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
          className="input"
        />
        <button
          onClick={() => removeMilestone(i)}
          className="text-red-400 text-sm"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
);
function MilestoneSubmissionModal({ milestone, onClose }) {
  const [notes, setNotes] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const due = new Date(milestone.dueDate);
  const graceEnd = new Date(
    due.getTime() + milestone.gracePeriodDays * 24 * 60 * 60 * 1000,
  );

  const isOverdue = now > graceEnd;

  const handleSubmit = async () => {
    if (!notes) {
      alert("Work notes are required");
      return;
    }

    if (isOverdue && !delayReason) {
      alert("Delay reason is required as deadline is missed");
      return;
    }

    const formData = new FormData();
    formData.append("milestoneId", milestone._id);
    formData.append("notes", notes);
    if (isOverdue) formData.append("delayReason", delayReason);

    images.forEach((img) => formData.append("images", img));

    setSubmitting(true);
    try {
      const res = await fetch("/api/contractor/submit-milestone", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      alert("Milestone submitted successfully");
      location.reload();
    } catch {
      alert("Failed to submit milestone");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#14162d] w-full max-w-lg rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">
          Submit Milestone Proof
        </h2>

        <p className="text-sm text-gray-400">
          <strong>{milestone.title}</strong>
        </p>

        {/* Work Notes */}
        <textarea
          placeholder="Describe completed work"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#0f1224] border border-gray-700"
        />

        {/* Delay Reason */}
        {isOverdue && (
          <textarea
            placeholder="Reason for delay (mandatory)"
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0f1224] border border-red-500"
          />
        )}

      
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages([...e.target.files])}
          className="w-full text-sm text-gray-300"
        />

      
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 py-2 rounded-xl font-semibold"
          >
            Cancel
          </button>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 bg-white text-black py-2 rounded-xl font-semibold"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
