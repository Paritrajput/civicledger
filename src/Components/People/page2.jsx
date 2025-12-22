"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
        { enableHighAccuracy: true }
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
          contract.location?.lng || 0
        );
        return distance <= 5000; // Within 5km radius
      });

      setFilteredContracts(nearbyContracts);
    }
  }, [userLocation, contracts]);

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
    <div className="min-h-screen bg-[#060611] p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">
        Contracts in your area
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-lg shadow-md animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-10 bg-gray-700 rounded mt-4"></div>
              </div>
            ))
          : filteredContracts.map((item, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-lg shadow-md transition hover:scale-105 hover:bg-gray-800"
              >
                <h2 className="text-xl font-semibold text-teal-400">
                  {item.contractId}
                </h2>
                <p className="text-gray-400 mt-2">
                  Bid Amount: {item.bidAmount}
                </p>
                <button
                  onClick={() =>
                    router.push(
                      `/public-sec/contract-voting?contract=${encodeURIComponent(
                        JSON.stringify(item)
                      )}`
                    )
                  }
                  className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                >
                  View Details
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}
