"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get("/api/public-issue");

        console.log(response.data);
        setIssues(response.data.issues);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchIssue();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const query = searchQuery.trim().toLowerCase();
    const locationText =
      issue.location?.placeName?.toLowerCase() ||
      issue.placename?.toLowerCase() ||
      "";
    const issueDate = issue.createdAt ? new Date(issue.createdAt) : null;
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    const matchesSearch =
      !query ||
      issue.issue_type?.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query) ||
      locationText.includes(query);
    const matchesLocation =
      !filterLocation.trim() ||
      locationText.includes(filterLocation.toLowerCase());
    const matchesStatus = !filterStatus || issue.status === filterStatus;
    const matchesDate =
      (!startDate || (issueDate && issueDate >= startDate)) &&
      (!endDate || (issueDate && issueDate <= endDate));

    return matchesSearch && matchesLocation && matchesStatus && matchesDate;
  });

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-[#22043e] to-[#04070f]" />
      <div className="relative md:p-6 p-3">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:text-3xl text-2xl font-bold mb-6 text-center"
        >
          Reported Issues
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-2xl mx-auto space-y-4"
        >
          <input
            type="text"
            placeholder="Search issues by type, description, or location..."
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
                    <option value="PENDING_VALIDATION">
                      Pending Validation
                    </option>
                    <option value="PUBLIC_VERIFIED">Public Verified</option>
                    <option value="GOV_REJECTED">Gov Rejected</option>
                    <option value="TENDER_CREATED">Tender Created</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </label>
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
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFilterLocation("");
                    setFilterStatus("");
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-slate-200 transition"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </motion.div>
        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-[#14162d8a] backdrop-blur-xl p-5 rounded-2xl animate-pulse border border-gray-800"
              >
                <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded-lg w-5/6"></div>
              </div>
            ))
          ) : filteredIssues.length > 0 ? (
            filteredIssues.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-[#14162d8a] backdrop-blur-xl md:p-5 p-3 rounded-2xl shadow-lg border border-gray-800 hover:border-gray-600 transition"
              >
                <h2 className="text-lg md:text-xl font-semibold">
                  {item.issue_type}
                </h2>

                <p className="text-gray-300 mt-2 max-md:hidden">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                  <span>
                    <strong>Location:</strong>{" "}
                    {item.location?.placeName || item.placename || "N/A"}
                  </span>
                  <span>
                    <strong>Date:</strong>{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(
                      `/gov-sec/issue-details?issue=${encodeURIComponent(JSON.stringify(item))}`,
                    )
                  }
                  className="mt-2 md:mt-4 bg-white text-black font-semibold px-6 py-2 rounded-xl hover:shadow-lg transition"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No issues found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
