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

  // Get user location
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
        setLoading(false);
      } catch (error) {
        console.error("Could not fetch contracts", error);
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);
//Distance Calculation (Haversine Formula)
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
        return distance <= 5000; // Within 5km radius
      });

      setFilteredContracts(nearbyContracts);
    }
  }, [userLocation, contracts]);

  return (
    <div className="relative p-4 md:p-6 text-white">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-center mb-6"
      >
        Contracts in your area
      </motion.h1>

      {error && <p className="text-red-500 text-center mb-6">{error}</p>}

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
          : filteredContracts.map((item, index) => (
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
                  <strong>Bid Amount:</strong> {item.bidAmount}
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(
                      `/public-sec/contract-voting?contract=${encodeURIComponent(
                        JSON.stringify(item),
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

      {!loading && filteredContracts.length === 0 && (
        <p className="text-gray-400 text-center py-10">No contracts found.</p>
      )}
    </div>
  );
}
