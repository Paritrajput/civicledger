"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function TendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setFilterLocation("");
    setFilterStatus("");
    setFilterMinValue("");
    setFilterMaxValue("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender");
        setTenders(response.data);
      } catch (err) {
        console.error("Could not get tenders", err);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTenders = tenders.filter((tender) => {
    const query = searchQuery.trim().toLowerCase();
    const locationText = tender.location?.placeName?.toLowerCase() || "";
    const tenderDate = tender.bidClosingDate
      ? new Date(tender.bidClosingDate)
      : null;
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    const minValue = Number(filterMinValue) || 0;
    const maxValue = Number(filterMaxValue) || 0;

    const matchesSearch =
      !query ||
      tender.title?.toLowerCase().includes(query) ||
      tender.description?.toLowerCase().includes(query) ||
      locationText.includes(query);
    const matchesLocation =
      !filterLocation.trim() ||
      locationText.includes(filterLocation.toLowerCase());
    const matchesStatus = !filterStatus || tender.status === filterStatus;
    const matchesValue =
      (!filterMinValue || tender.maxBidAmount >= minValue) &&
      (!filterMaxValue || tender.minBidAmount <= maxValue);
    const matchesDate =
      (!startDate || (tenderDate && tenderDate >= startDate)) &&
      (!endDate || (tenderDate && tenderDate <= endDate));

    return (
      matchesSearch &&
      matchesLocation &&
      matchesStatus &&
      matchesValue &&
      matchesDate
    );
  });

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-4xl mx-auto p-4 md:p-6">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8 text-center"
        >
          Active Tenders
        </motion.h1>
        {tenders.length === 0 && !loading && (
          <p className="text-center text-gray-400 mt-10">
            No active tenders found.
          </p>
        )}

        {error && <p className="text-red-400 text-center mb-6">{error}</p>}
        {tenders.length > 0 && !loading &&  (
          <div className="mb-8 max-w-3xl mx-auto space-y-4">
            <input
              type="text"
              placeholder="Search tenders by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                {showFilters ? "Hide Filters" : "Apply Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="block text-sm text-gray-300">
                    Location
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                    />
                  </label>
                  <label className="block text-sm text-gray-300">
                    Status
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white focus:outline-none focus:border-gray-600"
                    >
                      <option value="">All statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="AWARDED">Awarded</option>
                      <option value="DRAFT">Draft</option>
                      <option value="BIDDING_CLOSED">Bidding Closed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>
                  <label className="block text-sm text-gray-300">
                    Minimum Budget
                    <input
                      type="number"
                      value={filterMinValue}
                      onChange={(e) => setFilterMinValue(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                    />
                  </label>
                  <label className="block text-sm text-gray-300">
                    Maximum Budget
                    <input
                      type="number"
                      value={filterMaxValue}
                      onChange={(e) => setFilterMaxValue(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                    />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm text-gray-300">
                    Closing After
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white focus:outline-none focus:border-gray-600"
                    />
                  </label>
                  <label className="block text-sm text-gray-300">
                    Closing Before
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white focus:outline-none focus:border-gray-600"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-slate-200 transition"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-5">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : filteredTenders.map((item, index) => (
                <TenderCard
                  key={index}
                  tender={item}
                  onClick={() =>
                    router.push(
                      `/contractor-sec/tender-desc?tender=${encodeURIComponent(
                        JSON.stringify(item),
                      )}`,
                    )
                  }
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function TenderCard({ tender, onClick }) {
  const deadline = new Date(tender.bidClosingDate);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg cursor-pointer border border-gray-800 hover:border-gray-600 transition"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold">{tender.title}</h2>

        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            tender.status === "OPEN"
              ? "bg-green-500 text-black"
              : "bg-gray-600 text-white"
          }`}
        >
          {tender.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 mt-2 line-clamp-2">{tender.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
        <p>
          <span className="text-gray-400">Budget:</span>{" "}
          <span className="font-medium">
            ₹{tender.minBidAmount} – ₹{tender.maxBidAmount}
          </span>
        </p>

        <p>
          <span className="text-gray-400">Location:</span>{" "}
          {tender.location?.placeName || "—"}
        </p>

        <p>
          <span className="text-gray-400">Closes:</span>{" "}
          {deadline.toLocaleDateString()}
        </p>

        <p>
          <span className="text-gray-400">Time left:</span>{" "}
          <span className={daysLeft <= 2 ? "text-red-400 font-semibold" : ""}>
            {daysLeft > 0 ? `${daysLeft} days` : "Closed"}
          </span>
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
        <span>
          Source: {tender.source === "ISSUE" ? "Public Issue" : "Direct Tender"}
        </span>

        <span>Docs: {tender.attachments?.length || 0}</span>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-800 animate-pulse">
      <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-700 rounded w-1/3" />
    </div>
  );
}
