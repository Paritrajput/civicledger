"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { useNotification } from "@/Context/NotificationContext";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
      <MilestonePage />
    </Suspense>
  );
}

function MilestonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract");

  const contract = contractParam ? JSON.parse(contractParam) : null;

  const [milestones, setMilestones] = useState(contract?.milestones || []);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    gracePeriodDays: "",
  });
  const {error, success, warning}=useNotification();

  const status = contract?.milestonePlanStatus;

  const totalAmount = useMemo(
    () =>
      milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0),
    [milestones]
  );


  const addMilestone = () => {
    setMilestones([...milestones, newMilestone]);
    setNewMilestone({ title: "", description: "", amount: "", dueDate: "", gracePeriodDays: "" });
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const submitMilestones = async () => {
    try {
      await axios.post("/api/contracts/milestones/gov-create", {
        contractId: contract._id,
        milestones,
      });
      success("Milestones sent to contractor");
      router.refresh();
    } catch {
      error("Failed to submit milestones");
    }
  };

  const finalizeMilestones = async () => {
    try {
      await axios.post("/api/contracts/milestones/gov-accept-counter", {
        contractId: contract._id,
      });
      success("Milestones finalized");
      router.refresh();
    } catch {
      error("Failed to finalize milestones");
    }
  };


  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
        >
          <h1 className="text-2xl font-bold">{contract.contractId}</h1>
          <p className="text-gray-300 mt-2">
            Milestone Status:{" "}
            <span className="font-semibold">{status}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Contract Value: ₹{contract.contractValue}
          </p>
        </motion.div>

        {status === "DRAFT" && (
          <div className="bg-[#14162d8a] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Create Milestones</h2>

            <div className="grid md:grid-cols-4 gap-3">
              <input
                placeholder="Title"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                className="input"
              />
              <input
                placeholder="Amount"
                type="number"
                value={newMilestone.amount}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, amount: e.target.value })
                }
                className="input"
              />
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                }
                className="input"
              />
                            <input
                type="date"
                value={newMilestone.gracePeriodDays}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, gracePeriodDays: e.target.value })
                }
                className="input"
              />
              <button
                onClick={addMilestone}
                className="bg-white text-black rounded-xl font-semibold"
              >
                Add
              </button>
            </div>

            <textarea
              placeholder="Description"
              value={newMilestone.description}
              onChange={(e) =>
                setNewMilestone({
                  ...newMilestone,
                  description: e.target.value,
                })
              }
              className="input"
            />

            {milestones.map((m, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-[#0f1224] p-4 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-gray-400">
                    ₹{m.amount} • {new Date(m.dueDate).toLocaleDateString()}
                  </p>
                  {/* <p className="text-sm text-gray-400">Grace Period:{m.gracePeriodDays}</p> */}
                </div>
                <button
                  onClick={() => removeMilestone(i)}
                  className="text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <p className="text-sm text-gray-400">
              Total: ₹{totalAmount}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={submitMilestones}
              disabled={totalAmount > contract.contractValue}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Submit Milestones
            </motion.button>
          </div>
        )}

  
        {["CONTRACTOR_REVIEW", "CONTRACTOR_PROPOSED"].includes(status) && (
          <InfoBox text="Waiting for contractor / review in progress" />
        )}

    
        {status === "GOV_REVIEW" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={finalizeMilestones}
            className="w-full bg-green-500 text-black py-3 rounded-xl font-semibold"
          >
            Finalize Milestones
          </motion.button>
        )}

     
        {status === "FINALIZED" && (
          <InfoBox text="Milestones locked. Monitoring & payments active." />
        )}
      </div>
    </div>
  );
}



function InfoBox({ text }) {
  return (
    <div className="bg-[#14162d8a] border border-gray-800 rounded-2xl p-6 text-center text-gray-300">
      {text}
    </div>
  );
}
