"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ContractDesc() {
  const searchParams = useSearchParams();
  const contractParam = searchParams.get("contract");
  const contractData = contractParam ? JSON.parse(contractParam) : null;

  const [paymentMade, setPaymentMade] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [otherText, setOtherText] = useState("");
  const [progress, setProgress] = useState("");
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const getPayments = async () => {
    try {
      const response = await fetch(
        `/api/payment/get-payments/${contractData.mongoContractId}`
      );
      const data = await response.json();
      if (data) setRequestedPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };

  useEffect(() => {
    if (contractData?.mongoContractId) {
      getPayments();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      paymentMade >
      contractData.contractAmount - contractData.paidAmound
    ) {
      alert("Requested amount exceeds remaining balance.");
      return;
    }

    const formData = new FormData();
    formData.append("contractorId", contractData.contractorMongoId);
    formData.append("contractorWallet", contractData.contractor);
    formData.append("contractId", contractData.mongoContractId);
    formData.append("bidAmount", contractData.contractAmount);
    formData.append("reason", otherText || selectedOption);
    formData.append("progress", progress);
    formData.append("paymentMade", paymentMade);
    formData.append("status", "Pending");
    if (imageFile) formData.append("workImage", imageFile);

    try {
      const response = await fetch("/api/payment/create-payment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert("Payment request submitted");
        setPaymentMade("");
        setSelectedOption("");
        setOtherText("");
        setProgress("");
        setImageFile(null);
        getPayments();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit payment request");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-4xl mx-auto p-4 md:p-6 space-y-10">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center"
        >
          Contract Payment Portal
        </motion.h1>

        {/* Contract Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            Contract Summary
          </h2>

          <InfoRow label="Project Title" value={contractData.projectTitle} />
          <InfoRow label="Contract ID" value={contractData.contractId} />
          <InfoRow
            label="Total Contract Amount"
            value={`₹${contractData.contractAmount}`}
          />
        </motion.div>

        {/* Request Payment */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-xl font-semibold text-center">
            Request Payment
          </h2>

          <SelectField
            label="Requirement"
            value={selectedOption}
            onChange={setSelectedOption}
            options={["rods", "sand", "cement", "other"]}
          />

          {selectedOption === "other" && (
            <InputField
              placeholder="Enter material"
              value={otherText}
              onChange={setOtherText}
            />
          )}

          <InputField
            label="Work Progress"
            value={progress}
            onChange={setProgress}
          />

          <FileField onChange={setImageFile} />

          <InputField
            label="Payment Required"
            type="number"
            value={paymentMade}
            onChange={setPaymentMade}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold"
          >
            Submit Payment Request
          </motion.button>
        </motion.form>

        {/* Pending Payments */}
        <PaymentsSection
          title="Pending Payment Requests"
          payments={requestedPayments.filter(
            (p) => p.status === "Pending"
          )}
        />

        {/* Payment History */}
        <PaymentsSection
          title="Payment History"
          payments={requestedPayments.filter(
            (p) => p.status === "Completed"
          )}
        />
      </div>
    </div>
  );
}

/* Components */

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-700 py-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      {label && (
        <label className="block text-gray-400 mb-1 text-sm">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-gray-500"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-gray-400 mb-1 text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#0f1224] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-gray-500"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileField({ onChange }) {
  return (
    <div>
      <label className="block text-gray-400 mb-1 text-sm">
        Upload Work Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files[0])}
        className="w-full px-3 py-2 bg-[#0f1224] border border-gray-700 rounded-xl text-white file:bg-white file:text-black file:px-3 file:py-1 file:rounded-lg file:border-0"
      />
    </div>
  );
}

function PaymentsSection({ title, payments }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">{title}</h2>

      {payments.length === 0 ? (
        <p className="text-gray-400 text-center">No records found</p>
      ) : (
        payments.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-4"
          >
            <InfoRow label="Bid Amount" value={`₹${p.bidAmount}`} />
            <InfoRow
              label="Requested Amount"
              value={`₹${p.paymentMade}`}
            />
            <InfoRow
              label="Remaining Amount"
              value={`₹${p.bidAmount - p.paymentMade}`}
            />
            <InfoRow
              label="Status"
              value={
                p.status === "Completed" ? (
                  <span className="text-green-400 font-semibold">
                    Completed
                  </span>
                ) : (
                  <span className="text-yellow-400 font-semibold">
                    Pending
                  </span>
                )
              }
            />
          </motion.div>
        ))
      )}
    </div>
  );
}
