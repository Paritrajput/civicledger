"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function TendersPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const filteredTenders = tenders.filter((tender) => {
    const query = searchQuery.trim().toLowerCase();
    const locationMatch =
      !filterLocation.trim() ||
      tender.location?.placeName
        ?.toLowerCase()
        ?.includes(filterLocation.toLowerCase());
    const statusMatch = !filterStatus || tender.status === filterStatus;
    const minValue = Number(filterMinValue) || 0;
    const maxValue = Number(filterMaxValue) || 0;
    const valueMatch =
      (!filterMinValue || tender.maxBidAmount >= minValue) &&
      (!filterMaxValue || tender.minBidAmount <= maxValue);
    const tenderDate = tender.bidOpeningDate
      ? new Date(tender.bidOpeningDate)
      : tender.createdAt
        ? new Date(tender.createdAt)
        : null;
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    const dateMatch =
      (!startDate || (tenderDate && tenderDate >= startDate)) &&
      (!endDate || (tenderDate && tenderDate <= endDate));
    const searchMatch =
      !query ||
      tender.title?.toLowerCase().includes(query) ||
      tender.category?.toLowerCase().includes(query) ||
      tender.location?.placeName?.toLowerCase()?.includes(query);

    return (
      locationMatch && statusMatch && valueMatch && dateMatch && searchMatch
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/tender/get-tender");
        setTenders(response.data);
      } catch (error) {
        console.error("Could not get tenders", error);
        setError("Could not get tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative md:p-6 p-3">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-6"
        >
          Active Tenders
        </motion.h1>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-3xl mx-auto space-y-4"
        >
          <input
            type="text"
            placeholder="Search by title, category or location..."
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
                  Min Value
                  <input
                    type="number"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  Max Value
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
                  Start Date
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#14162d8a] px-4 py-3 text-white focus:outline-none focus:border-gray-600"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  End Date
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
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredTenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenders.map((tender, index) => (
              <motion.div
                key={tender._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold">{tender.title}</h2>
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

                {/* Meta */}
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    <span className="text-gray-400">Category:</span>{" "}
                    {tender.category || "—"}
                  </p>
                  <p>
                    <span className="text-gray-400">Location:</span>{" "}
                    {tender.location?.placeName || "—"}
                  </p>
                  <p>
                    <span className="text-gray-400">Bid Window:</span>{" "}
                    {formatDate(tender.bidOpeningDate)} →{" "}
                    {formatDate(tender.bidClosingDate)}
                  </p>
                  <p>
                    <span className="text-gray-400">Budget:</span> ₹
                    {tender.minBidAmount} – ₹{tender.maxBidAmount}
                  </p>

                  <p>
                    <span className="text-gray-400">Documents:</span>{" "}
                    {tender.attachments?.length || 0}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(
                      `/gov-sec/bid-auth?tender=${encodeURIComponent(
                        JSON.stringify(tender),
                      )}`,
                    )
                  }
                  className="mt-4 w-full bg-white text-black py-2 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-300 text-lg">
            No Active Tenders
          </div>
        )}
      </div>
    </div>
  );
}
