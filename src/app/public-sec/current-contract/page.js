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
    if (!searchQuery.trim()) return filteredContracts;

    return filteredContracts.filter(
      (contract) =>
        contract.contractId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        contract.bidAmount?.toString().includes(searchQuery) ||
        contract.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Search contracts by ID, bid amount, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1224] text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-500 transition placeholder-gray-500"
          />
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
