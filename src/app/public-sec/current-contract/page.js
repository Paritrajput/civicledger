"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

export default function Page2() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
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
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => setError("Failed to get location"),
        { enableHighAccuracy: true },
      );
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get("/api/contracts/gov-contracts");
        setContracts(response.data);
        console.log("Fetched Contracts:", response.data);
        setLoading(false);
      } catch (error) {
        console.error("Could not fetch contracts", error);
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (userLocation && contracts.length > 0) {
      const nearbyContracts = contracts.filter((contract) => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          contract.location?.lat || 0,
          contract.location?.lng || 0,
        );
        return distance <= 50000; // Within 5km radius
      });

      setFilteredContracts(nearbyContracts);
    }
  }, [userLocation, contracts]);

  // Search filter
  const getDisplayedContracts = () => {
    const query = searchQuery.trim().toLowerCase();
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    return filteredContracts.filter((contract) => {
      const matchesSearch =
        !query ||
        contract.contractId?.toLowerCase().includes(query) ||
        contract.contractValue?.toString().includes(query) ||
        contract.description?.toLowerCase().includes(query);
      const matchesLocation =
        !filterLocation.trim() ||
        contract.location?.placeName
          ?.toLowerCase()
          ?.includes(filterLocation.toLowerCase());
      const matchesStatus = !filterStatus || contract.status === filterStatus;
      const minValue = Number(filterMinValue) || 0;
      const maxValue = Number(filterMaxValue) || 0;
      const matchesValue =
        (!filterMinValue || contract.contractValue >= minValue) &&
        (!filterMaxValue || contract.contractValue <= maxValue);
      const contractDate = contract.createdAt
        ? new Date(contract.createdAt)
        : null;
      const matchesDate =
        (!startDate || (contractDate && contractDate >= startDate)) &&
        (!endDate || (contractDate && contractDate <= endDate));

      return (
        matchesSearch &&
        matchesLocation &&
        matchesStatus &&
        matchesValue &&
        matchesDate
      );
    });
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get("/api/contracts/gov-contracts");
  //       setTenders(response.data);
  //     } catch (error) {
  //       console.error("Could not get tenders", error);
  //       setError("Could not get tenders");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* FIXED BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      {/* SCROLLABLE CONTENT */}
      <div className="relative p-4 md:p-6">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center mb-6"
        >
          Contracts in your area
        </motion.h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {/* Search Bar + Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <input
            type="text"
            placeholder="Search contracts by ID, value, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1224] text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-500 transition placeholder-gray-500"
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
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  Status
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white focus:outline-none focus:border-gray-500"
                  >
                    <option value="">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Completed">Completed</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </label>
                <label className="block text-sm text-gray-300">
                  Min Value
                  <input
                    type="number"
                    value={filterMinValue}
                    onChange={(e) => setFilterMinValue(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  Max Value
                  <input
                    type="number"
                    value={filterMaxValue}
                    onChange={(e) => setFilterMaxValue(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
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
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white focus:outline-none focus:border-gray-500"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  End Date
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-[#0f1224] px-4 py-3 text-white focus:outline-none focus:border-gray-500"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-xl bg-white text-black px-4 py-3 font-semibold hover:bg-slate-200 transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 animate-pulse"
                >
                  <div className="h-6 bg-gray-700 rounded-lg w-2/3 mb-4" />
                  <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-2" />
                  <div className="h-10 bg-gray-700 rounded-xl w-32 mt-4" />
                </div>
              ))
            : getDisplayedContracts().map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#14162d8a] backdrop-blur-xl p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
                >
                  <h2 className="text-lg md:text-xl font-semibold">
                    {item.contractId}
                  </h2>

                  <p className="text-gray-300 mt-2 text-sm">
                    <strong>Bid Amount:</strong> {item.contractValue}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push(
                        `/public-sec/contract-voting?contractId=${encodeURIComponent(
                          item._id,
                        )}`,
                      )
                    }
                    className="mt-5 px-5 py-2 bg-white text-black font-semibold rounded-xl transition"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
        </div>

        {!loading && getDisplayedContracts().length === 0 && (
          <p className="text-gray-400 text-center py-10">No contracts found.</p>
        )}
      </div>
    </div>
  );
}
